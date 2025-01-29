package controllers

import (
	"strconv"

	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/security"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type LogController struct {
	logService *services.LogService
}

func NewLogController() *LogController {
	return &LogController{
		logService: services.NewLogService(),
	}
}

// AddLog adiciona um novo log de atualização do projeto
func (c *LogController) AddLog(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	var log models.ProjectUpdateLog
	if err := ctx.BodyParser(&log); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing log",
		})
	}

	log.AuthorID = ctx.Locals("userID").(uint)
	if err := c.logService.AddLog(&log); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(log)
}

// DeleteLog remove um log de atualização do projeto pelo ID
func (c *LogController) DeleteLog(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid log ID",
		})
	}

	if err := c.logService.DeleteLog(uint(id)); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "log deleted",
	})
}

// GetLogs retorna todos os logs de atualização do projeto
func (c *LogController) GetLogs(ctx *fiber.Ctx) error {
	logs, err := c.logService.GetLogs()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(logs)
}
