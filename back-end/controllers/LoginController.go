package controllers

import (
	"errors"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/utils"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	Nickname string `json:"nickname"`
	Password string `json:"password"`
}

func LoginPlayer(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var user User

	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing user",
		})
	}

	if user.Nickname == "" || user.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "nickname and password are required",
		})
	}

	var player models.Player
	if err := db.Where("nickname = ?", user.Nickname).First(&player).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "user not found",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(player.Password), []byte(user.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "credentials are not valid",
		})
	}

	if !player.IsActive {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "account deactivated",
		})
	}

	token, err := utils.GenerateJWT(player.IdPlayer, "player", 2)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error generating token",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
	})
}

func LoginAdmin(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var user User

	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing user",
		})
	}

	user.Nickname = strings.TrimSpace(user.Nickname)
	user.Password = strings.TrimSpace(user.Password)

	if user.Nickname == "" || user.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "nickname and password are required",
		})
	}

	var administrator models.Administrator
	if err := db.Where("nickname = ?", user.Nickname).First(&administrator).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"message": "user not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "internal server error",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(administrator.Password), []byte(user.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "credentials are not valid",
		})
	}

	if !administrator.IsActive {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "account deactivated",
		})
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(administrator.IdAdministrator, "admin", int(administrator.AccessType))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error generating token",
		})
	}

	// Return success response
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
	})
}
