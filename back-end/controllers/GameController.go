package controllers

import (
	"encoding/csv"
	"io"
	"strconv"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/controllers/utils"
	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	date_utils "github.com/RafaelMoreira96/game-beating-project/utils"
	"github.com/gofiber/fiber/v2"
)

func AddGame(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var game models.Game

	if err := c.BodyParser(&game); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing game",
		})
	}

	if game.NameGame == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "insert a game name",
		})
	}

	var genre models.Genre
	if err := db.Where("id_genre = ?", game.GenreID).First(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre not found",
		})
	}

	var console models.Console
	if err := db.Where("id_console = ?", game.ConsoleID).First(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "console not found",
		})
	}

	game.PlayerID = playerID
	game.Status = 0
	if err := db.Create(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error creating game",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(game)
}

func GetBeatenList(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()

	var games []models.Game
	if err := db.Preload("Genre").Preload("Console").Where("player_id = ? AND status = 0", playerID).Find(&games).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error into find games",
		})
	}

	return c.Status(fiber.StatusOK).JSON(games)
}

func DeleteGame(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var game models.Game

	if err := db.Where("id_game = ? AND player_id = ?", c.Params("id_game"), playerID).First(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error deleting game: " + err.Error(),
		})
	}

	if err := db.Delete(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error deleting game: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusNoContent).JSON(fiber.Map{
		"message": "game deleted",
	})
}

func UpdateGame(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var game models.Game

	if err := db.Where("id_game = ? AND player_id = ?", c.Params("id_game"), playerID).First(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error updating game: " + err.Error(),
		})
	}

	var newGame models.Game
	if err := c.BodyParser(&newGame); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error parsing game",
		})
	}

	if newGame.NameGame == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "insert a game name",
		})
	}

	var genre models.Genre
	if err := db.Where("id_genre = ?", newGame.GenreID).First(&genre).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "genre not found",
		})
	}

	var console models.Console
	if err := db.Where("id_console = ?", newGame.ConsoleID).First(&console).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "console not found",
		})
	}

	game.NameGame = newGame.NameGame
	game.GenreID = newGame.GenreID
	game.ConsoleID = newGame.ConsoleID
	game.Status = newGame.Status
	game.DateBeating = newGame.DateBeating
	game.TimeBeating = newGame.TimeBeating
	game.Developer = newGame.Developer
	game.ReleaseYear = newGame.ReleaseYear
	if err := db.Save(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error updating game",
		})
	}

	return c.Status(fiber.StatusOK).JSON(game)
}

func GetGame(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	db := database.GetDatabase()
	var game models.Game

	if err := db.Preload("Genre").Preload("Console").Where("id_game = ? AND player_id = ?", c.Params("id_game"), playerID).First(&game).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error finding game",
		})
	}

	return c.Status(fiber.StatusOK).JSON(game)
}

/* Aditional functions */
func ImportGamesFromCSV(c *fiber.Ctx) error {
	// Obtém o ID do jogador a partir do token de autenticação
	playerID, err := utils.GetPlayerTokenInfos(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
		})
	}

	// Obtém o arquivo enviado pelo usuário
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

	// Cria um leitor CSV
	reader := csv.NewReader(f)
	reader.Comma = ','       // Define o delimitador como vírgula
	reader.LazyQuotes = true // Permite aspas em campos de texto

	// Obtém uma instância do banco de dados
	db := database.GetDatabase()
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

	// Variável para controlar a linha do CSV
	recordIndex := 0
	for {
		// Lê uma linha do arquivo CSV
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error reading CSV file: " + err.Error(),
			})
		}

		// Pula a primeira linha (cabeçalho)
		if recordIndex == 0 && strings.ToLower(strings.TrimSpace(record[0])) == "nome do jogo" {
			recordIndex++
			continue
		}

		// Valida o tamanho da linha
		if len(record) < 7 || strings.TrimSpace(record[0]) == "" { // Agora estamos verificando 7 campos
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "invalid record at line " + strconv.Itoa(recordIndex+1),
			})
		}

		// Processa os dados da linha
		gameName := strings.TrimSpace(record[0])
		developer := strings.TrimSpace(record[1])
		genreName := strings.TrimSpace(record[2]) // Agora estamos pegando o "Gênero"
		consoleName := strings.TrimSpace(record[3])
		dateStr := record[4]
		var dateBeating date_utils.Date

		// Converte a data de conclusão (se presente)
		if dateStr != "" {
			var err error
			dateBeating, err = date_utils.ParseDate(dateStr)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"message": "invalid date format at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
				})
			}
		}

		// Converte o tempo de conclusão em horas
		timeBeating, _ := strconv.ParseFloat(strings.TrimSpace(record[5]), 64)
		releaseYear := strings.TrimSpace(record[6])

		// Obtém o ID do console associado ao jogo
		var consoleID uint
		if consoleName != "" {
			var console models.Console
			if err := tx.Where("name_console = ?", consoleName).First(&console).Error; err != nil {
				// Caso não encontre o console, define o ID como 0
				consoleID = 0
			} else {
				consoleID = console.IdConsole
			}
		}

		var genreID uint
		if genreName != "" {
			var genre models.Genre
			if err := tx.Where("name_genre = ?", consoleName).First(&genre).Error; err != nil {
				genreID = 0
			} else {
				genreID = genre.IdGenre
			}
		}

		// Criação do jogo com todos os campos, incluindo "Gênero"
		game := models.Game{
			NameGame:    gameName,
			Developer:   developer,
			GenreID:     genreID, // Armazena o "Gênero" no modelo de jogo
			ConsoleID:   consoleID,
			DateBeating: date_utils.Date(dateBeating),
			TimeBeating: timeBeating,
			ReleaseYear: releaseYear,
			PlayerID:    playerID,
			Status:      models.Beaten,
		}

		// Valida os dados do jogo antes de inserir
		if err := game.Validate(); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "validation error at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		// Insere o jogo no banco de dados
		if err := tx.Create(&game).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error inserting record at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		// Avança para a próxima linha do CSV
		recordIndex++
	}

	// Finaliza a transação no banco de dados
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error committing transaction: " + err.Error(),
		})
	}

	// Retorna sucesso
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "games imported successfully",
	})
}
