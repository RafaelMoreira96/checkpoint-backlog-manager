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

	// Garante que jogadores existentes tenham is_public = true por padrão
	db.Exec("UPDATE players SET is_public = true WHERE is_public IS NULL")
}
