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
	AvatarUrl  string    `json:"avatar_url"`
	BannerUrl  string    `json:"banner_url"`
	Bio        string    `gorm:"type:varchar(300)" json:"bio"`
	IsPublic   bool      `gorm:"default:true" json:"is_public"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type SafePlayer struct {
	IdPlayer   uint      `json:"id_player"`
	NamePlayer string    `json:"name_player"`
	Email      string    `json:"email"`
	Nickname   string    `json:"nickname"`
	AvatarUrl  string    `json:"avatar_url"`
	BannerUrl  string    `json:"banner_url"`
	Bio        string    `json:"bio"`
	IsPublic   bool      `json:"is_public"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type UpdatePlayerInput struct {
	NamePlayer *string `json:"name_player"`
	Nickname   *string `json:"nickname"`
	Password   *string `json:"password"`
	AvatarUrl  *string `json:"avatar_url"`
	BannerUrl  *string `json:"banner_url"`
	Bio        *string `json:"bio"`
	IsPublic   *bool   `json:"is_public"`
}

// MarshalJSON customiza a serialização para nunca expor a senha em respostas JSON
func (player Player) MarshalJSON() ([]byte, error) {
	return json.Marshal(SafePlayer{
		IdPlayer:   player.IdPlayer,
		NamePlayer: player.NamePlayer,
		Email:      player.Email,
		Nickname:   player.Nickname,
		AvatarUrl:  player.AvatarUrl,
		BannerUrl:  player.BannerUrl,
		Bio:        player.Bio,
		IsPublic:   player.IsPublic,
		IsActive:   player.IsActive,
		CreatedAt:  player.CreatedAt,
		UpdatedAt:  player.UpdatedAt,
	})
}

func (player *Player) Validate() error {
	validate := validator.New()
	return validate.Struct(player)
}
