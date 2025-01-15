package services

import (
	"errors"
	"fmt"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"gorm.io/gorm"
)

type LogService struct {
	db *gorm.DB
}

func NewLogService() *LogService {
	return &LogService{
		db: database.GetDatabase(),
	}
}

// AddLog adiciona um novo log de atualização do projeto
func (s *LogService) AddLog(log *models.ProjectUpdateLog) error {
	if log.Description == "" {
		return errors.New("insert a description")
	}

	if log.Content == "" {
		return errors.New("insert a content")
	}

	if err := s.db.Create(log).Error; err != nil {
		return fmt.Errorf("error creating log: %w", err)
	}

	return nil
}

// DeleteLog remove um log de atualização do projeto pelo ID
func (s *LogService) DeleteLog(id uint) error {
	var log models.ProjectUpdateLog
	if err := s.db.Where("id_project_update_log = ?", id).First(&log).Error; err != nil {
		return fmt.Errorf("log not found: %w", err)
	}

	if err := s.db.Delete(&log).Error; err != nil {
		return fmt.Errorf("error deleting log: %w", err)
	}

	return nil
}

// GetLogs retorna todos os logs de atualização do projeto
func (s *LogService) GetLogs() ([]models.ProjectUpdateLog, error) {
	var logs []models.ProjectUpdateLog
	if err := s.db.Preload("Author").Find(&logs).Error; err != nil {
		return nil, fmt.Errorf("error fetching logs: %w", err)
	}
	return logs, nil
}
