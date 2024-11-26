package controllers

import (
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
)

func AddGame(c *fiber.Ctx) error {
	playerID, ok := c.Locals("playerID").(uint)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error getting player id",
		})
	}

	db := database.GetDatabase()
	var game models.Game

	if err := c.BodyParser(&game); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing game",
		})
	}

	if game.NameGame == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "insert a game name",
		})
	}

	var genre models.Genre
	if err := db.Where("id_genre = ?", game.GenreID).First(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre not found",
		})
	}

	var console models.Console
	if err := db.Where("id_console = ?", game.ConsoleID).First(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "console not found",
		})
	}

	var player models.Player
	if err := db.Where("id_player = ?", game.PlayerID).First(&player).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "player not found",
		})
	}

	game.PlayerID = playerID

	if err := db.Create(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error creating game",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(game)
}

func GetBeatenList(c *fiber.Ctx) error {
	db := database.GetDatabase()

	playerID := c.Locals("playerID").(uint)
	if playerID == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Player ID not found in token",
		})
	}

	var games []models.Game
	if err := db.Where("player_id = ?", playerID).Find(&games).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error into find games",
		})
	}

	return c.Status(fiber.StatusOK).JSON(games)
}

func DeleteGame(c *fiber.Ctx) error {
	playerID, ok := c.Locals("playerID").(uint)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error getting player id",
		})
	}

	db := database.GetDatabase()
	var game models.Game

	if err := db.Where("id_game = ? AND player_id = ?", c.Params("id_game"), playerID).First(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error deleting game: " + err.Error(),
		})
	}

	if err := db.Delete(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error deleting game: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusNoContent).JSON(fiber.Map{
		"message": "game deleted",
	})
}
