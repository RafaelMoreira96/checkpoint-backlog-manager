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

func AddManufacturer(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var manufacturer models.Manufacturer
	manufacturer.IsActive = true

	if err := c.BodyParser(&manufacturer); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing manufacturer: " + err.Error(),
		})
	}

	if manufacturer.NameManufacturer == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "insert a manufacturer name",
		})
	}

	if manufacturer.YearFounded == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "insert a valid release year",
		})
	}

	var manufacturerDB models.Manufacturer
	if err := db.Where("name_manufacturer = ?", manufacturer.NameManufacturer).First(&manufacturerDB).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "manufacturer already exists",
		})
	}

	if err := db.Create(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error creating manufacturer: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(manufacturer)
}

func ListAllManufacturers(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var manufacturers []models.Manufacturer

	if err := db.Where("is_active = true").Order("name_manufacturer ASC").Find(&manufacturers).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(manufacturers)
	}

	return c.Status(fiber.StatusOK).JSON(manufacturers)
}

func ListDeactivateManufacturers(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var manufacturers []models.Manufacturer

	if err := db.Where("is_active = false").Order("name_manufacturer ASC").Find(&manufacturers).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(manufacturers)
	}

	return c.Status(fiber.StatusOK).JSON(manufacturers)
}

func ViewManufacturer(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var manufacturer models.Manufacturer

	if err := db.Where("id_manufacturer = ?", c.Params("id")).First(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "manufacturer not found. ID: " + c.Params("id"),
		})
	}

	return c.Status(fiber.StatusOK).JSON(manufacturer)
}

func UpdateManufacturer(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()

	var manufacturer models.Manufacturer
	if err := db.Where("id_manufacturer = ?", c.Params("id")).First(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "manufacturer not found. ID: " + c.Params("id"),
		})
	}

	var updatedManufacturer models.Manufacturer
	if err := c.BodyParser(&updatedManufacturer); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing manufacturer: " + err.Error(),
		})
	}

	if manufacturer.NameManufacturer != updatedManufacturer.NameManufacturer {
		var temporaryManufacturer models.Manufacturer
		if err := db.Where("name_manufacturer = ? AND id_manufacturer != ?", updatedManufacturer.NameManufacturer, c.Params("id")).First(&temporaryManufacturer).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "manufacturer already exists",
			})
		}
	}

	manufacturer.IsActive = updatedManufacturer.IsActive
	manufacturer.NameManufacturer = updatedManufacturer.NameManufacturer
	manufacturer.YearFounded = updatedManufacturer.YearFounded

	if err := db.Save(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error updating manufacturer: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(manufacturer)

}

func DeleteManufacturer(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var manufacturer models.Manufacturer

	if err := db.Where("id_manufacturer = ?", c.Params("id")).First(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "manufacturer not found. ID: " + c.Params("id"),
		})
	}

	manufacturer.IsActive = false
	if err := db.Save(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "manufacturer deleted",
	})
}

func ReactivateManufacturer(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var manufacturer models.Manufacturer

	if err := db.Where("id_manufacturer = ?", c.Params("id")).First(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "manufacturer not found. ID: " + c.Params("id"),
		})
	}

	manufacturer.IsActive = true
	if err := db.Save(&manufacturer).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error: " + err.Error(),
		})
	}

	return nil
}

func ImportManufacturersFromCSV(c *fiber.Ctx) error {
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
	seenManufacturers := make(map[string]struct{})
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error reading CSV file: " + err.Error(),
			})
		}

		if recordIndex == 0 && strings.ToLower(record[0]) == "fabricante" {
			recordIndex++
			continue
		}

		if len(record) < 2 || record[0] == "" || record[1] == "" {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "invalid record at line " + strconv.Itoa(recordIndex+1),
			})
		}

		manufacturerName := strings.TrimSpace(record[0])

		yearFounded, err := strconv.Atoi(strings.TrimSpace(record[1]))
		if err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "invalid year format at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		if _, exists := seenManufacturers[manufacturerName]; exists {
			recordIndex++
			continue
		}
		seenManufacturers[manufacturerName] = struct{}{}

		manufacturer := models.Manufacturer{
			NameManufacturer: manufacturerName,
			YearFounded:      yearFounded,
			IsActive:         true,
		}

		if err := manufacturer.Validate(); err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "validation error at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		var existingManufacturer models.Manufacturer
		if err := tx.Where("name_manufacturer = ?", manufacturer.NameManufacturer).First(&existingManufacturer).Error; err == nil {
			recordIndex++
			continue
		}

		if err := tx.Create(&manufacturer).Error; err != nil {
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
		"message": "game manufacturers imported successfully",
	})
}
