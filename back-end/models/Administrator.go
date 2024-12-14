package models

import "time"

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
