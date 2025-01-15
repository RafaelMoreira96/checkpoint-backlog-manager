package controllers

import (
	"github.com/RafaelMoreira96/game-beating-project/controllers/controllers_functions"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type DashboardController struct {
	dashboardService *services.DashboardService
}

func NewDashboardController() *DashboardController {
	return &DashboardController{
		dashboardService: services.NewDashboardService(),
	}
}

// LastGamesBeatingAdded retorna os últimos jogos finalizados por um jogador
func (c *DashboardController) LastGamesBeatingAdded(ctx *fiber.Ctx) error {
	playerID, _ := controllers_functions.GetPlayerTokenInfos(ctx)

	games, err := c.dashboardService.GetLastGamesBeatingAdded(playerID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching games",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(games)
}

// LastGamesBacklogAdded retorna os últimos jogos adicionados ao backlog por um jogador
func (c *DashboardController) LastGamesBacklogAdded(ctx *fiber.Ctx) error {
	playerID, _ := controllers_functions.GetPlayerTokenInfos(ctx)

	games, err := c.dashboardService.GetLastGamesBacklogAdded(playerID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching games",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(games)
}

// CardsInfo retorna as estatísticas do jogador
func (c *DashboardController) CardsInfo(ctx *fiber.Ctx) error {
	playerID, _ := controllers_functions.GetPlayerTokenInfos(ctx)

	stats, err := c.dashboardService.GetCardsInfo(playerID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching stats",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(stats)
}

// LastPlayersRegistered retorna os últimos jogadores registrados
func (c *DashboardController) LastPlayersRegistered(ctx *fiber.Ctx) error {
	players, err := c.dashboardService.GetLastPlayersRegistered()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching players",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(players)
}

// LastAdminsRegistered retorna os últimos administradores registrados
func (c *DashboardController) LastAdminsRegistered(ctx *fiber.Ctx) error {
	admins, err := c.dashboardService.GetLastAdminsRegistered()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching admins",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(admins)
}

// AdminCardsInfo retorna as estatísticas do painel de administração
func (c *DashboardController) AdminCardsInfo(ctx *fiber.Ctx) error {
	stats, err := c.dashboardService.GetAdminCardsInfo()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error fetching admin stats",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(stats)
}
