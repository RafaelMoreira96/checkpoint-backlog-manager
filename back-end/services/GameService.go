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

// GetBeatenList retorna a lista de jogos finalizados (suporta paginação opcional e busca)
func (s *GameService) GetBeatenList(playerID uint, page, limit int, search string) ([]models.Game, int64, error) {
	var games []models.Game
	var total int64

	query := s.db.Model(&models.Game{}).
		Where("player_id = ? AND status = ?", playerID, models.Beaten)

	if search != "" {
		query = query.Where("name_game ILIKE ?", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("error counting games: %w", err)
	}

	query = query.
		Preload("Genre", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_genre, name_genre")
		}).
		Preload("Console", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_console, name_console")
		}).
		Order("date_beating DESC")

	if page > 0 && limit > 0 {
		offset := (page - 1) * limit
		query = query.Offset(offset).Limit(limit)
	}

	if err := query.Find(&games).Error; err != nil {
		return nil, 0, fmt.Errorf("error fetching games: %w", err)
	}

	return games, total, nil
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
	if err := s.db.
		Preload("Genre", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_genre, name_genre")
		}).
		Preload("Console", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_console, name_console")
		}).
		Where("id_game = ? AND player_id = ?", gameID, playerID).
		First(&game).Error; err != nil {
		return nil, fmt.Errorf("game not found: %w", err)
	}
	return &game, nil
}

// ImportGamesFromCSV importa jogos a partir de um arquivo CSV de forma otimizada
func (s *GameService) ImportGamesFromCSV(playerID uint, file io.Reader) error {
	reader := csv.NewReader(file)
	reader.Comma = ';'
	reader.LazyQuotes = true

	// 1. Pré-carregar consoles ativos uma única vez para lookup e cálculo Levenshtein
	var consoles []models.Console
	if err := s.db.Select("id_console, name_console").Where("is_active = true").Find(&consoles).Error; err != nil {
		return fmt.Errorf("error fetching active consoles: %w", err)
	}

	// 2. Pré-carregar gêneros ativos em mapa chave-valor para busca instantânea O(1)
	var genres []models.Genre
	if err := s.db.Select("id_genre, name_genre").Where("is_active = true").Find(&genres).Error; err != nil {
		return fmt.Errorf("error fetching active genres: %w", err)
	}
	genreMap := make(map[string]uint, len(genres))
	for _, g := range genres {
		genreMap[strings.ToLower(strings.TrimSpace(g.NameGenre))] = g.IdGenre
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("error starting transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var gamesToInsert []models.Game
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
			closestConsoleID, _ := findClosestConsoleNamePreloaded(consoles, consoleName)
			if closestConsoleID > 0 {
				consoleID = &closestConsoleID
			}
		}

		var genreID *uint
		if genreName != "" {
			if id, exists := genreMap[strings.ToLower(genreName)]; exists {
				genreID = &id
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

		gamesToInsert = append(gamesToInsert, game)
		recordIndex++
	}

	// Inserção em batch de 100 registros por query
	if len(gamesToInsert) > 0 {
		if err := tx.CreateInBatches(gamesToInsert, 100).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("error inserting records in batches: %w", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

// findClosestConsoleNamePreloaded encontra o console mais próximo em memória sem queries
func findClosestConsoleNamePreloaded(consoles []models.Console, inputName string) (uint, string) {
	closestConsoleID := uint(0)
	closestConsoleName := ""
	highestSimilarity := 0.8

	cleanedInput := strings.ToLower(strings.TrimSpace(inputName))
	for _, console := range consoles {
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
