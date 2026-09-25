package services

import (
	"errors"
	"fmt"
	"strings"

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
	player.IsPublic = true

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
func (s *PlayerService) UpdatePlayer(playerID uint, input *models.UpdatePlayerInput) (*models.Player, error) {
	var player models.Player
	if err := s.db.Where("id_player = ?", playerID).First(&player).Error; err != nil {
		return nil, fmt.Errorf("player not found: %w", err)
	}

	if input.NamePlayer != nil && *input.NamePlayer != "" {
		player.NamePlayer = *input.NamePlayer
	}

	if input.Nickname != nil && *input.Nickname != "" {
		var existingPlayer models.Player
		if err := s.db.Where("nickname = ? AND id_player != ?", *input.Nickname, playerID).First(&existingPlayer).Error; err == nil {
			return nil, errors.New("nickname already exists")
		}
		player.Nickname = *input.Nickname
	}

	if input.Password != nil && *input.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, fmt.Errorf("error hashing password: %w", err)
		}
		player.Password = string(hashedPassword)
	}

	if input.AvatarUrl != nil {
		if *input.AvatarUrl == "CLEAR" {
			player.AvatarUrl = ""
		} else {
			player.AvatarUrl = *input.AvatarUrl
		}
	}

	if input.BannerUrl != nil {
		if *input.BannerUrl == "CLEAR" {
			player.BannerUrl = ""
		} else {
			player.BannerUrl = *input.BannerUrl
		}
	}

	if input.Bio != nil {
		cleanBio := strings.TrimSpace(*input.Bio)
		if len([]rune(cleanBio)) > 300 {
			return nil, errors.New("a biografia deve ter no máximo 300 caracteres")
		}
		player.Bio = cleanBio
	}

	if input.IsPublic != nil {
		player.IsPublic = *input.IsPublic
	}

	if err := s.db.Save(&player).Error; err != nil {
		return nil, fmt.Errorf("error updating player: %w", err)
	}

	player.Password = ""
	return &player, nil
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

// ResetPassword valida o token e redefine a senha do jogador
func (s *PlayerService) ResetPassword(token, newPassword string) error {
	email, err := security.ValidatePasswordResetToken(token)
	if err != nil {
		return fmt.Errorf("token inválido ou expirado: %w", err)
	}

	if len(newPassword) < 6 {
		return errors.New("a nova senha deve possuir pelo menos 6 caracteres")
	}

	var player models.Player
	if err := s.db.Where("email = ?", email).First(&player).Error; err != nil {
		return fmt.Errorf("jogador não encontrado: %w", err)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("erro ao gerar hash da nova senha: %w", err)
	}

	player.Password = string(hashedPassword)
	if err := s.db.Save(&player).Error; err != nil {
		return fmt.Errorf("erro ao atualizar senha: %w", err)
	}

	return nil
}

// PublicProfileResponse representa os dados de um perfil público ou privado
type PublicProfileResponse struct {
	IsPrivate             bool              `json:"is_private"`
	Message               string            `json:"message,omitempty"`
	Player                models.SafePlayer `json:"player"`
	QuantityFinishedGames int               `json:"quantity_finished_games"`
	QuantityBacklogGames  int               `json:"quantity_backlog_games"`
	RecentGames           []models.Game     `json:"recent_games,omitempty"`
}

// GetPublicProfile busca o perfil de um jogador pelo nickname e aplica regras de privacidade
func (s *PlayerService) GetPublicProfile(nickname string, viewerPlayerID uint) (*PublicProfileResponse, error) {
	var player models.Player
	if err := s.db.Where("LOWER(nickname) = LOWER(?)", strings.TrimSpace(nickname)).First(&player).Error; err != nil {
		return nil, fmt.Errorf("player not found: %w", err)
	}

	isOwner := (viewerPlayerID != 0 && viewerPlayerID == player.IdPlayer)

	safe := models.SafePlayer{
		IdPlayer:   player.IdPlayer,
		NamePlayer: player.NamePlayer,
		Email:      "", // Não expor e-mail publicamente
		Nickname:   player.Nickname,
		AvatarUrl:  player.AvatarUrl,
		BannerUrl:  player.BannerUrl,
		Bio:        player.Bio,
		IsPublic:   player.IsPublic,
		IsActive:   player.IsActive,
		CreatedAt:  player.CreatedAt,
		UpdatedAt:  player.UpdatedAt,
	}

	// Se o perfil for privado e o visitante não for o próprio dono
	if !player.IsPublic && !isOwner {
		return &PublicProfileResponse{
			IsPrivate: true,
			Message:   "Este perfil é privado. As estatísticas e biblioteca de jogos estão visíveis apenas para o proprietário.",
			Player: models.SafePlayer{
				IdPlayer:   player.IdPlayer,
				Nickname:   player.Nickname,
				NamePlayer: player.NamePlayer,
				AvatarUrl:  player.AvatarUrl,
				BannerUrl:  player.BannerUrl,
				Bio:        player.Bio,
				IsPublic:   false,
			},
		}, nil
	}

	// Perfil público ou dono visualizando: carrega contagens e jogos zerados recentes
	var games []models.Game
	s.db.Preload("Genre").Preload("Console").Where("player_id = ?", player.IdPlayer).Find(&games)

	finishedGames := 0
	backlogGames := 0
	var recentBeaten []models.Game

	for _, g := range games {
		if g.Status == 0 {
			finishedGames++
			if len(recentBeaten) < 6 {
				recentBeaten = append(recentBeaten, g)
			}
		} else {
			backlogGames++
		}
	}

	return &PublicProfileResponse{
		IsPrivate:             false,
		Player:                safe,
		QuantityFinishedGames: finishedGames,
		QuantityBacklogGames:  backlogGames,
		RecentGames:           recentBeaten,
	}, nil
}
