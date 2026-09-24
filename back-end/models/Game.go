package models

import (
	"time"

	"github.com/RafaelMoreira96/game-beating-project/utils"
	"github.com/go-playground/validator/v10"
)

type StatusGame int

const (
	Beaten  StatusGame = iota // 0: Game beated
	Backlog                   // 1: Game in backlog
)

func (s StatusGame) String() string {
	status := [...]string{"Beaten", "Backlog"}
	if int(s) < len(status) {
		return status[s]
	}
	return "Unknown"
}

type Game struct {
	IdGame      uint       `gorm:"primaryKey" json:"id_game"`
	NameGame    string     `gorm:"index:idx_games_name" json:"name_game" validate:"required,min=1,max=255"`
	UrlImage    string     `json:"url_image"`
	Developer   string     `json:"developer" validate:"required,min=1,max=255"`
	GenreID     *uint      `gorm:"index:idx_games_genre" json:"genre_id"`
	Genre       Genre      `gorm:"foreignKey:GenreID" json:"genre"`
	ConsoleID   *uint      `gorm:"index:idx_games_console" json:"console_id"`
	Console     Console    `gorm:"foreignKey:ConsoleID" json:"console"`
	DateBeating utils.Date `gorm:"index:idx_games_date_beating" json:"date_beating"`
	TimeBeating float64    `json:"time_beating" validate:"gte=0"`
	ReleaseYear int        `json:"release_year" validate:"omitempty,numeric"`
	Status      StatusGame `gorm:"index:idx_player_status,priority:2" json:"status"`
	PlayerID    uint       `gorm:"index:idx_player_status,priority:1" json:"player_id" validate:"required"`
	Player      Player     `gorm:"foreignKey:PlayerID" json:"-"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (game *Game) Validate() error {
	validate := validator.New()
	return validate.Struct(game)
}
