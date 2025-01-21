package services

import (
	"fmt"
	"math"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"gorm.io/gorm"
)

type ConsoleGameCount struct {
	ConsoleID         uint    `json:"console_id"`
	NameConsole       string  `json:"name_console"`
	GameCount         int     `json:"game_count"`
	PercentageConsole float64 `json:"percentage_console"`
}

type GenreGameCount struct {
	GenreID         uint    `json:"genre_id"`
	NameGenre       string  `json:"name_genre"`
	GenreCount      int     `json:"genre_count"`
	PercentageGenre float64 `json:"percentage_genre"`
}

type YearGameCount struct {
	Year           int     `json:"year"`
	YearCount      int     `json:"year_count"`
	PercentageYear float64 `json:"percentage_year"`
}

type StatsService struct {
	db *gorm.DB
}

func NewStatsService() *StatsService {
	return &StatsService{
		db: database.GetDatabase(),
	}
}

// GetBeatedStats retorna as estatísticas de jogos finalizados
func (s *StatsService) GetBeatedStats(playerID uint) (map[string]interface{}, error) {
	var consoleGameCounts []ConsoleGameCount
	var genreGameCounts []GenreGameCount
	var yearGameCounts []YearGameCount

	var consoleStats []struct {
		ConsoleID   uint
		NameConsole string
		GameCount   int
	}
	if err := s.db.Raw(`
		SELECT 
			c.id_console AS console_id, 
			c.name_console, 
			COUNT(g.id_game) AS game_count
		FROM consoles c
		LEFT JOIN games g ON g.console_id = c.id_console AND g.player_id = ? AND g.status = 0
		WHERE c.is_active = true
		GROUP BY c.id_console, c.name_console
		ORDER BY game_count DESC
	`, playerID).Scan(&consoleStats).Error; err != nil {
		return nil, fmt.Errorf("error fetching console stats: %w", err)
	}

	totalGamesByConsole := 0
	for _, stat := range consoleStats {
		totalGamesByConsole += stat.GameCount
	}
	for _, stat := range consoleStats {
		percentage := 0.0
		if totalGamesByConsole > 0 {
			percentage = float64(stat.GameCount) / float64(totalGamesByConsole) * 100
		}
		consoleGameCounts = append(consoleGameCounts, ConsoleGameCount{
			ConsoleID:         stat.ConsoleID,
			NameConsole:       stat.NameConsole,
			GameCount:         stat.GameCount,
			PercentageConsole: percentage,
		})
	}

	var genreStats []struct {
		GenreID   uint
		NameGenre string
		GameCount int
	}
	if err := s.db.Raw(`
		SELECT 
			g.id_genre AS genre_id, 
			g.name_genre, 
			COUNT(game.id_game) AS game_count
		FROM genres g
		LEFT JOIN games game ON game.genre_id = g.id_genre AND game.player_id = ? AND game.status = 0
		WHERE g.is_active = true
		GROUP BY g.id_genre, g.name_genre
		ORDER BY game_count DESC
	`, playerID).Scan(&genreStats).Error; err != nil {
		return nil, fmt.Errorf("error fetching genre stats: %w", err)
	}

	totalGamesByGenre := 0
	for _, stat := range genreStats {
		totalGamesByGenre += stat.GameCount
	}
	for _, stat := range genreStats {
		percentage := 0.0
		if totalGamesByGenre > 0 {
			percentage = float64(stat.GameCount) / float64(totalGamesByGenre) * 100
		}
		genreGameCounts = append(genreGameCounts, GenreGameCount{
			GenreID:         stat.GenreID,
			NameGenre:       stat.NameGenre,
			GenreCount:      stat.GameCount,
			PercentageGenre: percentage,
		})
	}

	var yearStats []struct {
		ReleaseYear int
		GameCount   int
	}
	if err := s.db.Raw(`
		SELECT 
			game.release_year, 
			COUNT(game.id_game) AS game_count
		FROM games game
		WHERE game.player_id = ? AND game.status = 0
		GROUP BY game.release_year
		ORDER BY game_count DESC
	`, playerID).Scan(&yearStats).Error; err != nil {
		return nil, fmt.Errorf("error fetching year stats: %w", err)
	}

	totalGamesByYear := 0
	for _, stat := range yearStats {
		totalGamesByYear += stat.GameCount
	}
	for _, stat := range yearStats {
		percentage := 0.0
		if totalGamesByYear > 0 {
			percentage = float64(stat.GameCount) / float64(totalGamesByYear) * 100
		}
		yearGameCounts = append(yearGameCounts, YearGameCount{
			Year:           stat.ReleaseYear,
			YearCount:      stat.GameCount,
			PercentageYear: percentage,
		})
	}

	response := map[string]interface{}{
		"consoleStats": consoleGameCounts,
		"genreStats":   genreGameCounts,
		"yearStats":    yearGameCounts,
	}

	return response, nil
}

