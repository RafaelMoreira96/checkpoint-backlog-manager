package services

import (
	"errors"
	"fmt"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/security"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type PlayerService struct {
	db *gorm.DB
}

func NewPlayerService() *PlayerService {
	return &PlayerService{
		db: database.GetDatabase(),
	}
}

// AddPlayer cria um novo jogador
func (s *PlayerService) AddPlayer(player *models.Player) error {
	if player.NamePlayer == "" {
		return errors.New("player name is required")
	}

	if player.Password == "" {
		return errors.New("password is required")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(player.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("error hashing password: %w", err)
	}

	player.Password = string(hashedPassword)
	player.IsActive = true

	var existingPlayer models.Player
	if err := s.db.Where("nickname = ?", player.Nickname).First(&existingPlayer).Error; err == nil {
		return errors.New("nickname already exists")
	}

	if err := s.db.Create(player).Error; err != nil {
		return fmt.Errorf("error creating player: %w", err)
	}

	return nil
}

// DeletePlayer desativa um jogador pelo ID
func (s *PlayerService) DeletePlayer(playerID uint) error {
	var player models.Player
	if err := s.db.Where("id_player = ?", playerID).First(&player).Error; err != nil {
		return fmt.Errorf("player not found: %w", err)
	}

	player.IsActive = false
	if err := s.db.Save(&player).Error; err != nil {
		return fmt.Errorf("error deactivating player: %w", err)
	}

	return nil
}

// UpdatePlayer atualiza um jogador pelo ID
func (s *PlayerService) UpdatePlayer(playerID uint, updatedPlayer *models.Player) error {
	var player models.Player
	if err := s.db.Where("id_player = ?", playerID).First(&player).Error; err != nil {
		return fmt.Errorf("player not found: %w", err)
	}

	if updatedPlayer.NamePlayer != "" {
		player.NamePlayer = updatedPlayer.NamePlayer
	}

	if updatedPlayer.Nickname != "" {
		var existingPlayer models.Player
		if err := s.db.Where("nickname = ? AND id_player != ?", updatedPlayer.Nickname, playerID).First(&existingPlayer).Error; err == nil {
			return errors.New("nickname already exists")
		}
		player.Nickname = updatedPlayer.Nickname
	}

	if updatedPlayer.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updatedPlayer.Password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("error hashing password: %w", err)
		}
		player.Password = string(hashedPassword)
	}

	if err := s.db.Save(&player).Error; err != nil {
		return fmt.Errorf("error updating player: %w", err)
	}

	return nil
}

// ViewPlayerProfileInfo retorna o perfil do jogador com informações adicionais
func (s *PlayerService) ViewPlayerProfileInfo(playerID uint) (*models.Player, int, int, error) {
	var player models.Player
	if err := s.db.Where("id_player = ?", playerID).First(&player).Error; err != nil {
		return nil, 0, 0, fmt.Errorf("player not found: %w", err)
	}

	var games []models.Game
	if err := s.db.Where("player_id = ?", playerID).Find(&games).Error; err != nil {
		return nil, 0, 0, fmt.Errorf("error getting games: %w", err)
	}

	finishedGames := 0
	backlogGames := 0
	for _, game := range games {
		if game.Status == 0 {
			finishedGames++
		} else {
			backlogGames++
		}
	}

	return &player, finishedGames, backlogGames, nil
}

// GetAllPlayers retorna todos os jogadores (para administradores)
func (s *PlayerService) GetAllPlayers() ([]models.Player, error) {
	var players []models.Player
	if err := s.db.Find(&players).Error; err != nil {
		return nil, fmt.Errorf("error fetching players: %w", err)
	}
	return players, nil
}

// RequestPasswordReset envia um e-mail de recuperação de senha
func (s *PlayerService) RequestPasswordReset(email string) error {
	var player models.Player
	if err := s.db.Where("email = ?", email).First(&player).Error; err != nil {
		return fmt.Errorf("email not found: %w", err)
	}

	token, err := security.GeneratePasswordResetToken(player.Email)
	if err != nil {
		return fmt.Errorf("error generating token: %w", err)
	}

	if err := security.SendPasswordResetEmail(player.Email, token); err != nil {
		return fmt.Errorf("error sending email: %w", err)
	}

	return nil
}
