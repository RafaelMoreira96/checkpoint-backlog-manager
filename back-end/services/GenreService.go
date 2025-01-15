package services

import (
	"encoding/csv"
	"fmt"
	"io"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"gorm.io/gorm"
)

type GenreService struct {
	db *gorm.DB
}

func NewGenreService() *GenreService {
	return &GenreService{
		db: database.GetDatabase(),
	}
}

// AddGenre adiciona um novo gênero
func (s *GenreService) AddGenre(genre *models.Genre) error {
	if genre.NameGenre == "" {
		return fmt.Errorf("insert a genre name")
	}

	var existingGenre models.Genre
	if err := s.db.Where("name_genre = ?", genre.NameGenre).First(&existingGenre).Error; err == nil {
		return fmt.Errorf("genre already exists")
	}

	genre.IsActive = true
	if err := s.db.Create(genre).Error; err != nil {
		return fmt.Errorf("error creating genre: %w", err)
	}

	return nil
}

// ListAllGenres retorna todos os gêneros ativos
func (s *GenreService) ListAllGenres() ([]models.Genre, error) {
	var genres []models.Genre
	if err := s.db.Where("is_active = true").Order("name_genre ASC").Find(&genres).Error; err != nil {
		return nil, fmt.Errorf("error fetching genres: %w", err)
	}
	return genres, nil
}

// ListDeactivateGenres retorna todos os gêneros inativos
func (s *GenreService) ListDeactivateGenres() ([]models.Genre, error) {
	var genres []models.Genre
	if err := s.db.Where("is_active = false").Order("name_genre ASC").Find(&genres).Error; err != nil {
		return nil, fmt.Errorf("error fetching deactivated genres: %w", err)
	}
	return genres, nil
}

// ViewGenre retorna um gênero pelo ID
func (s *GenreService) ViewGenre(id uint) (*models.Genre, error) {
	var genre models.Genre
	if err := s.db.Where("id_genre = ?", id).First(&genre).Error; err != nil {
		return nil, fmt.Errorf("genre not found: %w", err)
	}
	return &genre, nil
}

// UpdateGenre atualiza um gênero pelo ID
func (s *GenreService) UpdateGenre(id uint, updatedGenre *models.Genre) error {
	var genre models.Genre
	if err := s.db.Where("id_genre = ?", id).First(&genre).Error; err != nil {
		return fmt.Errorf("genre not found: %w", err)
	}

	if updatedGenre.NameGenre == "" {
		return fmt.Errorf("insert a genre name")
	}

	genre.NameGenre = updatedGenre.NameGenre
	if err := s.db.Save(&genre).Error; err != nil {
		return fmt.Errorf("error updating genre: %w", err)
	}

	return nil
}

// ReactivateGenre reativa um gênero pelo ID
func (s *GenreService) ReactivateGenre(id uint) error {
	var genre models.Genre
	if err := s.db.Where("id_genre = ?", id).First(&genre).Error; err != nil {
		return fmt.Errorf("genre not found: %w", err)
	}

	if genre.IsActive {
		return fmt.Errorf("genre already activated")
	}

	genre.IsActive = true
	if err := s.db.Save(&genre).Error; err != nil {
		return fmt.Errorf("error reactivating genre: %w", err)
	}

	return nil
}

// DeleteGenre desativa um gênero pelo ID
func (s *GenreService) DeleteGenre(id uint) error {
	var genre models.Genre
	if err := s.db.Where("id_genre = ?", id).First(&genre).Error; err != nil {
		return fmt.Errorf("genre not found: %w", err)
	}

	genre.IsActive = false
	if err := s.db.Save(&genre).Error; err != nil {
		return fmt.Errorf("error deactivating genre: %w", err)
	}

	return nil
}

// ImportGenresFromCSV importa gêneros a partir de um arquivo CSV
func (s *GenreService) ImportGenresFromCSV(file io.Reader) error {
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
	seenGenres := make(map[string]struct{})
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("error reading CSV file: %w", err)
		}

		if recordIndex == 0 && strings.ToLower(record[0]) == "name_genre" {
			recordIndex++
			continue
		}

		if len(record) < 1 || record[0] == "" {
			tx.Rollback()
			return fmt.Errorf("invalid record at line %d", recordIndex+1)
		}

		genreName := strings.TrimSpace(record[0])
		if _, exists := seenGenres[genreName]; exists {
			recordIndex++
			continue
		}
		seenGenres[genreName] = struct{}{}

		genre := models.Genre{
			NameGenre: genreName,
			IsActive:  true,
		}

		if err := genre.Validate(); err != nil {
			tx.Rollback()
			return fmt.Errorf("validation error at line %d: %w", recordIndex+1, err)
		}

		var existingGenre models.Genre
		if err := tx.Where("name_genre = ?", genre.NameGenre).First(&existingGenre).Error; err == nil {
			recordIndex++
			continue
		}

		if err := tx.Create(&genre).Error; err != nil {
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
