package services

import (
	"fmt"

	"github.com/RafaelMoreira96/game-beating-project/database"
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
	// Estruturas para armazenar os resultados
	var consoleGameCounts []ConsoleGameCount
	var genreGameCounts []GenreGameCount
	var yearGameCounts []YearGameCount

	// Query 1: Consoles
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

	// Query 2: Gêneros
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

	// Query 3: Datas de Lançamento
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

	// Consolidar todos os resultados
	response := map[string]interface{}{
		"consoleStats": consoleGameCounts,
		"genreStats":   genreGameCounts,
		"yearStats":    yearGameCounts,
	}

	return response, nil
}
