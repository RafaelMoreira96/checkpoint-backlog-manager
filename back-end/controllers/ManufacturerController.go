package controllers

import (
	"strconv"

	"github.com/RafaelMoreira96/game-beating-project/controllers/controllers_functions"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type ManufacturerController struct {
	manufacturerService *services.ManufacturerService
}

func NewManufacturerController() *ManufacturerController {
	return &ManufacturerController{
		manufacturerService: services.NewManufacturerService(),
	}
}

// AddManufacturer adiciona um novo fabricante
func (c *ManufacturerController) AddManufacturer(ctx *fiber.Ctx) error {
	controllers_functions.GetAdminTokenInfos(ctx)

	var manufacturer models.Manufacturer
	if err := ctx.BodyParser(&manufacturer); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing manufacturer: " + err.Error(),
		})
	}

	if err := c.manufacturerService.AddManufacturer(&manufacturer); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(manufacturer)
}

// ListAllManufacturers retorna todos os fabricantes ativos
func (c *ManufacturerController) ListAllManufacturers(ctx *fiber.Ctx) error {
	manufacturers, err := c.manufacturerService.ListAllManufacturers()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(manufacturers)
}

// ListDeactivateManufacturers retorna todos os fabricantes inativos
func (c *ManufacturerController) ListDeactivateManufacturers(ctx *fiber.Ctx) error {
	controllers_functions.GetAdminTokenInfos(ctx)

	manufacturers, err := c.manufacturerService.ListDeactivateManufacturers()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(manufacturers)
}

// ViewManufacturer retorna um fabricante pelo ID
func (c *ManufacturerController) ViewManufacturer(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid manufacturer ID",
		})
	}

	manufacturer, err := c.manufacturerService.ViewManufacturer(uint(id))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(manufacturer)
}

// UpdateManufacturer atualiza um fabricante pelo ID
func (c *ManufacturerController) UpdateManufacturer(ctx *fiber.Ctx) error {
	controllers_functions.GetAdminTokenInfos(ctx)

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid manufacturer ID",
		})
	}

	var updatedManufacturer models.Manufacturer
	if err := ctx.BodyParser(&updatedManufacturer); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing manufacturer: " + err.Error(),
		})
	}

	if err := c.manufacturerService.UpdateManufacturer(uint(id), &updatedManufacturer); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(updatedManufacturer)
}

// DeleteManufacturer desativa um fabricante pelo ID
func (c *ManufacturerController) DeleteManufacturer(ctx *fiber.Ctx) error {
	controllers_functions.GetAdminTokenInfos(ctx)

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid manufacturer ID",
		})
	}

	if err := c.manufacturerService.DeleteManufacturer(uint(id)); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "manufacturer deleted",
	})
}

// ReactivateManufacturer reativa um fabricante pelo ID
func (c *ManufacturerController) ReactivateManufacturer(ctx *fiber.Ctx) error {
	controllers_functions.GetAdminTokenInfos(ctx)

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid manufacturer ID",
		})
	}

	if err := c.manufacturerService.ReactivateManufacturer(uint(id)); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "manufacturer reactivated",
	})
}

// ImportManufacturersFromCSV importa fabricantes a partir de um arquivo CSV
func (c *ManufacturerController) ImportManufacturersFromCSV(ctx *fiber.Ctx) error {
	controllers_functions.GetAdminTokenInfos(ctx)

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

	if err := c.manufacturerService.ImportManufacturersFromCSV(f); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "manufacturers imported successfully",
	})
}
