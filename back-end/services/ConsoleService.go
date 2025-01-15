package services

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"gorm.io/gorm"
)

type ConsoleService struct {
	db *gorm.DB
}

func NewConsoleService() *ConsoleService {
	return &ConsoleService{
		db: database.GetDatabase(),
	}
}

// AddConsole adiciona um novo console
func (s *ConsoleService) AddConsole(console *models.Console) error {
	if console.ManufacturerID == 0 {
		return errors.New("manufacturer ID is required")
	}

	var manufacturer models.Manufacturer
	if err := s.db.Where("id_manufacturer = ?", console.ManufacturerID).First(&manufacturer).Error; err != nil {
		return fmt.Errorf("manufacturer not found: %w", err)
	}

	var existingConsole models.Console
	if err := s.db.Where("name_console = ?", console.NameConsole).First(&existingConsole).Error; err == nil {
		return errors.New("console already exists")
	}

	console.IsActive = true
	if err := s.db.Create(console).Error; err != nil {
		return fmt.Errorf("error creating console: %w", err)
	}

	return nil
}

// GetConsoles retorna todos os consoles ativos
func (s *ConsoleService) GetConsoles() ([]models.Console, error) {
	var consoles []models.Console
	if err := s.db.Preload("Manufacturer").Where("is_active = true").Order("name_console ASC").Find(&consoles).Error; err != nil {
		return nil, fmt.Errorf("error fetching consoles: %w", err)
	}
	return consoles, nil
}

// GetInactiveConsoles retorna todos os consoles inativos
func (s *ConsoleService) GetInactiveConsoles() ([]models.Console, error) {
	var consoles []models.Console
	if err := s.db.Preload("Manufacturer").Where("is_active = false").Find(&consoles).Error; err != nil {
		return nil, fmt.Errorf("error fetching inactive consoles: %w", err)
	}
	return consoles, nil
}

// ViewConsole retorna um console pelo ID
func (s *ConsoleService) ViewConsole(id uint) (*models.Console, error) {
	var console models.Console
	if err := s.db.Preload("Manufacturer").Where("id_console = ?", id).First(&console).Error; err != nil {
		return nil, fmt.Errorf("console not found: %w", err)
	}
	return &console, nil
}

// UpdateConsole atualiza um console pelo ID
func (s *ConsoleService) UpdateConsole(id uint, updatedConsole *models.Console) error {
	var console models.Console
	if err := s.db.Where("id_console = ?", id).First(&console).Error; err != nil {
		return fmt.Errorf("console not found: %w", err)
	}

	if updatedConsole.NameConsole != "" {
		var existingConsole models.Console
		if err := s.db.Where("name_console = ? AND id_console != ?", updatedConsole.NameConsole, id).First(&existingConsole).Error; err == nil {
			return errors.New("console already exists")
		}
		console.NameConsole = updatedConsole.NameConsole
	}

	if updatedConsole.ManufacturerID != 0 {
		var manufacturer models.Manufacturer
		if err := s.db.Where("id_manufacturer = ?", updatedConsole.ManufacturerID).First(&manufacturer).Error; err != nil {
			return fmt.Errorf("manufacturer not found: %w", err)
		}
		console.ManufacturerID = updatedConsole.ManufacturerID
	}

	if !updatedConsole.IsActive {
		console.IsActive = updatedConsole.IsActive
	}

	if updatedConsole.ReleaseDate != "" {
		console.ReleaseDate = updatedConsole.ReleaseDate
	}

	if err := s.db.Save(&console).Error; err != nil {
		return fmt.Errorf("error updating console: %w", err)
	}

	return nil
}

// DeleteConsole desativa um console pelo ID
func (s *ConsoleService) DeleteConsole(id uint) error {
	var console models.Console
	if err := s.db.Where("id_console = ?", id).First(&console).Error; err != nil {
		return fmt.Errorf("console not found: %w", err)
	}

	console.IsActive = false
	if err := s.db.Save(&console).Error; err != nil {
		return fmt.Errorf("error deactivating console: %w", err)
	}

	return nil
}

// ReactivateConsole reativa um console pelo ID
func (s *ConsoleService) ReactivateConsole(id uint) error {
	var console models.Console
	if err := s.db.Where("id_console = ?", id).First(&console).Error; err != nil {
		return fmt.Errorf("console not found: %w", err)
	}

	console.IsActive = true
	if err := s.db.Save(&console).Error; err != nil {
		return fmt.Errorf("error reactivating console: %w", err)
	}

	return nil
}

// ImportConsolesFromCSV importa consoles a partir de um arquivo CSV
func (s *ConsoleService) ImportConsolesFromCSV(file io.Reader) error {
	reader := csv.NewReader(file)
	reader.Comma = ','
	reader.LazyQuotes = true

	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("error starting transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	recordIndex := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("error reading CSV file: %w", err)
		}

		if recordIndex == 0 && strings.ToLower(record[0]) == "nome do console" {
			recordIndex++
			continue
		}

		if len(record) < 3 || record[0] == "" || record[1] == "" || record[2] == "" {
			tx.Rollback()
			return fmt.Errorf("invalid record at line %d", recordIndex+1)
		}

		consoleName := strings.TrimSpace(record[0])
		manufacturerName := strings.TrimSpace(record[1])
		releaseDate := strings.TrimSpace(record[2])

		var manufacturer models.Manufacturer
		if err := tx.Where("name_manufacturer = ?", manufacturerName).First(&manufacturer).Error; err != nil {
			errorLog := models.ErrorLog{
				ConsoleName:      consoleName,
				ManufacturerName: manufacturerName,
				ErrorMessage:     "manufacturer not found",
				LineNumber:       recordIndex + 1,
			}

			if err := tx.Create(&errorLog).Error; err != nil {
				tx.Rollback()
				return fmt.Errorf("error saving error log: %w", err)
			}

			recordIndex++
			continue
		}

		console := models.Console{
			NameConsole:    consoleName,
			ManufacturerID: manufacturer.IdManufacturer,
			ReleaseDate:    releaseDate,
			IsActive:       true,
		}

		if err := console.Validate(); err != nil {
			tx.Rollback()
			return fmt.Errorf("validation error at line %d: %w", recordIndex+1, err)
		}

		if err := tx.Create(&console).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("error inserting record at line %d: %w", recordIndex+1, err)
		}

		recordIndex++
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}
