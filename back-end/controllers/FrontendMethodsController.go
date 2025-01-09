package controllers

import (
	"sort"
	"time"

	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
)

/* ------------------------------------------------------------------------------
 * ------------------------------ Player methods --------------------------------
 * ------------------------------------------------------------------------------ */
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
	var totalHoursPlayed float64
	var totalHoursPlayedThisMonth float64
	var gamesFinishedThisMonth int
	totalGamesFinished := len(games)

	currentYear, currentMonth, _ := time.Now().Date()
	for _, game := range games {
		if game.GenreID != nil {
			genreCount[*game.GenreID]++
		}

		totalHoursPlayed += game.TimeBeating

		if game.DateBeating.Year() == currentYear && game.DateBeating.Month() == currentMonth {
			gamesFinishedThisMonth++
			totalHoursPlayedThisMonth += game.TimeBeating
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

/* ------------------------------------------------------------------------------
 * ------------------------------ Admin methods --------------------------------
 * ------------------------------------------------------------------------------ */
func LastPlayersRegistered(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var players []models.Player

	if err := db.Where("is_active = true").Order("created_at DESC").Limit(5).Find(&players).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching players",
		})
	}

	var result []map[string]interface{}
	for _, player := range players {
		result = append(result, map[string]interface{}{
			"name_player": player.NamePlayer,
			"nickname":    player.Nickname,
			"created_at":  player.CreatedAt,
		})
	}

	return c.Status(fiber.StatusOK).JSON(result)
}

func LastAdminsRegistered(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var administrators []models.Administrator

	if err := db.Where("is_active = true").Order("created_at DESC").Limit(5).Find(&administrators).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching administrators",
		})
	}

	var result []map[string]interface{}
	for _, admin := range administrators {
		result = append(result, map[string]interface{}{
			"name_administrator": admin.Name,
			"nickname":           admin.Nickname,
			"created_at":         admin.CreatedAt,
		})
	}

	return c.Status(fiber.StatusOK).JSON(result)
}

func AdminCardsInfo(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()

	// Função auxiliar para contagem genérica
	countEntities := func(model interface{}, condition string) (int, error) {
		var count int64
		if err := db.Model(model).Where(condition).Count(&count).Error; err != nil {
			return 0, err
		}
		return int(count), nil
	}

	var games []models.Game
	if err := db.Where("status = 0").Find(&games).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching games",
		})
	}
	gamesCount := len(games)

	genreCount, err := countEntities(&models.Genre{}, "is_active = true")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching genres",
		})
	}

	consoleCount, err := countEntities(&models.Console{}, "is_active = true")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching consoles",
		})
	}

	manufacturerCount, err := countEntities(&models.Manufacturer{}, "is_active = true")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching manufacturers",
		})
	}

	playerCount, err := countEntities(&models.Player{}, "is_active = true")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching players",
		})
	}

	administratorCount, err := countEntities(&models.Administrator{}, "is_active = true")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching administrators",
		})
	}

	// Construção da resposta
	result := fiber.Map{
		"total_games":          gamesCount,
		"total_genres":         genreCount,
		"total_consoles":       consoleCount,
		"total_manufacturers":  manufacturerCount,
		"total_players":        playerCount,
		"total_administrators": administratorCount,
	}

	return c.Status(fiber.StatusOK).JSON(result)
}
