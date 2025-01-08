package controllers

import (
	"sort"

	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
)

type ConsoleGameCount struct {
	ConsoleID         uint    `json:"console_id"`
	NameConsole       string  `json:"name_console"`
	GameCount         int     `json:"game_count"`
	PercentageConsole float64 `json:"percentage_console"`
}

type GenreGameCount struct {
	GenreID         uint    `json:"genre_id"`
	NameGenre       string  `json:"name_genre"`
	GenreCount      int     `json:"genre_count"`
	PercentageGenre float64 `json:"percentage_genre"`
}

type YearGameCount struct {
	Year           int     `json:"year"`
	YearCount      int     `json:"year_count"`
	PercentageYear float64 `json:"percentage_year"`
}

func BeatedByConsole(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)
	db := database.GetDatabase()

	var consoles []models.Console
	if err := db.Where("is_active = true").Find(&consoles).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching consoles",
		})
	}

	var consoleGameCounts []ConsoleGameCount
	var totalGames int

	for _, console := range consoles {
		var games []models.Game
		if err := db.Where("player_id = ?", playerID).Where("console_id = ?", console.IdConsole).Where("status = 0").Find(&games).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error fetching games",
			})
		}
		totalGames += len(games)
	}

	for _, console := range consoles {
		var games []models.Game
		if err := db.Where("player_id = ?", playerID).Where("console_id = ?", console.IdConsole).Where("status = 0").Find(&games).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error fetching games",
			})
		}

		count := len(games)
		percentage := 0.0
		if totalGames > 0 {
			percentage = float64(count) / float64(totalGames) * 100
		}

		consoleGameCounts = append(consoleGameCounts, ConsoleGameCount{
			ConsoleID:         console.IdConsole,
			NameConsole:       console.NameConsole,
			GameCount:         count,
			PercentageConsole: percentage,
		})
	}

	sort.Slice(consoleGameCounts, func(i, j int) bool {
		return consoleGameCounts[i].GameCount > consoleGameCounts[j].GameCount
	})

	return c.Status(fiber.StatusOK).JSON(consoleGameCounts)
}

func BeatedByGenre(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)
	db := database.GetDatabase()

	var genres []models.Genre
	if err := db.Where("is_active = true").Find(&genres).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching genres",
		})
	}

	var genreGameCounts []GenreGameCount
	var totalGames int

	for _, genre := range genres {
		var games []models.Game
		if err := db.Where("player_id = ?", playerID).Where("genre_id = ?", genre.IdGenre).Where("status = 0").Find(&games).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error fetching games",
			})
		}
		totalGames += len(games)
	}

	for _, genre := range genres {
		var games []models.Game
		if err := db.Where("player_id = ?", playerID).Where("genre_id = ?", genre.IdGenre).Where("status = 0").Find(&games).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error fetching games",
			})
		}

		count := len(games)
		percentage := 0.0
		if totalGames > 0 {
			percentage = float64(count) / float64(totalGames) * 100
		}

		genreGameCounts = append(genreGameCounts, GenreGameCount{
			GenreID:         genre.IdGenre,
			NameGenre:       genre.NameGenre,
			GenreCount:      count,
			PercentageGenre: percentage,
		})
	}

	sort.Slice(genreGameCounts, func(i, j int) bool {
		return genreGameCounts[i].GenreCount > genreGameCounts[j].GenreCount
	})

	return c.Status(fiber.StatusOK).JSON(genreGameCounts)
}

func BeatedByReleaseDate(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)
	db := database.GetDatabase()

	var games []models.Game
	if err := db.Where("player_id = ?", playerID).Where("status = 0").Find(&games).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching games",
		})
	}

	totalGames := len(games)

	yearGameCountMap := make(map[int]int)
	for _, game := range games {
		yearGameCountMap[game.ReleaseYear]++
	}

	var yearGameCounts []YearGameCount
	for year, count := range yearGameCountMap {
		percentage := 0.0
		if totalGames > 0 {
			percentage = float64(count) / float64(totalGames) * 100
		}

		yearGameCounts = append(yearGameCounts, YearGameCount{
			Year:           year,
			YearCount:      count,
			PercentageYear: percentage,
		})
	}

	sort.Slice(yearGameCounts, func(i, j int) bool {
		return yearGameCounts[i].Year > yearGameCounts[j].Year
	})

	return c.Status(fiber.StatusOK).JSON(yearGameCounts)
}
