package models

import (
	"fmt"
	"time"
)

type ErrorLog struct {
	IdError          uint      `gorm:"primaryKey" json:"id_error"`
	ConsoleName      string    `json:"console_name"`
	ManufacturerName string    `json:"manufacturer_name"`
	ErrorMessage     string    `json:"error_message"`
	LineNumber       int       `json:"line_number"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func (errorLog *ErrorLog) Validate() error {
	if errorLog.ConsoleName == "" || errorLog.ManufacturerName == "" || errorLog.ErrorMessage == "" {
		return fmt.Errorf("missing required fields")
	}
	return nil
}
