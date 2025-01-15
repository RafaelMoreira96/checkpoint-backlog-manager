package services

import (
	"errors"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/security"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService() *AuthService {
	return &AuthService{
		db: database.GetDatabase(),
	}
}

// LoginPlayer realiza o login de um jogador
func (s *AuthService) LoginPlayer(nickname, password string) (string, error) {
	if nickname == "" || password == "" {
		return "", errors.New("nickname and password are required")
	}

	var player models.Player
	if err := s.db.Where("nickname = ?", nickname).First(&player).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("user not found")
		}
		return "", errors.New("internal server error")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(player.Password), []byte(password)); err != nil {
		return "", errors.New("credentials are not valid")
	}

	if !player.IsActive {
		return "", errors.New("account deactivated")
	}

	token, err := security.GenerateJWT(player.NamePlayer, player.Nickname, player.IsActive, player.IdPlayer, "player", 2)
	if err != nil {
		return "", errors.New("error generating token")
	}

	return token, nil
}

// LoginAdmin realiza o login de um administrador
func (s *AuthService) LoginAdmin(nickname, password string) (string, error) {
	nickname = strings.TrimSpace(nickname)
	password = strings.TrimSpace(password)

	if nickname == "" || password == "" {
		return "", errors.New("nickname and password are required")
	}

	var admin models.Administrator
	if err := s.db.Where("nickname = ?", nickname).First(&admin).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("user not found")
		}
		return "", errors.New("internal server error")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(password)); err != nil {
		return "", errors.New("credentials are not valid")
	}

	if !admin.IsActive {
		return "", errors.New("account deactivated")
	}

	token, err := security.GenerateJWT(admin.Name, admin.Nickname, admin.IsActive, admin.IdAdministrator, "admin", int(admin.AccessType))
	if err != nil {
		return "", errors.New("error generating token")
	}

	return token, nil
}
