package controllers

import (
	"time"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/utils"
	"github.com/gofiber/fiber/v2"
)

type LandingStats struct {
	RegisteredPlayers int64   `json:"registered_players"`
	BeatedGames       int64   `json:"beated_games"`
	HoursPlayed       float64 `json:"hours_played"`
}

func StatsInfo(c *fiber.Ctx) error {
	cacheKey := "landing_stats"
	if cached, ok := utils.GetCache().Get(cacheKey); ok {
		if stats, ok := cached.(LandingStats); ok {
			return c.Status(fiber.StatusOK).JSON(stats)
		}
	}

	db := database.GetDatabase()

	var registeredPlayers int64
	db.Model(&models.Player{}).Count(&registeredPlayers)

	var beatedGames int64
	db.Model(&models.Game{}).Where("status = ?", models.Beaten).Count(&beatedGames)

	var hoursPlayed float64
	db.Model(&models.Game{}).
		Select("COALESCE(SUM(time_beating), 0)").
		Where("status = ?", models.Beaten).
		Scan(&hoursPlayed)

	stats := LandingStats{
		RegisteredPlayers: registeredPlayers,
		BeatedGames:       beatedGames,
		HoursPlayed:       hoursPlayed,
	}

	utils.GetCache().Set(cacheKey, stats, 5*time.Minute)

	return c.Status(fiber.StatusOK).JSON(stats)
}
