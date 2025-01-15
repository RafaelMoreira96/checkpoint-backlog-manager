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

// ListBacklogGames lista os jogos no backlog do jogador
func (s *BacklogService) ListBacklogGames(playerID uint) ([]models.Game, error) {
	var games []models.Game
	if err := s.db.Preload("Genre").Preload("Console").Where("player_id = ? AND status = 1", playerID).Find(&games).Error; err != nil {
		return nil, fmt.Errorf("error listing games: %w", err)
	}

	return games, nil
}
