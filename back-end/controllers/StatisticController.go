package controllers

import (
	"github.com/RafaelMoreira96/game-beating-project/controllers/controllers_functions"
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
	playerID, _ := controllers_functions.GetPlayerTokenInfos(ctx)

	stats, err := c.statsService.GetBeatedStats(playerID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(stats)
}
