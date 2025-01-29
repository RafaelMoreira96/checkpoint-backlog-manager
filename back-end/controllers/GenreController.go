package controllers

import (
	"strconv"

	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/security"
	"github.com/RafaelMoreira96/game-beating-project/services"
	"github.com/gofiber/fiber/v2"
)

type GenreController struct {
	genreService *services.GenreService
}

func NewGenreController() *GenreController {
	return &GenreController{
		genreService: services.NewGenreService(),
	}
}

// AddGenre adiciona um novo gênero
func (c *GenreController) AddGenre(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	var genre models.Genre
	if err := ctx.BodyParser(&genre); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing genre: " + err.Error(),
		})
	}

	if err := c.genreService.AddGenre(&genre); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(genre)
}

// ListAllGenres retorna todos os gêneros ativos
func (c *GenreController) ListAllGenres(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	genres, err := c.genreService.ListAllGenres()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(genres)
}

// ListDeactivateGenres retorna todos os gêneros inativos
func (c *GenreController) ListDeactivateGenres(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	genres, err := c.genreService.ListDeactivateGenres()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(genres)
}

// ViewGenre retorna um gênero pelo ID
func (c *GenreController) ViewGenre(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid genre ID",
		})
	}

	genre, err := c.genreService.ViewGenre(uint(id))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(genre)
}

// UpdateGenre atualiza um gênero pelo ID
func (c *GenreController) UpdateGenre(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid genre ID",
		})
	}

	var updatedGenre models.Genre
	if err := ctx.BodyParser(&updatedGenre); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing genre: " + err.Error(),
		})
	}

	if err := c.genreService.UpdateGenre(uint(id), &updatedGenre); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(updatedGenre)
}

// ReactivateGenre reativa um gênero pelo ID
func (c *GenreController) ReactivateGenre(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid genre ID",
		})
	}

	if err := c.genreService.ReactivateGenre(uint(id)); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "genre reactivated",
	})
}

// DeleteGenre desativa um gênero pelo ID
func (c *GenreController) DeleteGenre(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "invalid genre ID",
		})
	}

	if err := c.genreService.DeleteGenre(uint(id)); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "genre deleted",
	})
}

// ImportGenresFromCSV importa gêneros a partir de um arquivo CSV
func (c *GenreController) ImportGenresFromCSV(ctx *fiber.Ctx) error {
	security.GetAdminTokenInfos(ctx)

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

	if err := c.genreService.ImportGenresFromCSV(f); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "genres imported successfully",
	})
}
