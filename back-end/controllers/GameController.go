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
			"message": "error parsing game" + err.Error(),
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
	playerID, _ := utils.GetPlayerTokenInfos(c)

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error retrieving file: " + err.Error(),
		})
	}

	f, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error opening file: " + err.Error(),
		})
	}
	defer f.Close()

	reader := csv.NewReader(f)
	reader.Comma = ';'
	reader.LazyQuotes = true

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

	recordIndex := 0
	batchSize := 100
	gamesBatch := []models.Game{}

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error reading CSV file: " + err.Error(),
			})
		}

		if recordIndex == 0 && strings.ToLower(strings.TrimSpace(record[0])) == "nome do jogo" {
			recordIndex++
			continue
		}

		if len(record) < 7 || strings.TrimSpace(record[0]) == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "invalid record at line " + strconv.Itoa(recordIndex+1),
			})
		}

		gameName := strings.TrimSpace(record[0])
		genreName := strings.TrimSpace(record[1])
		developer := strings.TrimSpace(record[2])
		consoleName := strings.TrimSpace(record[3])
		dateStr := record[4]

		var dateBeating date_utils.Date

		if dateStr != "" {
			var err error
			dateBeating, err = date_utils.ParseDate(dateStr)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"message": "invalid date format at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
				})
			}
		}

		rawTimeBeating := strings.TrimSpace(record[5])
		processedTimeBeating := strings.Replace(rawTimeBeating, ",", ".", -1)
		timeBeating, _ := strconv.ParseFloat(processedTimeBeating, 64)

		releaseYear := strings.TrimSpace(record[6])

		var consoleID uint
		if consoleName != "" {
			var console models.Console
			if err := tx.Where("name_console = ?", consoleName).First(&console).Error; err != nil {
				consoleID = 0
			} else {
				consoleID = console.IdConsole
			}
		}

		var genreID uint
		if genreName != "" {
			var genre models.Genre
			if err := tx.Where("name_genre = ?", genreName).First(&genre).Error; err != nil {
				genreID = 0
			} else {
				genreID = genre.IdGenre
			}
		}

		game := models.Game{
			NameGame:    gameName,
			Developer:   developer,
			GenreID:     genreID,
			ConsoleID:   consoleID,
			DateBeating: date_utils.Date(dateBeating),
			TimeBeating: timeBeating,
			ReleaseYear: releaseYear,
			PlayerID:    playerID,
			Status:      models.Beaten,
		}

		if err := game.Validate(); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "validation error at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		// Adiciona o jogo no lote
		gamesBatch = append(gamesBatch, game)

		// Realiza o commit a cada 100 registros
		if len(gamesBatch) >= batchSize {
			if err := tx.Create(&gamesBatch).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "error inserting batch at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
				})
			}
			// Limpa o lote
			gamesBatch = []models.Game{}
		}

		recordIndex++
	}

	// Commit dos registros restantes
	if len(gamesBatch) > 0 {
		if err := tx.Create(&gamesBatch).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error inserting remaining records: " + err.Error(),
			})
		}
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error committing transaction: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "games imported successfully",
	})
}

func ImportBacklogFromCSV(c *fiber.Ctx) error {
	playerID, _ := utils.GetPlayerTokenInfos(c)

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "error retrieving file: " + err.Error(),
		})
	}

	f, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error opening file: " + err.Error(),
		})
	}
	defer f.Close()

	reader := csv.NewReader(f)
	reader.Comma = ','
	reader.LazyQuotes = true

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

	recordIndex := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error reading CSV file: " + err.Error(),
			})
		}

		// Pular o cabeçalho (primeira linha) do CSV
		if recordIndex == 0 && strings.ToLower(strings.TrimSpace(record[0])) == "nome do jogo" {
			recordIndex++
			continue
		}

		// Verificar se o nome do jogo está vazio (campo obrigatório)
		if len(record) < 1 || strings.TrimSpace(record[0]) == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "invalid record at line " + strconv.Itoa(recordIndex+1) + ": nome do jogo é obrigatório",
			})
		}

		// Atribuir valores dos campos
		gameName := strings.TrimSpace(record[0])
		developer := strings.TrimSpace(record[1])
		consoleName := strings.TrimSpace(record[2])
		genreName := strings.TrimSpace(record[3])
		releaseYear := strings.TrimSpace(record[4])

		// Obter o ID do Console, se disponível
		var consoleID uint
		if consoleName != "" {
			var console models.Console
			if err := tx.Where("name_console = ?", consoleName).First(&console).Error; err != nil {
				consoleID = 0
			} else {
				consoleID = console.IdConsole
			}
		}

		// Obter o ID do Gênero, se disponível
		var genreID uint
		if genreName != "" {
			var genre models.Genre
			if err := tx.Where("name_genre = ?", genreName).First(&genre).Error; err != nil {
				genreID = 0
			} else {
				genreID = genre.IdGenre
			}
		}

		// Criar o objeto de jogo
		game := models.Game{
			NameGame:    gameName,
			Developer:   developer,
			GenreID:     genreID,
			ConsoleID:   consoleID,
			ReleaseYear: releaseYear,
			PlayerID:    playerID,
			Status:      models.Backlog,
		}

		// Validar o objeto Game
		if err := game.Validate(); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "validation error at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		// Inserir o jogo no banco de dados
		if err := tx.Create(&game).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "error inserting record at line " + strconv.Itoa(recordIndex+1) + ": " + err.Error(),
			})
		}

		recordIndex++
	}

	// Confirmar a transação
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "error committing transaction: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "games imported successfully",
	})
}
