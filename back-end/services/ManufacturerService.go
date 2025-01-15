package services

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"gorm.io/gorm"
)

type ManufacturerService struct {
	db *gorm.DB
}

func NewManufacturerService() *ManufacturerService {
	return &ManufacturerService{
		db: database.GetDatabase(),
	}
}

// AddManufacturer adiciona um novo fabricante
func (s *ManufacturerService) AddManufacturer(manufacturer *models.Manufacturer) error {
	if manufacturer.NameManufacturer == "" {
		return errors.New("insert a manufacturer name")
	}

	if manufacturer.YearFounded == 0 {
		return errors.New("insert a valid release year")
	}

	var existingManufacturer models.Manufacturer
	if err := s.db.Where("name_manufacturer = ?", manufacturer.NameManufacturer).First(&existingManufacturer).Error; err == nil {
		return errors.New("manufacturer already exists")
	}

	manufacturer.IsActive = true
	if err := s.db.Create(manufacturer).Error; err != nil {
		return fmt.Errorf("error creating manufacturer: %w", err)
	}

	return nil
}

// ListAllManufacturers retorna todos os fabricantes ativos
func (s *ManufacturerService) ListAllManufacturers() ([]models.Manufacturer, error) {
	var manufacturers []models.Manufacturer
	if err := s.db.Where("is_active = true").Order("name_manufacturer ASC").Find(&manufacturers).Error; err != nil {
		return nil, fmt.Errorf("error fetching manufacturers: %w", err)
	}
	return manufacturers, nil
}

// ListDeactivateManufacturers retorna todos os fabricantes inativos
func (s *ManufacturerService) ListDeactivateManufacturers() ([]models.Manufacturer, error) {
	var manufacturers []models.Manufacturer
	if err := s.db.Where("is_active = false").Order("name_manufacturer ASC").Find(&manufacturers).Error; err != nil {
		return nil, fmt.Errorf("error fetching deactivated manufacturers: %w", err)
	}
	return manufacturers, nil
}

// ViewManufacturer retorna um fabricante pelo ID
func (s *ManufacturerService) ViewManufacturer(id uint) (*models.Manufacturer, error) {
	var manufacturer models.Manufacturer
	if err := s.db.Where("id_manufacturer = ?", id).First(&manufacturer).Error; err != nil {
		return nil, fmt.Errorf("manufacturer not found: %w", err)
	}
	return &manufacturer, nil
}

// UpdateManufacturer atualiza um fabricante pelo ID
func (s *ManufacturerService) UpdateManufacturer(id uint, updatedManufacturer *models.Manufacturer) error {
	var manufacturer models.Manufacturer
	if err := s.db.Where("id_manufacturer = ?", id).First(&manufacturer).Error; err != nil {
		return fmt.Errorf("manufacturer not found: %w", err)
	}

	if updatedManufacturer.NameManufacturer != manufacturer.NameManufacturer {
		var existingManufacturer models.Manufacturer
		if err := s.db.Where("name_manufacturer = ? AND id_manufacturer != ?", updatedManufacturer.NameManufacturer, id).First(&existingManufacturer).Error; err == nil {
			return errors.New("manufacturer already exists")
		}
	}

	manufacturer.NameManufacturer = updatedManufacturer.NameManufacturer
	manufacturer.YearFounded = updatedManufacturer.YearFounded
	manufacturer.IsActive = updatedManufacturer.IsActive

	if err := s.db.Save(&manufacturer).Error; err != nil {
		return fmt.Errorf("error updating manufacturer: %w", err)
	}

	return nil
}

// DeleteManufacturer desativa um fabricante pelo ID
func (s *ManufacturerService) DeleteManufacturer(id uint) error {
	var manufacturer models.Manufacturer
	if err := s.db.Where("id_manufacturer = ?", id).First(&manufacturer).Error; err != nil {
		return fmt.Errorf("manufacturer not found: %w", err)
	}

	manufacturer.IsActive = false
	if err := s.db.Save(&manufacturer).Error; err != nil {
		return fmt.Errorf("error deactivating manufacturer: %w", err)
	}

	return nil
}

// ReactivateManufacturer reativa um fabricante pelo ID
func (s *ManufacturerService) ReactivateManufacturer(id uint) error {
	var manufacturer models.Manufacturer
	if err := s.db.Where("id_manufacturer = ?", id).First(&manufacturer).Error; err != nil {
		return fmt.Errorf("manufacturer not found: %w", err)
	}

	if manufacturer.IsActive {
		return errors.New("manufacturer already activated")
	}

	manufacturer.IsActive = true
	if err := s.db.Save(&manufacturer).Error; err != nil {
		return fmt.Errorf("error reactivating manufacturer: %w", err)
	}

	return nil
}

// ImportManufacturersFromCSV importa fabricantes a partir de um arquivo CSV
func (s *ManufacturerService) ImportManufacturersFromCSV(file io.Reader) error {
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
	seenManufacturers := make(map[string]struct{})
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("error reading CSV file: %w", err)
		}

		if recordIndex == 0 && strings.ToLower(record[0]) == "fabricante" {
			recordIndex++
			continue
		}

		if len(record) < 2 || record[0] == "" || record[1] == "" {
			tx.Rollback()
			return fmt.Errorf("invalid record at line %d", recordIndex+1)
		}

		manufacturerName := strings.TrimSpace(record[0])
		yearFounded, err := strconv.Atoi(strings.TrimSpace(record[1]))
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("invalid year format at line %d: %w", recordIndex+1, err)
		}

		if _, exists := seenManufacturers[manufacturerName]; exists {
			recordIndex++
			continue
		}
		seenManufacturers[manufacturerName] = struct{}{}

		manufacturer := models.Manufacturer{
			NameManufacturer: manufacturerName,
			YearFounded:      yearFounded,
			IsActive:         true,
		}

		if err := manufacturer.Validate(); err != nil {
			tx.Rollback()
			return fmt.Errorf("validation error at line %d: %w", recordIndex+1, err)
		}

		var existingManufacturer models.Manufacturer
		if err := tx.Where("name_manufacturer = ?", manufacturer.NameManufacturer).First(&existingManufacturer).Error; err == nil {
			recordIndex++
			continue
		}

		if err := tx.Create(&manufacturer).Error; err != nil {
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
