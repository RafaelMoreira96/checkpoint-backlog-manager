package database

import (
	"log"

	"github.com/RafaelMoreira96/game-beating-project/database/migrations"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

/* func ConnectDevMode() *gorm.DB {
	hostname := "localhost"
	username := "postgres"
	databaseName := "game-beating-project"
	password := "R4f4@123"
	port := "5432"

	databaseURL := "host=" + hostname +
		" user=" + username +
		" password=" + password +
		" dbname=" + databaseName +
		" port=" + port +
		" sslmode=require TimeZone=America/Sao_Paulo"

	database, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
		return nil
	}

	db = database
	migrations.RunMigrations(db)

	return db.Begin()
} */

func ConnectDevMode() *gorm.DB {
	// URL de conexão fornecida
	databaseURL := "postgres://neondb_owner:PXCF03zfNpGi@ep-mute-bonus-a5gap40d-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

	// Abrindo a conexão com o banco de dados usando GORM
	database, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
		return nil
	}

	// Rodando migrações
	db = database
	migrations.RunMigrations(db)

	// Retorna uma nova transação iniciada
	return db.Begin()
}

// WARNING: Only used for testing, without try add information
func ConnectProdMode() *gorm.DB {
	hostname := "dpg-ctncd33qf0us73afc33g-a.oregon-postgres.render.com"
	username := "rafael"
	databaseName := "checkpoint_6976"
	password := "UB9N6UN1AqLqdI84tGPi3eUtcfxD3ItU"
	port := "5432"

	databaseURL := "host=" + hostname +
		" user=" + username +
		" password=" + password +
		" dbname=" + databaseName +
		" port=" + port +
		" sslmode=require TimeZone=America/Sao_Paulo"

	database, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
		return nil
	}

	db = database
	migrations.RunMigrations(db)

	return db.Begin()
}

func GetDatabase() *gorm.DB {
	return db
}
