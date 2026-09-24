package controllers

import (
	"math"
	"strconv"

	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/security"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type GameController struct {
	gameService *services.GameService
}

func NewGameController() *GameController {
	return &GameController{
		gameService: services.NewGameService(),
	}
}

// AddGame adiciona um novo jogo
func (c *GameController) AddGame(ctx *fiber.Ctx) error {
	playerID, err := security.GetPlayerTokenInfos(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "unauthorized player",
		})
	}

	var game models.Game
	if err := ctx.BodyParser(&game); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing game: " + err.Error(),
		})
	}

	game.PlayerID = playerID
	if err := c.gameService.AddGame(&game); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(game)
}

// GetBeatenList retorna a lista de jogos finalizados (com paginação opcional)
func (c *GameController) GetBeatenList(ctx *fiber.Ctx) error {
	playerID, err := security.GetPlayerTokenInfos(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "unauthorized player",
		})
	}

	page, _ := strconv.Atoi(ctx.Query("page", "0"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "0"))
	search := ctx.Query("search", "")

	games, total, err := c.gameService.GetBeatenList(playerID, page, limit, search)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	if page > 0 && limit > 0 {
		totalPages := int(math.Ceil(float64(total) / float64(limit)))
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
			"data": games,
			"pagination": fiber.Map{
				"current_page":  page,
				"per_page":      limit,
				"total_records": total,
				"total_pages":   totalPages,
			},
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(games)
}

// DeleteGame remove um jogo
func (c *GameController) DeleteGame(ctx *fiber.Ctx) error {
	playerID, err := security.GetPlayerTokenInfos(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "unauthorized player",
		})
	}
	gameID, err := strconv.ParseUint(ctx.Params("id_game"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid game ID",
		})
	}

	if err := c.gameService.DeleteGame(playerID, uint(gameID)); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusNoContent).JSON(fiber.Map{
		"message": "game deleted",
	})
}

// UpdateGame atualiza um jogo
func (c *GameController) UpdateGame(ctx *fiber.Ctx) error {
	playerID, err := security.GetPlayerTokenInfos(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "unauthorized player",
		})
	}
	gameID, err := strconv.ParseUint(ctx.Params("id_game"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid game ID",
		})
	}

	var updatedGame models.Game
	if err := ctx.BodyParser(&updatedGame); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing game: " + err.Error(),
		})
	}

	if err := c.gameService.UpdateGame(playerID, uint(gameID), &updatedGame); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(updatedGame)
}

// GetGame retorna um jogo pelo ID
func (c *GameController) GetGame(ctx *fiber.Ctx) error {
	playerID, err := security.GetPlayerTokenInfos(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "unauthorized player",
		})
	}
	gameID, err := strconv.ParseUint(ctx.Params("id_game"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid game ID",
		})
	}

	game, err := c.gameService.GetGame(playerID, uint(gameID))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(game)
}

// ImportGamesFromCSV importa jogos a partir de um arquivo CSV
func (c *GameController) ImportGamesFromCSV(ctx *fiber.Ctx) error {
	playerID, err := security.GetPlayerTokenInfos(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "unauthorized player",
		})
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error retrieving file: " + err.Error(),
		})
	}

	f, err := file.Open()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error opening file: " + err.Error(),
		})
	}
	defer f.Close()

	if err := c.gameService.ImportGamesFromCSV(playerID, f); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "games imported successfully",
	})
}
