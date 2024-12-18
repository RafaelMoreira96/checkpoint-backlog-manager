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
func ViewPlayerProfileInfo(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var player models.Player

	if err := db.Where("id_player = ?", playerID).First(&player).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "player not found",
		})
	}

	var games []models.Game
	if err := db.Where("player_id =?", playerID).Find(&games).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error getting backlog games",
		})
	}

	finished_games := 0
	backlog_games := 0
	for i := 0; i < len(games); i++ {
		if games[i].Status == 0 {
			finished_games += 1
		} else {
			backlog_games += 1
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"player":                  player,
		"quantity_finished_games": finished_games,
		"quantity_backlog_games":  backlog_games,
	})
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

func UpdatePlayer(c *fiber.Ctx) error {
	playerID, err := utils.GetPlayerTokenInfos(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid or missing token",
		})
	}

	db := database.GetDatabase()
	if db == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "database connection error",
		})
	}

	var player models.Player
	if err := db.Where("id_player =?", playerID).First(&player).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "player not found",
		})
	}

	var updatedPlayer models.Player
	if err := c.BodyParser(&updatedPlayer); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing player",
		})
	}

	if updatedPlayer.NamePlayer != "" {
		player.NamePlayer = updatedPlayer.NamePlayer
	}

	if updatedPlayer.Nickname != "" {
		var playerDB models.Player
		if err := db.Where("nickname = ?", updatedPlayer.Nickname).First(&playerDB).Error; err == nil && playerDB.IdPlayer != player.IdPlayer {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "nickname already exists",
			})
		}
		player.Nickname = updatedPlayer.Nickname
	}

	if updatedPlayer.Password != "" {
		hashedPassword, err := utils.HashPassword(updatedPlayer.Password)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error hashing password",
			})
		}
		player.Password = hashedPassword
	}

	if err := db.Save(&player).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error updating player",
		})
	}

	player.Password = ""
	return c.Status(fiber.StatusOK).JSON(player)
}
