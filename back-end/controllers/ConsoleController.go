package controllers

import (
	"strconv"

	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type ConsoleController struct {
	consoleService *services.ConsoleService
}

func NewConsoleController() *ConsoleController {
	return &ConsoleController{
		consoleService: services.NewConsoleService(),
	}
}

// AddConsole adiciona um novo console
func (c *ConsoleController) AddConsole(ctx *fiber.Ctx) error {
	var console models.Console
	if err := ctx.BodyParser(&console); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing console: " + err.Error(),
		})
	}

	if err := c.consoleService.AddConsole(&console); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(console)
}

// GetConsoles retorna todos os consoles ativos
func (c *ConsoleController) GetConsoles(ctx *fiber.Ctx) error {
	consoles, err := c.consoleService.GetConsoles()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(consoles)
}

// GetInactiveConsoles retorna todos os consoles inativos
func (c *ConsoleController) GetInactiveConsoles(ctx *fiber.Ctx) error {
	consoles, err := c.consoleService.GetInactiveConsoles()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(consoles)
}

// ViewConsole retorna um console pelo ID
func (c *ConsoleController) ViewConsole(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid console ID",
		})
	}

	console, err := c.consoleService.ViewConsole(uint(id))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(console)
}

// UpdateConsole atualiza um console pelo ID
func (c *ConsoleController) UpdateConsole(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid console ID",
		})
	}

	var updatedConsole models.Console
	if err := ctx.BodyParser(&updatedConsole); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing console: " + err.Error(),
		})
	}

	if err := c.consoleService.UpdateConsole(uint(id), &updatedConsole); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(updatedConsole)
}

// DeleteConsole desativa um console pelo ID
func (c *ConsoleController) DeleteConsole(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid console ID",
		})
	}

	if err := c.consoleService.DeleteConsole(uint(id)); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "console deleted",
	})
}

// ReactivateConsole reativa um console pelo ID
func (c *ConsoleController) ReactivateConsole(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid console ID",
		})
	}

	if err := c.consoleService.ReactivateConsole(uint(id)); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "console reactivated",
	})
}

// ImportConsolesFromCSV importa consoles a partir de um arquivo CSV
func (c *ConsoleController) ImportConsolesFromCSV(ctx *fiber.Ctx) error {
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

	if err := c.consoleService.ImportConsolesFromCSV(f); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "consoles imported successfully",
	})
}
