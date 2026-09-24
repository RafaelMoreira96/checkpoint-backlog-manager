package services

import (
	"fmt"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/utils"
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

type AggregatedStats struct {
	TotalHours   float64 `gorm:"column:total_hours"`
	AverageHours float64 `gorm:"column:average_hours"`
	TotalGames   int64   `gorm:"column:total_games"`
}

type HighlightGame struct {
	NameGame    string  `json:"NameGame"`
	TimeBeating float64 `json:"TimeBeating"`
	TypeItem    string  `json:"TypeItem"`
}

type ResumedGenreGame struct {
	NameGame    string  `json:"NameGame" gorm:"column:name_game"`
	TimeBeating float64 `json:"TimeBeating" gorm:"column:time_beating"`
	Console     string  `json:"Console" gorm:"column:console"`
	ReleaseYear int     `json:"ReleaseYear" gorm:"column:release_year"`
}

type ResumedConsoleGame struct {
	NameGame    string  `json:"NameGame" gorm:"column:name_game"`
	TimeBeating float64 `json:"TimeBeating" gorm:"column:time_beating"`
	Genre       string  `json:"Genre" gorm:"column:genre"`
	ReleaseYear int     `json:"ReleaseYear" gorm:"column:release_year"`
}

type ResumedReleaseYearGame struct {
	NameGame    string  `json:"NameGame" gorm:"column:name_game"`
	TimeBeating float64 `json:"TimeBeating" gorm:"column:time_beating"`
	Console     string  `json:"Console" gorm:"column:console"`
	Genre       string  `json:"Genre" gorm:"column:genre"`
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
		LEFT JOIN games g ON g.console_id = c.id_console AND g.player_id = ? AND g.status = ?
		WHERE c.is_active = true
		GROUP BY c.id_console, c.name_console
		ORDER BY game_count DESC
	`, playerID, models.Beaten).Scan(&consoleStats).Error; err != nil {
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
		LEFT JOIN games game ON game.genre_id = g.id_genre AND game.player_id = ? AND game.status = ?
		WHERE g.is_active = true
		GROUP BY g.id_genre, g.name_genre
		ORDER BY game_count DESC
	`, playerID, models.Beaten).Scan(&genreStats).Error; err != nil {
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
		WHERE game.player_id = ? AND game.status = ?
		GROUP BY game.release_year
		ORDER BY game_count DESC
	`, playerID, models.Beaten).Scan(&yearStats).Error; err != nil {
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
	var stats AggregatedStats
	if err := s.db.Model(&models.Game{}).
		Select("COALESCE(SUM(time_beating), 0) as total_hours, COALESCE(AVG(time_beating), 0) as average_hours, COUNT(id_game) as total_games").
		Where("player_id = ? AND status = ? AND genre_id = ?", playerID, models.Beaten, genreID).
		Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("error fetching aggregated stats by genre: %w", err)
	}

	if stats.TotalGames == 0 {
		return map[string]interface{}{
			"highlightGames":     []HighlightGame{},
			"averageTimeBeating": 0.0,
			"listGame":           []ResumedGenreGame{},
			"totalGamesFinished": 0,
			"totalHoursPlayed":   0.0,
		}, nil
	}

	var longestGame, shortestGame, medianGame models.Game
	if err := s.db.Where("player_id = ? AND status = ? AND genre_id = ?", playerID, models.Beaten, genreID).
		Order("time_beating DESC").First(&longestGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching longest game: %w", err)
	}

	if err := s.db.Where("player_id = ? AND status = ? AND genre_id = ?", playerID, models.Beaten, genreID).
		Order("time_beating ASC").First(&shortestGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching shortest game: %w", err)
	}

	medianOffset := int(stats.TotalGames / 2)
	if err := s.db.Where("player_id = ? AND status = ? AND genre_id = ?", playerID, models.Beaten, genreID).
		Order("time_beating ASC").Offset(medianOffset).First(&medianGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching median game: %w", err)
	}

	highlightGames := []HighlightGame{
		{
			NameGame:    longestGame.NameGame,
			TimeBeating: longestGame.TimeBeating,
			TypeItem:    "Maior duração",
		},
		{
			NameGame:    shortestGame.NameGame,
			TimeBeating: shortestGame.TimeBeating,
			TypeItem:    "Menor duração",
		},
		{
			NameGame:    medianGame.NameGame,
			TimeBeating: medianGame.TimeBeating,
			TypeItem:    "Mediana do gênero",
		},
	}

	var resumedListGames []ResumedGenreGame
	if err := s.db.Table("games").
		Select("games.name_game, games.time_beating, consoles.name_console AS console, games.release_year").
		Joins("LEFT JOIN consoles ON consoles.id_console = games.console_id").
		Where("games.player_id = ? AND games.status = ? AND games.genre_id = ?", playerID, models.Beaten, genreID).
		Order("games.time_beating DESC").
		Scan(&resumedListGames).Error; err != nil {
		return nil, fmt.Errorf("error fetching resumed games list: %w", err)
	}

	return map[string]interface{}{
		"highlightGames":     highlightGames,
		"averageTimeBeating": stats.AverageHours,
		"listGame":           resumedListGames,
		"totalGamesFinished": stats.TotalGames,
		"totalHoursPlayed":   stats.TotalHours,
	}, nil
}

func (s *StatsService) GetBeatedStatsByConsole(playerID uint, consoleID int) (map[string]interface{}, error) {
	var stats AggregatedStats
	if err := s.db.Model(&models.Game{}).
		Select("COALESCE(SUM(time_beating), 0) as total_hours, COALESCE(AVG(time_beating), 0) as average_hours, COUNT(id_game) as total_games").
		Where("player_id = ? AND status = ? AND console_id = ?", playerID, models.Beaten, consoleID).
		Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("error fetching aggregated stats by console: %w", err)
	}

	if stats.TotalGames == 0 {
		return map[string]interface{}{
			"highlightGames":     []HighlightGame{},
			"averageTimeBeating": 0.0,
			"listGame":           []ResumedConsoleGame{},
			"totalGamesFinished": 0,
			"totalHoursPlayed":   0.0,
		}, nil
	}

	var longestGame, shortestGame, medianGame models.Game
	if err := s.db.Where("player_id = ? AND status = ? AND console_id = ?", playerID, models.Beaten, consoleID).
		Order("time_beating DESC").First(&longestGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching longest game: %w", err)
	}

	if err := s.db.Where("player_id = ? AND status = ? AND console_id = ?", playerID, models.Beaten, consoleID).
		Order("time_beating ASC").First(&shortestGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching shortest game: %w", err)
	}

	medianOffset := int(stats.TotalGames / 2)
	if err := s.db.Where("player_id = ? AND status = ? AND console_id = ?", playerID, models.Beaten, consoleID).
		Order("time_beating ASC").Offset(medianOffset).First(&medianGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching median game: %w", err)
	}

	highlightGames := []HighlightGame{
		{
			NameGame:    longestGame.NameGame,
			TimeBeating: longestGame.TimeBeating,
			TypeItem:    "Maior duração",
		},
		{
			NameGame:    shortestGame.NameGame,
			TimeBeating: shortestGame.TimeBeating,
			TypeItem:    "Menor duração",
		},
		{
			NameGame:    medianGame.NameGame,
			TimeBeating: medianGame.TimeBeating,
			TypeItem:    "Mediana da plataforma",
		},
	}

	var resumedListGames []ResumedConsoleGame
	if err := s.db.Table("games").
		Select("games.name_game, games.time_beating, genres.name_genre AS genre, games.release_year").
		Joins("LEFT JOIN genres ON genres.id_genre = games.genre_id").
		Where("games.player_id = ? AND games.status = ? AND games.console_id = ?", playerID, models.Beaten, consoleID).
		Order("games.time_beating DESC").
		Scan(&resumedListGames).Error; err != nil {
		return nil, fmt.Errorf("error fetching resumed games list: %w", err)
	}

	return map[string]interface{}{
		"highlightGames":     highlightGames,
		"averageTimeBeating": stats.AverageHours,
		"listGame":           resumedListGames,
		"totalGamesFinished": stats.TotalGames,
		"totalHoursPlayed":   stats.TotalHours,
	}, nil
}

func (s *StatsService) GetBeatedStatsByReleaseYear(playerID uint, releaseYear int) (map[string]interface{}, error) {
	var stats AggregatedStats
	if err := s.db.Model(&models.Game{}).
		Select("COALESCE(SUM(time_beating), 0) as total_hours, COALESCE(AVG(time_beating), 0) as average_hours, COUNT(id_game) as total_games").
		Where("player_id = ? AND status = ? AND release_year = ?", playerID, models.Beaten, releaseYear).
		Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("error fetching aggregated stats by release year: %w", err)
	}

	if stats.TotalGames == 0 {
		return map[string]interface{}{
			"highlightGames":     []HighlightGame{},
			"averageTimeBeating": 0.0,
			"listGame":           []ResumedReleaseYearGame{},
			"totalGamesFinished": 0,
			"totalHoursPlayed":   0.0,
		}, nil
	}

	var longestGame, shortestGame, medianGame models.Game
	if err := s.db.Where("player_id = ? AND status = ? AND release_year = ?", playerID, models.Beaten, releaseYear).
		Order("time_beating DESC").First(&longestGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching longest game: %w", err)
	}

	if err := s.db.Where("player_id = ? AND status = ? AND release_year = ?", playerID, models.Beaten, releaseYear).
		Order("time_beating ASC").First(&shortestGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching shortest game: %w", err)
	}

	medianOffset := int(stats.TotalGames / 2)
	if err := s.db.Where("player_id = ? AND status = ? AND release_year = ?", playerID, models.Beaten, releaseYear).
		Order("time_beating ASC").Offset(medianOffset).First(&medianGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching median game: %w", err)
	}

	highlightGames := []HighlightGame{
		{
			NameGame:    longestGame.NameGame,
			TimeBeating: longestGame.TimeBeating,
			TypeItem:    "Maior duração",
		},
		{
			NameGame:    shortestGame.NameGame,
			TimeBeating: shortestGame.TimeBeating,
			TypeItem:    "Menor duração",
		},
		{
			NameGame:    medianGame.NameGame,
			TimeBeating: medianGame.TimeBeating,
			TypeItem:    "Mediana do ano",
		},
	}

	var resumedListGames []ResumedReleaseYearGame
	if err := s.db.Table("games").
		Select("games.name_game, games.time_beating, consoles.name_console AS console, genres.name_genre AS genre").
		Joins("LEFT JOIN consoles ON consoles.id_console = games.console_id").
		Joins("LEFT JOIN genres ON genres.id_genre = games.genre_id").
		Where("games.player_id = ? AND games.status = ? AND games.release_year = ?", playerID, models.Beaten, releaseYear).
		Order("games.time_beating DESC").
		Scan(&resumedListGames).Error; err != nil {
		return nil, fmt.Errorf("error fetching resumed games list: %w", err)
	}

	return map[string]interface{}{
		"highlightGames":     highlightGames,
		"averageTimeBeating": stats.AverageHours,
		"listGame":           resumedListGames,
		"totalGamesFinished": stats.TotalGames,
		"totalHoursPlayed":   stats.TotalHours,
	}, nil
}

func (s *StatsService) GetBeatedStatsByYear(playerID uint, year int) (map[string]interface{}, error) {
	type ShortGameInfo struct {
		NameGame    string     `json:"name_game" gorm:"column:name_game"`
		TimeBeating float64    `json:"time_beating" gorm:"column:time_beating"`
		DateBeating utils.Date `json:"date_beating" gorm:"column:date_beating"`
		Console     string     `json:"console" gorm:"column:console"`
		Genre       string     `json:"genre" gorm:"column:genre"`
	}

	var fiveMostPlayedBeaten []ShortGameInfo

	if err := s.db.Model(&models.Game{}).
		Select("games.name_game, games.time_beating, games.date_beating, consoles.name_console AS console, genres.name_genre AS genre").
		Joins("LEFT JOIN consoles ON consoles.id_console = games.console_id").
		Joins("LEFT JOIN genres ON genres.id_genre = games.genre_id").
		Where("games.player_id = ? AND games.status = ? AND EXTRACT(YEAR FROM games.date_beating) = ?", playerID, models.Beaten, year).
		Order("games.time_beating DESC").
		Limit(5).
		Find(&fiveMostPlayedBeaten).Error; err != nil {
		return nil, fmt.Errorf("error fetching short time beating games by year: %w", err)
	}

	var agg struct {
		TotalHours float64 `gorm:"column:total_hours"`
		TotalGames int     `gorm:"column:total_games"`
	}
	if err := s.db.Model(&models.Game{}).
		Select("COALESCE(SUM(time_beating), 0) as total_hours, COUNT(id_game) as total_games").
		Where("player_id = ? AND status = ? AND EXTRACT(YEAR FROM date_beating) = ?", playerID, models.Beaten, year).
		Scan(&agg).Error; err != nil {
		return nil, fmt.Errorf("error fetching year aggregated stats: %w", err)
	}

	type YearDetailGame struct {
		NameGame    string     `json:"NameGame" gorm:"column:name_game"`
		TimeBeating float64    `json:"TimeBeating" gorm:"column:time_beating"`
		DateBeating utils.Date `json:"DateBeating" gorm:"column:date_beating"`
		Console     string     `json:"Console" gorm:"column:console"`
		Genre       string     `json:"Genre" gorm:"column:genre"`
		ReleaseYear int        `json:"ReleaseYear" gorm:"column:release_year"`
	}

	var listGame []YearDetailGame
	if err := s.db.Table("games").
		Select("games.name_game, games.time_beating, games.date_beating, consoles.name_console AS console, genres.name_genre AS genre, games.release_year").
		Joins("LEFT JOIN consoles ON consoles.id_console = games.console_id").
		Joins("LEFT JOIN genres ON genres.id_genre = games.genre_id").
		Where("games.player_id = ? AND games.status = ? AND EXTRACT(YEAR FROM games.date_beating) = ?", playerID, models.Beaten, year).
		Order("games.name_game ASC").
		Scan(&listGame).Error; err != nil {
		return nil, fmt.Errorf("error fetching detailed games list by year: %w", err)
	}

	response := map[string]interface{}{
		"listGame":             listGame,
		"totalHoursPlayed":     agg.TotalHours,
		"totalGamesFinished":   agg.TotalGames,
		"fiveMostPlayedBeaten": fiveMostPlayedBeaten,
	}

	return response, nil
}

