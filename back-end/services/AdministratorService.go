package services

import (
	"errors"
	"fmt"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdministratorService struct {
	db *gorm.DB
}

func NewAdministratorService() *AdministratorService {
	return &AdministratorService{
		db: database.GetDatabase(),
	}
}

// AddAdministrator cria um novo administrador
func (s *AdministratorService) AddAdministrator(administrator *models.Administrator) error {
	if administrator.Nickname == "" {
		return errors.New("nickname is required")
	}

	if administrator.Password == "" {
		return errors.New("password is required")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(administrator.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("error hashing password: %w", err)
	}

	administrator.Password = string(hashedPassword)

	var existingAdmin models.Administrator
	if err := s.db.Where("nickname = ? OR email = ?", administrator.Nickname, administrator.Email).First(&existingAdmin).Error; err == nil {
		return errors.New("nickname or email already exists")
	}

	administrator.IsActive = true
	if err := s.db.Create(administrator).Error; err != nil {
		return fmt.Errorf("error creating administrator: %w", err)
	}

	return nil
}

// GetAdministratorByID retorna um administrador pelo ID
func (s *AdministratorService) GetAdministratorByID(id uint) (*models.Administrator, error) {
	var administrator models.Administrator
	if err := s.db.Where("id_administrator = ? AND is_active = true", id).First(&administrator).Error; err != nil {
		return nil, fmt.Errorf("administrator not found: %w", err)
	}
	return &administrator, nil
}

// ListAdministrators retorna uma lista de todos os administradores ativos
func (s *AdministratorService) ListAdministrators() ([]models.Administrator, error) {
	var administrators []models.Administrator
	if err := s.db.Where("is_active = true").Find(&administrators).Error; err != nil {
		return nil, fmt.Errorf("error getting administrators: %w", err)
	}
	return administrators, nil
}

// DeactivateAdministrator desativa um administrador pelo ID
func (s *AdministratorService) DeactivateAdministrator(id uint) error {
	var administrator models.Administrator
	if err := s.db.Where("id_administrator = ?", id).First(&administrator).Error; err != nil {
		return fmt.Errorf("administrator not found: %w", err)
	}

	administrator.IsActive = false
	if err := s.db.Save(&administrator).Error; err != nil {
		return fmt.Errorf("error deactivating administrator: %w", err)
	}

	return nil
}

// UpdateAdministrator atualiza um administrador pelo ID
func (s *AdministratorService) UpdateAdministrator(id uint, updatedAdmin *models.Administrator) error {
	var administrator models.Administrator
	if err := s.db.Where("id_administrator = ?", id).First(&administrator).Error; err != nil {
		return fmt.Errorf("administrator not found: %w", err)
	}

	if updatedAdmin.Name != "" {
		administrator.Name = updatedAdmin.Name
	}

	if updatedAdmin.Email != "" {
		administrator.Email = updatedAdmin.Email
	}

	if updatedAdmin.Nickname != "" {
		administrator.Nickname = updatedAdmin.Nickname
	}

	if updatedAdmin.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updatedAdmin.Password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("error hashing password: %w", err)
		}
		administrator.Password = string(hashedPassword)
	}

	if err := s.db.Save(&administrator).Error; err != nil {
		return fmt.Errorf("error updating administrator: %w", err)
	}

	return nil
}
