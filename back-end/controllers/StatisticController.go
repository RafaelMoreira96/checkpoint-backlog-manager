package controllers

import (
	"strconv"

	"github.com/RafaelMoreira96/game-beating-project/security"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type StatsController struct {
	statsService *services.StatsService
}

func NewStatsController() *StatsController {
	return &StatsController{
		statsService: services.NewStatsService(),
	}
}

// BeatedStats retorna as estatísticas de jogos finalizados
func (c *StatsController) BeatedStats(ctx *fiber.Ctx) error {
	playerID, _ := security.GetPlayerTokenInfos(ctx)

	stats, err := c.statsService.GetBeatedStats(playerID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(stats)
}

func (c *StatsController) BeatedStatsByGenre(ctx *fiber.Ctx) error {
	playerID, _ := security.GetPlayerTokenInfos(ctx)
	genreIDStr := ctx.Params("genre_id")

	genreID, err := strconv.Atoi(genreIDStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid genre_id, it must be an integer",
		})
	}

	stats, err := c.statsService.GetBeatedStatsByGenre(playerID, genreID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(stats)
}

func (c *StatsController) BeatedStatsByConsole(ctx *fiber.Ctx) error {
	playerID, _ := security.GetPlayerTokenInfos(ctx)
	consoleIDStr := ctx.Params("console_id")

	consoleID, err := strconv.Atoi(consoleIDStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid console_id, it must be an integer",
		})
	}

	stats, err := c.statsService.GetBeatedStatsByConsole(playerID, consoleID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(stats)
}

func (c *StatsController) BeatedStatsByReleaseYear(ctx *fiber.Ctx) error {
	playerID, _ := security.GetPlayerTokenInfos(ctx)
	releaseYearStr := ctx.Params("release_year")

	releaseYear, err := strconv.Atoi(releaseYearStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid release_year, it must be an integer",
		})
	}

	stats, err := c.statsService.GetBeatedStatsByReleaseYear(playerID, releaseYear)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(stats)
}

func (c *StatsController) BeatedStatsByYear(ctx *fiber.Ctx) error {
	playerID, _ := security.GetPlayerTokenInfos(ctx)
	yearStr := ctx.Params("year")

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid year, it must be an integer",
		})
	}

	stats, err := c.statsService.GetBeatedStatsByYear(playerID, year)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(stats)
}
