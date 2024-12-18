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
	NameGame    string     `json:"name_game" validate:"required,min=1,max=255"`
	Developer   string     `json:"developer" validate:"required,min=1,max=255"`
	GenreID     uint       `json:"genre_id"`
	Genre       Genre      `gorm:"foreignKey:GenreID" json:"genre"`
	ConsoleID   uint       `json:"console_id"`
	Console     Console    `gorm:"foreignKey:ConsoleID" json:"console"`
	DateBeating utils.Date `json:"date_beating" validate:"omitempty"`
	TimeBeating float64    `json:"time_beating" validate:"gte=0"`
	ReleaseYear string     `json:"release_year" validate:"omitempty,len=4,numeric"`
	Status      StatusGame `json:"status"`
	PlayerID    uint       `json:"player_id" validate:"required"`
	Player      Player     `gorm:"foreignKey:PlayerID" json:"-"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (game *Game) Validate() error {
	validate := validator.New()
	return validate.Struct(game)
}
