package controllers

import (
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type AuthController struct {
	authService *services.AuthService
}

func NewAuthController() *AuthController {
	return &AuthController{
		authService: services.NewAuthService(),
	}
}

// LoginPlayer realiza o login de um jogador
func (c *AuthController) LoginPlayer(ctx *fiber.Ctx) error {
	var user struct {
		Nickname string `json:"nickname"`
		Password string `json:"password"`
	}

	if err := ctx.BodyParser(&user); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing user",
		})
	}

	token, err := c.authService.LoginPlayer(user.Nickname, user.Password)
	if err != nil {
		switch err.Error() {
		case "nickname and password are required":
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": err.Error(),
			})
		case "user not found", "credentials are not valid", "account deactivated":
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": err.Error(),
			})
		default:
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "internal server error",
			})
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
	})
}

// LoginAdmin realiza o login de um administrador
func (c *AuthController) LoginAdmin(ctx *fiber.Ctx) error {
	var user struct {
		Nickname string `json:"nickname"`
		Password string `json:"password"`
	}

	if err := ctx.BodyParser(&user); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing user",
		})
	}

	token, err := c.authService.LoginAdmin(user.Nickname, user.Password)
	if err != nil {
		switch err.Error() {
		case "nickname and password are required":
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": err.Error(),
			})
		case "user not found", "credentials are not valid", "account deactivated":
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": err.Error(),
			})
		default:
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "internal server error",
			})
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
	})
}
