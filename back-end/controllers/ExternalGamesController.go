package controllers

import (
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type ExternalGamesController struct {
	igdbService *services.IGDBService
}

func NewExternalGamesController() *ExternalGamesController {
	return &ExternalGamesController{
		igdbService: services.GetIGDBService(),
	}
}

// SearchGames busca jogos externamente via proxy seguro com a API do IGDB
func (c *ExternalGamesController) SearchGames(ctx *fiber.Ctx) error {
	query := ctx.Query("q")
	if query == "" {
		return ctx.Status(fiber.StatusOK).JSON([]services.IGDBGameDTO{})
	}

	results, err := c.igdbService.SearchGames(query)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Falha ao consultar catálogo de jogos externo",
			"details": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(results)
}
