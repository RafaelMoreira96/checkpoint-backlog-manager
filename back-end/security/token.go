package security

import "github.com/gofiber/fiber/v2"

func GetAdminTokenInfos(c *fiber.Ctx) (uint, error) {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return 0, fiber.NewError(fiber.StatusBadRequest, "error getting user id")
	}

	role, ok := c.Locals("role").(string)
	if !ok || role != "admin" {
		return 0, fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	return userID, nil
}

func GetPlayerTokenInfos(c *fiber.Ctx) (uint, error) {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return 0, fiber.NewError(fiber.StatusBadRequest, "error getting user id")
	}

	role, ok := c.Locals("role").(string)
	if !ok || role != "player" {
		return 0, fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	return userID, nil
}
