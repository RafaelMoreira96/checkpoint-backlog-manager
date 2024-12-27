package controllers

import (
	"github.com/gofiber/fiber/v2"
)

func StatsInfo(c *fiber.Ctx) error {
	//db := database.GetDatabase()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"registered_players": 1562,
		"beated_games":       1953,
		"hours_played":       1293,
	})
}
