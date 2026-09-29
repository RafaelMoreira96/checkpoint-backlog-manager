package models

import (
	"time"

	"github.com/go-playground/validator/v10"
)

type Genre struct {
	IdGenre     uint      `gorm:"primaryKey" json:"id_genre"`
	NameGenre   string    `json:"name_genre"`
	IgdbGenreID *uint     `gorm:"column:igdb_genre_id;index" json:"igdb_genre_id,omitempty"`
	IgdbSlug    *string   `gorm:"column:igdb_slug;index" json:"igdb_slug,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (genre *Genre) Validate() error {
	validate := validator.New()
	return validate.Struct(genre)
}
