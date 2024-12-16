package controllers

import (
	"encoding/csv"
	"io"
	"strconv"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
)

func AddConsole(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var console models.Console
	console.IsActive = true

	if err := c.BodyParser(&console); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing console",
		})
	}

	if console.ManufacturerID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Manufacturer ID not found",
		})
	}

	var manufacturer models.Manufacturer
	if err := db.Where("id_manufacturer = ?", console.ManufacturerID).First(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "manufacturer not found: " + err.Error(),
		})
	}

	var consoleDB models.Console
	if err := db.Where("name_console = ?", console.NameConsole).First(&consoleDB).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "console already exists",
		})
	}

	if err := db.Create(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error creating console",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(console)
}

func GetConsoles(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var consoles []models.Console

	if err := db.Preload("Manufacturer").Where("is_active = true").Find(&consoles).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error into find consoles",
		})
	}

	return c.Status(fiber.StatusOK).JSON(consoles)
}

func GetInactiveConsoles(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var consoles []models.Console

	if err := db.Preload("Manufacturer").Where("is_active = false").Find(&consoles).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error into find consoles",
		})
	}

	return c.Status(fiber.StatusOK).JSON(consoles)
}

func ViewConsole(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var console models.Console

	if err := db.Preload("Manufacturer").Where("id_console = ? ", c.Params("id")).First(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "ID not found" + c.Params("id"),
		})
	}

	return c.Status(fiber.StatusOK).JSON(console)
}

func UpdateConsole(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var console models.Console

	if err := db.Where("id_console = ?", c.Params("id")).First(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "console not found",
		})
	}

	var updatedConsole models.Console
	if err := c.BodyParser(&updatedConsole); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing console",
		})
	}

	if console.NameConsole != updatedConsole.NameConsole {
		var temporaryConsole models.Console
		if err := db.Where("name_console = ? AND id_console = ?", updatedConsole.NameConsole, c.Params("id")).First(&temporaryConsole).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "console already exists",
			})
		}
	}

	console.NameConsole = updatedConsole.NameConsole
	console.IsActive = updatedConsole.IsActive
	console.Manufacturer = updatedConsole.Manufacturer
	console.ReleaseDate = updatedConsole.ReleaseDate

	if err := db.Save(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error updating manufacturer: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(console)
}

func DeleteConsole(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var console models.Console

	if err := db.Where("id_console = ?", c.Params("id")).First(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "console not found. ID: " + c.Params("id"),
		})
	}

	console.IsActive = false
	if err := db.Save(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "console deleted",
	})
}

func ReactivateConsole(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var console models.Console

	if err := db.Where("id_console = ?", c.Params("id")).First(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "console not found. ID: " + c.Params("id"),
		})
	}

	console.IsActive = true
	if err := db.Save(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(console)
}

func ImportConsolesFromCSV(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error retrieving file: " + err.Error(),
		})
	}

	f, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error opening file: " + err.Error(),
		})
	}
	defer f.Close()

	reader := csv.NewReader(f)
	reader.Comma = ','
	reader.LazyQuotes = true
	db := database.GetDatabase()

	tx := db.Begin()
	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error starting transaction: " + tx.Error.Error(),
		})
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	recordIndex := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error reading CSV file: " + err.Error(),
			})
		}

		if recordIndex == 0 && strings.ToLower(record[0]) == "nome do console" {
			recordIndex++
			continue
		}

		if len(record) < 3 || record[0] == "" || record[1] == "" || record[2] == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "invalid record at line " + strconv.Itoa(recordIndex+1),
			})
		}

		consoleName := strings.TrimSpace(record[0])
		manufacturerName := strings.TrimSpace(record[1])

		releaseDate := strings.TrimSpace(record[2])

		var manufacturer models.Manufacturer
		if err := tx.Where("name_manufacturer = ?", manufacturerName).First(&manufacturer).Error; err != nil {
			errorLog := models.ErrorLog{
				ConsoleName:      consoleName,
				ManufacturerName: manufacturerName,
				ErrorMessage:     "manufacturer not found",
				LineNumber:       recordIndex + 1,
			}

			if err := tx.Create(&errorLog).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "error saving error log: " + err.Error(),
				})
			}

			recordIndex++
			continue
		}

		console := models.Console{
			NameConsole:    consoleName,
			ManufacturerID: manufacturer.IdManufacturer,
			ReleaseDate:    releaseDate,
			IsActive:       true,
		}

		if err := console.Validate(); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "validation error at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		if err := tx.Create(&console).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error inserting record at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		recordIndex++
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error committing transaction: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "consoles imported successfully",
	})
}
