package models

import (
	"encoding/json"
	"time"
)

// AccessType struct
type AccessType int

const (
	Admin   AccessType = iota // 0
	Manager AccessType = iota // 1: Manager
)

func (a AccessType) String() string {
	return [...]string{"Admin", "Manager"}[a]
}

// Administrator struct
type Administrator struct {
	IdAdministrator uint       `gorm:"primaryKey" json:"id_administrator"`
	Name            string     `json:"name"`
	Email           string     `json:"email"`
	Nickname        string     `json:"nickname"`
	Password        string     `json:"password"`
	AccessType      AccessType `json:"access_type"`
	IsActive        bool       `json:"is_active"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type SafeAdministrator struct {
	IdAdministrator uint       `json:"id_administrator"`
	Name            string     `json:"name"`
	Email           string     `json:"email"`
	Nickname        string     `json:"nickname"`
	AccessType      AccessType `json:"access_type"`
	IsActive        bool       `json:"is_active"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// MarshalJSON customiza a serialização para nunca expor a senha de administradores
func (admin Administrator) MarshalJSON() ([]byte, error) {
	return json.Marshal(SafeAdministrator{
		IdAdministrator: admin.IdAdministrator,
		Name:            admin.Name,
		Email:           admin.Email,
		Nickname:        admin.Nickname,
		AccessType:      admin.AccessType,
		IsActive:        admin.IsActive,
		CreatedAt:       admin.CreatedAt,
		UpdatedAt:       admin.UpdatedAt,
	})
}
