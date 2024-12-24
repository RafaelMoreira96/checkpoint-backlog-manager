package database

import (
	"log"

	"github.com/RafaelMoreira96/game-beating-project/database/migrations"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func ConnectOnSQLite() *gorm.DB {
	database, err := gorm.Open(sqlite.Open("files/database.sqlite"), &gorm.Config{})
	if err != nil {
		log.Fatal("Erro: ", err)
		return nil
	}

	db = database
	migrations.RunMigrations(db)

	return db.Begin()
}

func ConnectOnPostgres() *gorm.DB {
	database_url := "host=localhost user=postgres password=R4f4@123 dbname=game-beating-project port=5432 sslmode=disable TimeZone=America/Sao_Paulo"

	database, err := gorm.Open(postgres.Open(database_url), &gorm.Config{})
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
		return nil
	}

	db = database
	migrations.RunMigrations(db)

	return db.Begin()
}

func GetDatabase() *gorm.DB {
	/*
		db.Exec("PRAGMA cache_size = 10000")
		db.Exec("PRAGMA temp_store = MEMORY")
		db.Exec("PRAGMA synchronous = OFF")
		db.Exec("PRAGMA journal_mode = WAL") */

	return db
}
