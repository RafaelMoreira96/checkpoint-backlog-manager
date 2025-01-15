package controllers

import (
	"errors"
	"strconv"

	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type AdministratorController struct {
	adminService *services.AdministratorService
}

func NewAdministratorController() *AdministratorController {
	return &AdministratorController{
		adminService: services.NewAdministratorService(),
	}
}

// AddAdministrator cria um novo administrador
func (c *AdministratorController) AddAdministrator(ctx *fiber.Ctx) error {
	var administrator models.Administrator
	if err := ctx.BodyParser(&administrator); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing administrator: " + err.Error(),
		})
	}

	if err := c.adminService.AddAdministrator(&administrator); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(administrator)
}

// ViewAdministratorById retorna um administrador pelo ID
func (c *AdministratorController) ViewAdministratorById(ctx *fiber.Ctx) error {
	adminID, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid administrator ID",
		})
	}

	administrator, err := c.adminService.GetAdministratorByID(uint(adminID))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(administrator)
}

// ViewAdministratorProfile retorna o perfil do administrador logado
func (c *AdministratorController) ViewAdministratorProfile(ctx *fiber.Ctx) error {
	adminID, err := c.getAdminIDFromToken(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	administrator, err := c.adminService.GetAdministratorByID(adminID)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(administrator)
}

// ListAdministrators retorna uma lista de todos os administradores ativos
func (c *AdministratorController) ListAdministrators(ctx *fiber.Ctx) error {
	administrators, err := c.adminService.ListAdministrators()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(administrators)
}

// CancelAdministratorInProfile desativa o administrador logado
func (c *AdministratorController) CancelAdministratorInProfile(ctx *fiber.Ctx) error {
	adminID, err := c.getAdminIDFromToken(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	if err := c.adminService.DeactivateAdministrator(adminID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "administrator deactivated",
	})
}

// CancelAdministratorInList desativa um administrador pelo ID
func (c *AdministratorController) CancelAdministratorInList(ctx *fiber.Ctx) error {
	adminID, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid administrator ID",
		})
	}

	if err := c.adminService.DeactivateAdministrator(uint(adminID)); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "administrator deactivated",
	})
}

// UpdateAdministrator atualiza o administrador logado
func (c *AdministratorController) UpdateAdministrator(ctx *fiber.Ctx) error {
	adminID, err := c.getAdminIDFromToken(ctx)
	if err != nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "invalid token",
		})
	}

	var updatedAdmin models.Administrator
	if err := ctx.BodyParser(&updatedAdmin); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing request body",
		})
	}

	if err := c.adminService.UpdateAdministrator(adminID, &updatedAdmin); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(updatedAdmin)
}

// UpdateAdministratorById atualiza um administrador pelo ID
func (c *AdministratorController) UpdateAdministratorById(ctx *fiber.Ctx) error {
	adminID, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid administrator ID",
		})
	}

	var updatedAdmin models.Administrator
	if err := ctx.BodyParser(&updatedAdmin); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing request body",
		})
	}

	if err := c.adminService.UpdateAdministrator(uint(adminID), &updatedAdmin); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(updatedAdmin)
}

// getAdminIDFromToken extrai o ID do administrador do token JWT
func (c *AdministratorController) getAdminIDFromToken(ctx *fiber.Ctx) (uint, error) {
	adminID, ok := ctx.Locals("userID").(uint)
	if !ok {
		return 0, errors.New("invalid token")
	}
	return adminID, nil
}
