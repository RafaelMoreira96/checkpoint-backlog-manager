package controllers

import (
	"sort"
	"time"

	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
)

func LastGamesBeatingAdded(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var games []models.Game

	if err := db.Preload("Console").Preload("Genre").
		Where("player_id = ? AND status = 0", playerID).
		Order("date_beating DESC").
		Limit(5).
		Find(&games).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error into find games",
		})
	}

	return c.Status(fiber.StatusOK).JSON(games)
}

func LastGamesBacklogAdded(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var games []models.Game

	if err := db.Preload("Console").Preload("Genre").
		Where("player_id = ? AND status = 1", playerID).
		Order("created_at DESC").
		Limit(5).
		Find(&games).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error into find games",
		})
	}

	return c.Status(fiber.StatusOK).JSON(games)
}

func CardsInfo(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)
	db := database.GetDatabase()

	var games []models.Game
	if err := db.Preload("Genre").Where("player_id = ? AND status = 0", playerID).Find(&games).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching games",
		})
	}

	genreCount := make(map[uint]int)
	var totalHoursPlayed int
	var totalHoursPlayedThisMonth int
	var gamesFinishedThisMonth int
	totalGamesFinished := len(games)

	currentYear, currentMonth, _ := time.Now().Date()
	for _, game := range games {
		genreCount[game.GenreID]++
		totalHoursPlayed += int(game.TimeBeating)

		if game.DateBeating.Year() == currentYear && game.DateBeating.Month() == currentMonth {
			gamesFinishedThisMonth++
			totalHoursPlayedThisMonth += int(game.TimeBeating)
		}
	}

	var genres []models.Genre
	if err := db.Find(&genres).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching genres",
		})
	}

	type GenreStat struct {
		Name  string
		Count int
	}
	var stats []GenreStat
	for _, genre := range genres {
		stats = append(stats, GenreStat{
			Name:  genre.NameGenre,
			Count: genreCount[genre.IdGenre],
		})
	}

	sort.Slice(stats, func(i, j int) bool {
		return stats[i].Count > stats[j].Count
	})

	result := fiber.Map{
		"total_hours_played":            totalHoursPlayed,
		"games_finished_this_month":     gamesFinishedThisMonth,
		"total_hours_played_this_month": totalHoursPlayedThisMonth,
		"total_games_finished":          totalGamesFinished,
	}

	if len(stats) > 0 {
		result["most_used"] = stats[0].Name
	}
	if len(stats) > 1 {
		result["second_most_used"] = stats[1].Name
	}
	if len(stats) > 0 {
		result["least_used"] = stats[len(stats)-1].Name
	}

	return c.Status(fiber.StatusOK).JSON(result)
}