func (s *StatsService) GetBeatedStatsByGenre(playerID uint, genreID int) (map[string]interface{}, error) {
	var highlightGames []struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}

	var resumedListGames []struct {
		NameGame    string
		TimeBeating float64
		Console     string
		ReleaseYear int
	}

	var listGame []models.Game

	if err := s.db.Preload("Console").Where("player_id = ? AND status = 0 AND genre_id = ?", playerID, genreID).Order("time_beating DESC").Find(&listGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching short time beating games by genre: %w", err)
	}

	if len(listGame) == 0 {
		return map[string]interface{}{
			"highlightGames":     highlightGames,
			"averageTimeBeating": 0.0,
			"listGame":           listGame,
		}, nil
	}

	for _, game := range listGame {
		resumedListGames = append(resumedListGames, struct {
			NameGame    string
			TimeBeating float64
			Console     string
			ReleaseYear int
		}{
			NameGame:    game.NameGame,
			TimeBeating: game.TimeBeating,
			Console:     game.Console.NameConsole,
			ReleaseYear: game.ReleaseYear,
		})
	}

	longestGame := listGame[0]
	shortestGame := listGame[len(listGame)-1]
	var totalHoursPlayed float64
	for _, game := range listGame {
		totalHoursPlayed += game.TimeBeating
	}
	averageTimeBeating := totalHoursPlayed / float64(len(listGame))

	var medianGame models.Game
	smallestDiff := math.MaxFloat64
	for _, game := range listGame {
		diff := math.Abs(game.TimeBeating - averageTimeBeating)
		if diff < smallestDiff {
			smallestDiff = diff
			medianGame = game
		}
	}

	highlightGames = append(highlightGames, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    longestGame.NameGame,
		TimeBeating: longestGame.TimeBeating,
		TypeItem:    "Maior duração",
	}, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    shortestGame.NameGame,
		TimeBeating: shortestGame.TimeBeating,
		TypeItem:    "Menor duração",
	}, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    medianGame.NameGame,
		TimeBeating: medianGame.TimeBeating,
		TypeItem:    "Média do gênero",
	})

	totalGamesFinished := len(listGame)

	response := map[string]interface{}{
		"highlightGames":     highlightGames,
		"averageTimeBeating": averageTimeBeating,
		"listGame":           resumedListGames,
		"totalGamesFinished": totalGamesFinished,
		"totalHoursPlayed":   totalHoursPlayed,
	}

	return response, nil
}

