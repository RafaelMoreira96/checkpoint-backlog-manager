package database

import (
	"log"

	"github.com/RafaelMoreira96/game-beating-project/database/migrations"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func Connect() *gorm.DB {
	database, err := gorm.Open(sqlite.Open("files/database.sqlite"), &gorm.Config{})
	if err != nil {
		log.Fatal("Erro: ", err)
		return nil
	}

	db = database
	migrations.RunMigrations(db)

	return db.Begin()
}

func GetDatabase() *gorm.DB {

	db.Exec("PRAGMA cache_size = 10000")
	db.Exec("PRAGMA temp_store = MEMORY")
	db.Exec("PRAGMA synchronous = OFF")
	db.Exec("PRAGMA journal_mode = WAL")

	return db
}
