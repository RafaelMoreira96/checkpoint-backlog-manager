package migrations

import (
	"github.com/RafaelMoreira96/game-beating-project/models"
	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB) {
	db.AutoMigrate(
		models.Manufacturer{},
		models.Console{},
		models.Player{},
		models.Genre{},
		models.Game{},
		models.Administrator{},
		models.ProjectUpdateLog{},
		models.ErrorLog{},
	)
}
