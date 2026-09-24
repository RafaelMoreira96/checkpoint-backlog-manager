package services

import (
	"errors"
	"fmt"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"gorm.io/gorm"
)

type BacklogService struct {
	db *gorm.DB
}

func NewBacklogService() *BacklogService {
	return &BacklogService{
		db: database.GetDatabase(),
	}
}

// AddBacklogGame adiciona um jogo ao backlog do jogador
func (s *BacklogService) AddBacklogGame(playerID uint, game *models.Game) error {
	if game.NameGame == "" {
		return errors.New("game name is required")
	}

	game.PlayerID = playerID
	game.Status = 1 // Status 1 = Backlog

	if err := s.db.Create(game).Error; err != nil {
		return fmt.Errorf("error creating game: %w", err)
	}

	return nil
}

// ListBacklogGames lista os jogos no backlog do jogador (com suporte opcional a paginação)
func (s *BacklogService) ListBacklogGames(playerID uint, page, limit int, search string) ([]models.Game, int64, error) {
	var games []models.Game
	var total int64

	query := s.db.Model(&models.Game{}).
		Where("player_id = ? AND status = ?", playerID, models.Backlog)

	if search != "" {
		query = query.Where("name_game ILIKE ?", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("error counting backlog games: %w", err)
	}

	query = query.
		Preload("Genre", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_genre, name_genre")
		}).
		Preload("Console", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_console, name_console")
		}).
		Order("name_game ASC")

	if page > 0 && limit > 0 {
		offset := (page - 1) * limit
		query = query.Offset(offset).Limit(limit)
	}

	if err := query.Find(&games).Error; err != nil {
		return nil, 0, fmt.Errorf("error listing backlog games: %w", err)
	}

	return games, total, nil
}
