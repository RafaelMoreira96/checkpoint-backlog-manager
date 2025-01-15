package controllers_functions

import (
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func GetAdminTokenInfos(c *fiber.Ctx) (uint, error) {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return 0, fiber.NewError(fiber.StatusBadRequest, "error getting user id")
	}

	role := c.Locals("role").(string)
	if role != "admin" {
		return 0, fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	return userID, nil
}

func GetPlayerTokenInfos(c *fiber.Ctx) (uint, error) {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return 0, fiber.NewError(fiber.StatusBadRequest, "error getting user id")
	}

	role := c.Locals("role").(string)
	if role != "player" {
		return 0, fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	return userID, nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password string) (string, error) {
	return "", bcrypt.ErrMismatchedHashAndPassword
}
