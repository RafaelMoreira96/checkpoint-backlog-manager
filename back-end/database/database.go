package database

import (
	"log"
	"os"

	"github.com/RafaelMoreira96/game-beating-project/database/migrations"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

// ConnectDevMode conecta ao banco de dados em modo de desenvolvimento
func ConnectDevMode() *gorm.DB {
	hostname := os.Getenv("DB_HOST_DEV")
	username := os.Getenv("DB_USER_DEV")
	databaseName := os.Getenv("DB_NAME_DEV")
	password := os.Getenv("DB_PASSWORD_DEV")
	port := os.Getenv("DB_PORT_DEV")

	if hostname == "" || username == "" || databaseName == "" || password == "" || port == "" {
		log.Fatal("Variáveis de ambiente para o banco de dados de desenvolvimento não estão configuradas corretamente")
	}

	databaseURL := "host=" + hostname +
		" user=" + username +
		" password=" + password +
		" dbname=" + databaseName +
		" port=" + port +
		" sslmode=require TimeZone=America/Sao_Paulo"

	database, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados de desenvolvimento: %v", err)
	}

	db = database
	migrations.RunMigrations(db)

	log.Println("Conexão com o banco de dados de desenvolvimento estabelecida com sucesso")
	return db
}

// ConnectProdMode conecta ao banco de dados em modo de produção
func ConnectProdMode() *gorm.DB {
	databaseURL := os.Getenv("DATABASE_URL_PROD")

	if databaseURL == "" {
		log.Fatal("Variável de ambiente DATABASE_URL_PROD não está configurada")
	}

	database, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados de produção: %v", err)
	}

	db = database
	migrations.RunMigrations(db)

	log.Println("Conexão com o banco de dados de produção estabelecida com sucesso")
	return db
}

// GetDatabase retorna a instância do banco de dados
func GetDatabase() *gorm.DB {
	if db == nil {
		log.Fatal("Banco de dados não inicializado. Certifique-se de chamar ConnectDevMode ou ConnectProdMode primeiro.")
	}
	return db
}
