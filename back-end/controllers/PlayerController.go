package controllers

import (
	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
)

func AddPlayer(c *fiber.Ctx) error {
	db := database.GetDatabase()
	var player models.Player
	player.IsActive = true

	if err := c.BodyParser(&player); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing player",
		})
	}

	if player.NamePlayer == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "insert a player name",
		})
	}

	if player.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "password is required",
		})
	}

	hashedPassword, err := utils.HashPassword(player.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error hashing password",
		})
	}

	player.Password = hashedPassword
	var playerDB models.Player
	if err := db.Where("nickname = ?", player.Nickname).First(&playerDB).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "nickname already exists",
		})
	}

	if err := db.Create(&player).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error creating player",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(player)
}

/* Into player account functions */
func ViewPlayerProfile(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var player models.Player

	if err := db.Where("id_player = ?", playerID).First(&player).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "player not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(player)
}

func DeletePlayer(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var player models.Player

	if err := db.Where("id_player = ?", playerID).First(&player).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "player not found" + err.Error(),
		})
	}

	player.IsActive = false
	if err := db.Save(&player).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error deleting player: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "player deleted",
	})
}

/* For administrator account methods */
func GetAllPlayers(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)

	db := database.GetDatabase()
	var players []models.Player
	if err := db.Find(&players).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching players",
		})
	}

	return c.Status(fiber.StatusOK).JSON(players)
}
