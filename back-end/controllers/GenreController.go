package controllers

import (
	"encoding/csv"
	"io"
	"strconv"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/gofiber/fiber/v2"
)

func AddGenre(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var genre models.Genre
	genre.IsActive = true

	if err := c.BodyParser(&genre); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing genre: " + err.Error(),
		})
	}

	if genre.NameGenre == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "insert a genre name",
		})
	}

	var genreDB models.Genre
	if err := db.Where("name_genre = ?", genre.NameGenre).First(&genreDB).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre already exists",
		})
	}

	if err := db.Create(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error creating genre: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(genre)
}

func ListAllGenres(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var genres []models.Genre

	if err := db.Where("is_active = true").Order("name_genre ASC").Find(&genres).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(genres)
	}

	return c.Status(fiber.StatusOK).JSON(genres)
}

func ListDeactivateGenres(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var genres []models.Genre

	if err := db.Where("is_active = false").Order("name_genre ASC").Find(&genres).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(genres)
	}

	return c.Status(fiber.StatusOK).JSON(genres)
}

func ViewGenre(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var genre models.Genre

	if err := db.Where("id_genre = ?", c.Params("id")).First(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(genre)
}

func UpdateGenre(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var genre models.Genre

	if err := db.Where("id_genre = ?", c.Params("id")).First(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre not found",
		})
	}

	if err := c.BodyParser(&genre); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing genre: " + err.Error(),
		})
	}

	if err := db.Save(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error updating genre: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(genre)
}

func ReactivateGenre(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var genre models.Genre

	if err := db.Where("id_genre = ?", c.Params("id")).First(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre not found",
		})
	}

	if genre.IsActive {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre already activated",
		})
	}

	genre.IsActive = true

	if err := db.Save(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error reactivating genre: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(genre)
}

func DeleteGenre(c *fiber.Ctx) error {
	utils.GetAdminTokenInfos(c)
	db := database.GetDatabase()
	var genre models.Genre

	if err := db.Where("id_genre = ?", c.Params("id")).First(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre not found",
		})
	}

	genre.IsActive = false
	if err := db.Save(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error deleting genre: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "genre deleted",
	})
}

func ImportGenresFromCSV(c *fiber.Ctx) error {
	// Obtém o token do admin
	utils.GetAdminTokenInfos(c)

	// Obtém o arquivo enviado
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error retrieving file: " + err.Error(),
		})
	}

	// Abre o arquivo
	f, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error opening file: " + err.Error(),
		})
	}
	defer f.Close()

	// Lê o arquivo CSV
	reader := csv.NewReader(f)
	reader.Comma = ','       // Definindo delimitador
	reader.LazyQuotes = true // Permite que campos com aspas sejam lidos corretamente
	db := database.GetDatabase()

	// Inicia uma transação para otimizar o uso do banco de dados
	tx := db.Begin()
	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error starting transaction: " + tx.Error.Error(),
		})
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Processa cada linha do arquivo CSV
	recordIndex := 0
	seenGenres := make(map[string]struct{}) // Usado para verificar duplicatas em memória
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break // Fim do arquivo
		}
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error reading CSV file: " + err.Error(),
			})
		}

		// Ignora a primeira linha se for o cabeçalho
		if recordIndex == 0 && strings.ToLower(record[0]) == "name_genre" {
			recordIndex++
			continue
		}

		// Checa se o campo está vazio ou se já foi processado
		if len(record) < 1 || record[0] == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "invalid record at line " + strconv.Itoa(recordIndex+1),
			})
		}

		genreName := strings.TrimSpace(record[0])

		// Verifica se o gênero já foi processado
		if _, exists := seenGenres[genreName]; exists {
			recordIndex++
			continue
		}
		seenGenres[genreName] = struct{}{}

		// Cria a estrutura do gênero
		genre := models.Genre{
			NameGenre: genreName,
			IsActive:  true,
		}

		// Valida o gênero
		if err := genre.Validate(); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "validation error at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		// Verifica se o gênero já existe no banco, sem precisar consultar todas as vezes
		var existingGenre models.Genre
		if err := tx.Where("name_genre = ?", genre.NameGenre).First(&existingGenre).Error; err == nil {
			// Gênero já existe, pula a inserção
			recordIndex++
			continue
		}

		// Insere o novo gênero no banco dentro da transação
		if err := tx.Create(&genre).Error; err != nil {
			tx.Rollback() // Caso ocorra erro, faz rollback
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error inserting record at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		recordIndex++
	}

	// Commit da transação após o processamento de todos os registros
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error committing transaction: " + err.Error(),
		})
	}

	// Retorno sucesso
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "genres imported successfully",
	})
}
