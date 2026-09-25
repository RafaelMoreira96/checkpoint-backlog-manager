package controllers

import (
	"errors"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/security"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type PlayerController struct {
	playerService *services.PlayerService
}

func NewPlayerController() *PlayerController {
	return &PlayerController{
		playerService: services.NewPlayerService(),
	}
}

// AddPlayer cria um novo jogador
func (c *PlayerController) AddPlayer(ctx *fiber.Ctx) error {
	var player models.Player
	if err := ctx.BodyParser(&player); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing player: " + err.Error(),
		})
	}

	if err := c.playerService.AddPlayer(&player); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(player)
}

// DeletePlayer desativa o jogador logado
func (c *PlayerController) DeletePlayer(ctx *fiber.Ctx) error {
	playerID, err := c.getPlayerIDFromToken(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	if err := c.playerService.DeletePlayer(playerID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "player deactivated",
	})
}

// UpdatePlayer atualiza o jogador logado
func (c *PlayerController) UpdatePlayer(ctx *fiber.Ctx) error {
	playerID, err := c.getPlayerIDFromToken(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	var input models.UpdatePlayerInput
	if err := ctx.BodyParser(&input); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing player input: " + err.Error(),
		})
	}

	player, err := c.playerService.UpdatePlayer(playerID, &input)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(player)
}

// GetPublicProfile retorna o perfil público de um jogador pelo nickname
func (c *PlayerController) GetPublicProfile(ctx *fiber.Ctx) error {
	nickname := ctx.Params("nickname")
	if strings.TrimSpace(nickname) == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "nickname é obrigatório",
		})
	}

	var viewerID uint
	authHeader := ctx.Get("Authorization")
	if authHeader != "" {
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return security.GetJWTSecret(), nil
		})
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				if uid, ok := claims["user_id"].(float64); ok {
					viewerID = uint(uid)
				}
			}
		}
	}

	profile, err := c.playerService.GetPublicProfile(nickname, viewerID)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(profile)
}

// ViewPlayerProfileInfo retorna o perfil do jogador logado
func (c *PlayerController) ViewPlayerProfileInfo(ctx *fiber.Ctx) error {
	playerID, err := c.getPlayerIDFromToken(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	player, finishedGames, backlogGames, err := c.playerService.ViewPlayerProfileInfo(playerID)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"player":                  player,
		"quantity_finished_games": finishedGames,
		"quantity_backlog_games":  backlogGames,
	})
}

// GetAllPlayers retorna todos os jogadores (para administradores)
func (c *PlayerController) GetAllPlayers(ctx *fiber.Ctx) error {
	players, err := c.playerService.GetAllPlayers()
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(players)
}

// RequestPasswordReset envia um e-mail de recuperação de senha
func (c *PlayerController) RequestPasswordReset(ctx *fiber.Ctx) error {
	var request struct {
		Email string `json:"email"`
	}

	if err := ctx.BodyParser(&request); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing request: " + err.Error(),
		})
	}

	if err := c.playerService.RequestPasswordReset(request.Email); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "password reset email sent",
	})
}

// ResetPassword redefine a senha do jogador com token de recuperação
func (c *PlayerController) ResetPassword(ctx *fiber.Ctx) error {
	var request struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}

	if err := ctx.BodyParser(&request); err != nil || request.Token == "" || request.NewPassword == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "token e new_password são campos obrigatórios",
		})
	}

	if err := c.playerService.ResetPassword(request.Token, request.NewPassword); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "senha redefinida com sucesso",
	})
}

// getPlayerIDFromToken extrai o ID do jogador do token JWT
func (c *PlayerController) getPlayerIDFromToken(ctx *fiber.Ctx) (uint, error) {
	playerID, ok := ctx.Locals("userID").(uint)
	if !ok {
		return 0, errors.New("invalid token")
	}
	return playerID, nil
}
