package controllers

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func AddAdministrator(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var administrator models.Administrator

	if err := c.BodyParser(&administrator); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing administrator: " + err.Error(),
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
	if err := db.Where("nickname = ? OR email = ?", administrator.Nickname, administrator.Email).First(&administratorDB).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "nickname or email already exists",
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

func ViewAdministratorById(c *fiber.Ctx) error {
	adminID, err := utils.GetAdminTokenInfos(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	db := database.GetDatabase()
	var administrator models.Administrator

	if err := db.Where("id_administrator = ? AND is_active = true", c.Params("id")).First(&administrator).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Administrator not found. ID: " + fmt.Sprint(adminID),
		})
	}

	return c.Status(fiber.StatusOK).JSON(administrator)
}

func ViewAdministratorProfile(c *fiber.Ctx) error {
	adminID, err := utils.GetAdminTokenInfos(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	db := database.GetDatabase()
	var administrator models.Administrator

	if err := db.Where("id_administrator = ? AND is_active = true", adminID).First(&administrator).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Administrator not found. ID: " + fmt.Sprint(adminID),
		})
	}

	return c.Status(fiber.StatusOK).JSON(administrator)
}

func ListAdministrators(c *fiber.Ctx) error {
	_, err := utils.GetAdminTokenInfos(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	db := database.GetDatabase()
	var administrators []models.Administrator

	if err := db.Where("is_active = true").Find(&administrators).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error getting administrators",
		})
	}

	return c.Status(fiber.StatusOK).JSON(administrators)
}

func deactivateAdministrator(c *fiber.Ctx, adminID uint) error {
	db := database.GetDatabase()
	var administrator models.Administrator

	if err := db.Where("id_administrator = ?", adminID).First(&administrator).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"message": "administrator not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error retrieving administrator",
		})
	}

	administrator.IsActive = false
	if err := db.Save(&administrator).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error deactivating administrator",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "administrator deactivated",
	})
}

func CancelAdministratorInProfile(c *fiber.Ctx) error {
	adminID, err := utils.GetAdminTokenInfos(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	return deactivateAdministrator(c, adminID)
}

func CancelAdministratorInList(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)

	adminID, err := strconv.ParseUint(c.Params("id"), 10, 0)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid administrator ID",
		})
	}

	return deactivateAdministrator(c, uint(adminID))
}

func UpdateAdministrator(c *fiber.Ctx) error {
	adminID, err := utils.GetAdminTokenInfos(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

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

func UpdateAdministratorById(c *fiber.Ctx) error {
	_, err := utils.GetAdminTokenInfos(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	db := database.GetDatabase()
	var administrator models.Administrator
	if err := c.BodyParser(&administrator); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing administrator",
		})
	}

	if administrator.IdAdministrator == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "administrator ID is required",
		})
	}

	var administratorDB models.Administrator
	if err := db.Where("id_administrator = ?", c.Params("id")).First(&administratorDB).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"message": "administrator not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error getting administrator",
		})
	}

	administratorDB.Name = administrator.Name
	administratorDB.Email = administrator.Email
	administratorDB.Nickname = administrator.Nickname
	administratorDB.AccessType = administrator.AccessType
	administratorDB.IsActive = administrator.IsActive

	if administrator.Password != administratorDB.Password {
		hashedPassword, err := utils.HashPassword(administrator.Password)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error hashing password",
			})
		}

		administratorDB.Password = hashedPassword
	}

	if err := db.Save(&administratorDB).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error updating administrator",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":       "administrator updated successfully",
		"administrator": administratorDB,
	})
}
