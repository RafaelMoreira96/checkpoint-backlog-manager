package services

import (
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	date_utils "github.com/RafaelMoreira96/game-beating-project/utils"
	"github.com/texttheater/golang-levenshtein/levenshtein"
	"gorm.io/gorm"
)

type GameService struct {
	db *gorm.DB
}

func NewGameService() *GameService {
	return &GameService{
		db: database.GetDatabase(),
	}
}

// AddGame adiciona um novo jogo
func (s *GameService) AddGame(game *models.Game) error {
	if game.NameGame == "" {
		return fmt.Errorf("insert a game name")
	}

	var genre models.Genre
	if err := s.db.Where("id_genre = ?", game.GenreID).First(&genre).Error; err != nil {
		return fmt.Errorf("genre not found")
	}

	var console models.Console
	if err := s.db.Where("id_console = ?", game.ConsoleID).First(&console).Error; err != nil {
		return fmt.Errorf("console not found")
	}

	game.Status = 0
	if err := s.db.Create(game).Error; err != nil {
		return fmt.Errorf("error creating game: %w", err)
	}

	return nil
}

// GetBeatenList retorna a lista de jogos finalizados
func (s *GameService) GetBeatenList(playerID uint) ([]models.Game, error) {
	var games []models.Game
	if err := s.db.Preload("Genre").Preload("Console").
		Where("player_id = ? AND status = 0", playerID).
		Order("date_beating DESC").
		Find(&games).Error; err != nil {
		return nil, fmt.Errorf("error fetching games: %w", err)
	}
	return games, nil
}

// DeleteGame remove um jogo
func (s *GameService) DeleteGame(playerID uint, gameID uint) error {
	var game models.Game
	if err := s.db.Where("id_game = ? AND player_id = ?", gameID, playerID).First(&game).Error; err != nil {
		return fmt.Errorf("game not found: %w", err)
	}

	if err := s.db.Delete(&game).Error; err != nil {
		return fmt.Errorf("error deleting game: %w", err)
	}

	return nil
}

// UpdateGame atualiza um jogo
func (s *GameService) UpdateGame(playerID uint, gameID uint, updatedGame *models.Game) error {
	var game models.Game
	if err := s.db.Where("id_game = ? AND player_id = ?", gameID, playerID).First(&game).Error; err != nil {
		return fmt.Errorf("game not found: %w", err)
	}

	if updatedGame.NameGame == "" {
		return fmt.Errorf("insert a game name")
	}

	var genre models.Genre
	if err := s.db.Where("id_genre = ?", updatedGame.GenreID).First(&genre).Error; err != nil {
		return fmt.Errorf("genre not found")
	}

	var console models.Console
	if err := s.db.Where("id_console = ?", updatedGame.ConsoleID).First(&console).Error; err != nil {
		return fmt.Errorf("console not found")
	}

	game.NameGame = updatedGame.NameGame
	game.GenreID = updatedGame.GenreID
	game.ConsoleID = updatedGame.ConsoleID
	game.Status = updatedGame.Status
	game.UrlImage = updatedGame.UrlImage
	game.DateBeating = updatedGame.DateBeating
	game.TimeBeating = updatedGame.TimeBeating
	game.Developer = updatedGame.Developer
	game.ReleaseYear = updatedGame.ReleaseYear

	if err := s.db.Save(&game).Error; err != nil {
		return fmt.Errorf("error updating game: %w", err)
	}

	return nil
}

// GetGame retorna um jogo pelo ID
func (s *GameService) GetGame(playerID uint, gameID uint) (*models.Game, error) {
	var game models.Game
	if err := s.db.Preload("Genre").Preload("Console").
		Where("id_game = ? AND player_id = ?", gameID, playerID).
		First(&game).Error; err != nil {
		return nil, fmt.Errorf("game not found: %w", err)
	}
	return &game, nil
}

// ImportGamesFromCSV importa jogos a partir de um arquivo CSV
func (s *GameService) ImportGamesFromCSV(playerID uint, file io.Reader) error {
	reader := csv.NewReader(file)
	reader.Comma = ';'
	reader.LazyQuotes = true

	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("error starting transaction: %w", tx.Error)
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
			tx.Rollback()
			return fmt.Errorf("error reading CSV file: %w", err)
		}

		if recordIndex == 0 && strings.ToLower(strings.TrimSpace(record[0])) == "nome do jogo" {
			recordIndex++
			continue
		}

		if len(record) < 7 || strings.TrimSpace(record[0]) == "" {
			tx.Rollback()
			return fmt.Errorf("invalid record at line %d", recordIndex+1)
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
				tx.Rollback()
				return fmt.Errorf("invalid date format at line %d: %w", recordIndex+1, err)
			}
		}

		rawTimeBeating := strings.TrimSpace(record[5])
		processedTimeBeating := strings.Replace(rawTimeBeating, ",", ".", -1)
		timeBeating, _ := strconv.ParseFloat(processedTimeBeating, 64)

		releaseYearStr := strings.TrimSpace(record[6])
		releaseYear, err := strconv.ParseUint(releaseYearStr, 10, 32)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("error parsing release year at line %d: %w", recordIndex+1, err)
		}

		var consoleID *uint
		if consoleName != "" {
			closestConsoleID, _ := findClosestConsoleName(tx, consoleName)
			if closestConsoleID > 0 {
				consoleID = &closestConsoleID
			}
		}

		var genreID *uint
		if genreName != "" {
			var genre models.Genre
			if err := tx.Where("name_genre = ?", genreName).First(&genre).Error; err == nil {
				genreID = &genre.IdGenre
			}
		}

		game := models.Game{
			NameGame:    gameName,
			Developer:   developer,
			GenreID:     genreID,
			ConsoleID:   consoleID,
			DateBeating: date_utils.Date(dateBeating),
			TimeBeating: timeBeating,
			ReleaseYear: int(releaseYear),
			PlayerID:    playerID,
			Status:      models.Beaten,
		}

		if err := game.Validate(); err != nil {
			tx.Rollback()
			return fmt.Errorf("validation error at line %d: %w", recordIndex+1, err)
		}

		if err := tx.Create(&game).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("error inserting record at line %d: %w", recordIndex+1, err)
		}

		recordIndex++
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

// findClosestConsoleName encontra o console mais próximo pelo nome
func findClosestConsoleName(tx *gorm.DB, inputName string) (uint, string) {
	var consoles []models.Console
	tx.Select("id_console, name_console").Find(&consoles)

	closestConsoleID := uint(0)
	closestConsoleName := ""
	highestSimilarity := 0.8

	for _, console := range consoles {
		cleanedInput := strings.ToLower(strings.TrimSpace(inputName))
		cleanedConsole := strings.ToLower(strings.TrimSpace(console.NameConsole))

		similarity := levenshtein.RatioForStrings([]rune(cleanedInput), []rune(cleanedConsole), levenshtein.DefaultOptions)
		if similarity > highestSimilarity {
			highestSimilarity = similarity
			closestConsoleID = console.IdConsole
			closestConsoleName = console.NameConsole
		}
	}

	return closestConsoleID, closestConsoleName
}
