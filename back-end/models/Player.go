package models

import (
	"encoding/json"
	"time"

	"github.com/go-playground/validator/v10"
)

type Player struct {
	IdPlayer   uint      `gorm:"primaryKey" json:"id_player"`
	NamePlayer string    `json:"name_player"`
	Email      string    `json:"email"`
	Nickname   string    `json:"nickname"`
	Password   string    `json:"password"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type SafePlayer struct {
	IdPlayer   uint      `json:"id_player"`
	NamePlayer string    `json:"name_player"`
	Email      string    `json:"email"`
	Nickname   string    `json:"nickname"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// MarshalJSON customiza a serialização para nunca expor a senha em respostas JSON
func (player Player) MarshalJSON() ([]byte, error) {
	return json.Marshal(SafePlayer{
		IdPlayer:   player.IdPlayer,
		NamePlayer: player.NamePlayer,
		Email:      player.Email,
		Nickname:   player.Nickname,
		IsActive:   player.IsActive,
		CreatedAt:  player.CreatedAt,
		UpdatedAt:  player.UpdatedAt,
	})
}

func (player *Player) Validate() error {
	validate := validator.New()
	return validate.Struct(player)
}
