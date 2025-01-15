package services

import (
	"sort"
	"time"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"gorm.io/gorm"
)

type DashboardService struct {
	db *gorm.DB
}

func NewDashboardService() *DashboardService {
	return &DashboardService{
		db: database.GetDatabase(),
	}
}

// GetLastGamesBeatingAdded retorna os últimos jogos finalizados por um jogador
func (s *DashboardService) GetLastGamesBeatingAdded(playerID uint) ([]models.Game, error) {
	var games []models.Game
	if err := s.db.Preload("Console").Preload("Genre").
		Where("player_id = ? AND status = 0", playerID).
		Order("date_beating DESC").
		Limit(5).
		Find(&games).Error; err != nil {
		return nil, err
	}
	return games, nil
}

// GetLastGamesBacklogAdded retorna os últimos jogos adicionados ao backlog por um jogador
func (s *DashboardService) GetLastGamesBacklogAdded(playerID uint) ([]models.Game, error) {
	var games []models.Game
	if err := s.db.Preload("Console").Preload("Genre").
		Where("player_id = ? AND status = 1", playerID).
		Order("created_at DESC").
		Limit(5).
		Find(&games).Error; err != nil {
		return nil, err
	}
	return games, nil
}

// GetCardsInfo retorna as estatísticas do jogador (horas jogadas, gêneros preferidos, etc.)
func (s *DashboardService) GetCardsInfo(playerID uint) (map[string]interface{}, error) {
	var games []models.Game
	if err := s.db.Preload("Genre").Where("player_id = ? AND status = 0", playerID).Find(&games).Error; err != nil {
		return nil, err
	}

	genreCount := make(map[uint]int)
	var totalHoursPlayed float64
	var totalHoursPlayedThisMonth float64
	var gamesFinishedThisMonth int
	totalGamesFinished := len(games)

	currentYear, currentMonth, _ := time.Now().Date()
	for _, game := range games {
		if game.GenreID != nil {
			genreCount[*game.GenreID]++
		}

		totalHoursPlayed += game.TimeBeating

		if game.DateBeating.Year() == currentYear && game.DateBeating.Month() == currentMonth {
			gamesFinishedThisMonth++
			totalHoursPlayedThisMonth += game.TimeBeating
		}
	}

	var genres []models.Genre
	if err := s.db.Find(&genres).Error; err != nil {
		return nil, err
	}

	type GenreStat struct {
		Name  string
		Count int
	}
	var stats []GenreStat
	for _, genre := range genres {
		stats = append(stats, GenreStat{
			Name:  genre.NameGenre,
			Count: genreCount[genre.IdGenre],
		})
	}

	sort.Slice(stats, func(i, j int) bool {
		return stats[i].Count > stats[j].Count
	})

	result := map[string]interface{}{
		"total_hours_played":            totalHoursPlayed,
		"games_finished_this_month":     gamesFinishedThisMonth,
		"total_hours_played_this_month": totalHoursPlayedThisMonth,
		"total_games_finished":          totalGamesFinished,
	}

	if len(stats) > 0 {
		result["most_used"] = stats[0].Name
	}
	if len(stats) > 1 {
		result["second_most_used"] = stats[1].Name
	}
	if len(stats) > 0 {
		result["least_used"] = stats[len(stats)-1].Name
	}

	return result, nil
}

// GetLastPlayersRegistered retorna os últimos jogadores registrados
func (s *DashboardService) GetLastPlayersRegistered() ([]models.Player, error) {
	var players []models.Player
	if err := s.db.Where("is_active = true").Order("created_at DESC").Limit(5).Find(&players).Error; err != nil {
		return nil, err
	}
	return players, nil
}

// GetLastAdminsRegistered retorna os últimos administradores registrados
func (s *DashboardService) GetLastAdminsRegistered() ([]models.Administrator, error) {
	var admins []models.Administrator
	if err := s.db.Where("is_active = true").Order("created_at DESC").Limit(5).Find(&admins).Error; err != nil {
		return nil, err
	}
	return admins, nil
}

// GetAdminCardsInfo retorna as estatísticas do painel de administração
func (s *DashboardService) GetAdminCardsInfo() (map[string]interface{}, error) {
	var gamesCount int64
	if err := s.db.Model(&models.Game{}).Where("status = 0").Count(&gamesCount).Error; err != nil {
		return nil, err
	}

	var genreCount int64
	if err := s.db.Model(&models.Genre{}).Where("is_active = true").Count(&genreCount).Error; err != nil {
		return nil, err
	}

	var playerCount int64
	if err := s.db.Model(&models.Player{}).Where("is_active = true").Count(&playerCount).Error; err != nil {
		return nil, err
	}

	var adminCount int64
	if err := s.db.Model(&models.Administrator{}).Where("is_active = true").Count(&adminCount).Error; err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"total_games":          gamesCount,
		"total_genres":         genreCount,
		"total_players":        playerCount,
		"total_administrators": adminCount,
	}

	return result, nil
}
