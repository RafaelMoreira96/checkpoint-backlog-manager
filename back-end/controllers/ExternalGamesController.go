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

// SyncGenres sincroniza todos os gêneros do catálogo IGDB para o banco de dados
func (c *ExternalGamesController) SyncGenres(ctx *fiber.Ctx) error {
	count, err := c.igdbService.SyncGenresToDatabase()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Falha ao sincronizar gêneros do IGDB",
			"details": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Gêneros do IGDB sincronizados com sucesso",
		"count":   count,
	})
}

// SyncPlatforms sincroniza todas as plataformas/consoles do catálogo IGDB para o banco de dados
func (c *ExternalGamesController) SyncPlatforms(ctx *fiber.Ctx) error {
	count, err := c.igdbService.SyncPlatformsToDatabase()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Falha ao sincronizar consoles do IGDB",
			"details": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Plataformas/Consoles do IGDB sincronizados com sucesso",
		"count":   count,
	})
}

