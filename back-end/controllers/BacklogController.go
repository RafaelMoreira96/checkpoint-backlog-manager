package controllers

import (
	"errors"

	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type BacklogController struct {
	backlogService *services.BacklogService
}

func NewBacklogController() *BacklogController {
	return &BacklogController{
		backlogService: services.NewBacklogService(),
	}
}

// AddBacklogGame adiciona um jogo ao backlog do jogador
func (c *BacklogController) AddBacklogGame(ctx *fiber.Ctx) error {
	playerID, err := c.getPlayerIDFromToken(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	var game models.Game
	if err := ctx.BodyParser(&game); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing game: " + err.Error(),
		})
	}

	if err := c.backlogService.AddBacklogGame(playerID, &game); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(game)
}

// ListBacklogGames lista os jogos no backlog do jogador
func (c *BacklogController) ListBacklogGames(ctx *fiber.Ctx) error {
	playerID, err := c.getPlayerIDFromToken(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	games, err := c.backlogService.ListBacklogGames(playerID)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(games)
}

// getPlayerIDFromToken extrai o ID do jogador do token JWT
func (c *BacklogController) getPlayerIDFromToken(ctx *fiber.Ctx) (uint, error) {
	playerID, ok := ctx.Locals("userID").(uint)
	if !ok {
		return 0, errors.New("invalid token")
	}
	return playerID, nil
}
