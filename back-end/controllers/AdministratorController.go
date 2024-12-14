package controllers

import (
	"fmt"

	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func AddAdministrator(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var administrator models.Administrator

	if err := c.BodyParser(&administrator); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing administrator",
		})
	}

	if administrator.Nickname == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "insert a nickname",
		})
	}

	if administrator.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "insert a password",
		})
	}

	hashedPassword, err := utils.HashPassword(administrator.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error hashing password",
		})
	}

	administrator.Password = hashedPassword
	var administratorDB models.Administrator
	if err := db.Where("nickname = ?", administrator.Nickname).First(&administratorDB).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "administrator already exists",
		})
	}

	if err := db.Where("email = ?", administrator.Email).First(&administratorDB).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "email already exists",
		})
	}

	administrator.IsActive = true
	if err := db.Create(&administrator).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error creating administrator",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(administrator)
}

/* Into administrator account functions */
func ViewAdministratorProfile(c *fiber.Ctx) error {
	adminID, _ := utils.GetAdminTokenInfos(c)

	db := database.GetDatabase()
	var administrator models.Administrator

	if err := db.Where("id_administrator = ? AND is_active = 1", adminID).First(&administrator).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Administrator not found. ID: " + fmt.Sprint(adminID),
		})
	}

	return c.Status(fiber.StatusOK).JSON(administrator)
}

func ListAdministrators(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)

	db := database.GetDatabase()
	var administrators []models.Administrator

	if err := db.Where("is_active = true").Find(&administrators).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error getting administrators",
		})
	}

	return c.Status(fiber.StatusOK).JSON(administrators)
}

func CancelAdministratorInProfile(c *fiber.Ctx) error {
	adminID, _ := utils.GetAdminTokenInfos(c)

	db := database.GetDatabase()
	var administrator models.Administrator

	if err := db.Where("id_administrator = ?", adminID).First(&administrator).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "administrator not found" + err.Error(),
		})
	}

	administrator.IsActive = false
	if err := db.Save(&administrator).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error deleting admin: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "administrator deleted",
	})
}

func CancelAdministratorInList(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)

	db := database.GetDatabase()
	var administrator models.Administrator

	if err := db.Where("id_administrator = ?", c.Params("id")).First(&administrator).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "administrator not found" + err.Error(),
		})
	}

	administrator.IsActive = false
	if err := db.Save(&administrator).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error deleting admin: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "administrator deleted",
	})
}

func UpdateAdministrator(c *fiber.Ctx) error {
	adminID, _ := utils.GetAdminTokenInfos(c)

	db := database.GetDatabase()
	var administrator models.Administrator

	if err := db.Where("id_administrator = ?", adminID).First(&administrator).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Administrator not found. ID: " + fmt.Sprint(adminID),
		})
	}

	var updatedAdministrator models.Administrator
	if err := c.BodyParser(&updatedAdministrator); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Error parsing request body",
		})
	}

	if administrator.Name != updatedAdministrator.Name {
		var tempAdmin models.Administrator
		if err := db.Where("name = ? AND id_administrator != ?", updatedAdministrator.Name, adminID).First(&tempAdmin).Error; err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"message": "Administrator with this name already exists",
			})
		}
	}

	administrator.Name = updatedAdministrator.Name
	administrator.Email = updatedAdministrator.Email
	administrator.Nickname = updatedAdministrator.Nickname
	administrator.Password = updatedAdministrator.Password

	if updatedAdministrator.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updatedAdministrator.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Error hashing password",
			})
		}
		administrator.Password = string(hashedPassword)
	}

	if err := db.Save(&administrator).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error updating administrator: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(administrator)
}