func (s *StatsService) GetBeatedStatsByConsole(playerID uint, consoleID int) (map[string]interface{}, error) {
	var highlightGames []struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}

	var resumedListGames []struct {
		NameGame    string
		TimeBeating float64
		Genre       string
		ReleaseYear int
	}

	var listGame []models.Game

	if err := s.db.Preload("Genre").Where("player_id = ? AND status = 0 AND console_id = ?", playerID, consoleID).Order("time_beating DESC").Find(&listGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching short time beating games by genre: %w", err)
	}

	if len(listGame) == 0 {
		return map[string]interface{}{
			"highlightGames":     highlightGames,
			"averageTimeBeating": 0.0,
			"listGame":           listGame,
		}, nil
	}

	for _, game := range listGame {
		resumedListGames = append(resumedListGames, struct {
			NameGame    string
			TimeBeating float64
			Genre       string
			ReleaseYear int
		}{
			NameGame:    game.NameGame,
			TimeBeating: game.TimeBeating,
			Genre:       game.Genre.NameGenre,
			ReleaseYear: game.ReleaseYear,
		})
	}

	longestGame := listGame[0]
	shortestGame := listGame[len(listGame)-1]
	var totalHoursPlayed float64
	for _, game := range listGame {
		totalHoursPlayed += game.TimeBeating
	}
	averageTimeBeating := totalHoursPlayed / float64(len(listGame))

	var medianGame models.Game
	smallestDiff := math.MaxFloat64
	for _, game := range listGame {
		diff := math.Abs(game.TimeBeating - averageTimeBeating)
		if diff < smallestDiff {
			smallestDiff = diff
			medianGame = game
		}
	}

	highlightGames = append(highlightGames, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    longestGame.NameGame,
		TimeBeating: longestGame.TimeBeating,
		TypeItem:    "Maior duração",
	}, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    shortestGame.NameGame,
		TimeBeating: shortestGame.TimeBeating,
		TypeItem:    "Menor duração",
	}, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    medianGame.NameGame,
		TimeBeating: medianGame.TimeBeating,
		TypeItem:    "Média do gênero",
	})

	totalGamesFinished := len(listGame)

	response := map[string]interface{}{
		"highlightGames":     highlightGames,
		"averageTimeBeating": averageTimeBeating,
		"listGame":           resumedListGames,
		"totalGamesFinished": totalGamesFinished,
		"totalHoursPlayed":   totalHoursPlayed,
	}

	return response, nil
}

func (s *StatsService) GetBeatedStatsByReleaseYear(playerID uint, releaseYear int) (map[string]interface{}, error) {
	var highlightGames []struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}

	var resumedListGames []struct {
		NameGame    string
		TimeBeating float64
		Console     string
		Genre       string
	}

	var listGame []models.Game

	if err := s.db.Preload("Console").Preload("Genre").Where("player_id =? AND status = 0 AND release_year =?", playerID, releaseYear).Order("time_beating DESC").Find(&listGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching short time beating games by genre: %w", err)
	}
	if len(listGame) == 0 {
		return map[string]interface{}{
			"highlightGames":     highlightGames,
			"averageTimeBeating": 0.0,
			"listGame":           listGame,
		}, nil
	}

	for _, game := range listGame {
		resumedListGames = append(resumedListGames, struct {
			NameGame    string
			TimeBeating float64
			Console     string
			Genre       string
		}{
			NameGame:    game.NameGame,
			TimeBeating: game.TimeBeating,
			Console:     game.Console.NameConsole,
			Genre:       game.Genre.NameGenre,
		})
	}
	longestGame := listGame[0]
	shortestGame := listGame[len(listGame)-1]
	var totalHoursPlayed float64
	for _, game := range listGame {
		totalHoursPlayed += game.TimeBeating
	}
	averageTimeBeating := totalHoursPlayed / float64(len(listGame))

	var medianGame models.Game
	smallestDiff := math.MaxFloat64
	for _, game := range listGame {
		diff := math.Abs(game.TimeBeating - averageTimeBeating)
		if diff < smallestDiff {
			smallestDiff = diff
			medianGame = game
		}
	}
	highlightGames = append(highlightGames, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    longestGame.NameGame,
		TimeBeating: longestGame.TimeBeating,
		TypeItem:    "Maior duração",
	}, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    shortestGame.NameGame,
		TimeBeating: shortestGame.TimeBeating,
		TypeItem:    "Menor duração",
	}, struct {
		NameGame    string
		TimeBeating float64
		TypeItem    string
	}{
		NameGame:    medianGame.NameGame,
		TimeBeating: medianGame.TimeBeating,
		TypeItem:    "Média do gênero",
	})
	totalGamesFinished := len(listGame)
	response := map[string]interface{}{
		"highlightGames":     highlightGames,
		"averageTimeBeating": averageTimeBeating,
		"listGame":           resumedListGames,
		"totalGamesFinished": totalGamesFinished,
		"totalHoursPlayed":   totalHoursPlayed,
	}
	return response, nil
}
