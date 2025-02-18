package main

import (
	"fmt"
	"os"

	"github.com/RafaelMoreira96/game-beating-project/server"
	"github.com/joho/godotenv"
)

func main() {
	// Carrega o .env (opcional para ambiente local)
	_ = godotenv.Load()

	// Obtém o modo do ambiente
	arg := os.Getenv("APP_MODE")
	if arg == "" {
		arg = "production" // Padrão caso a variável não esteja definida
	}

	if arg == "production" {
		server.RunServer(2)
	} else if arg == "development" {
		server.RunServer(1)
	} else {
		fmt.Printf("Invalid mode '%s'. Contact the developers for more information.\n", arg)
		return
	}
}

/* func main() {
	// Carrega as variáveis de ambiente do arquivo .env
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	if len(os.Args) < 2 {
		fmt.Println("Please, insert a mode run. Contact the developers for more information.")
		return
	}

	arg := os.Args[1]
	if arg == "production" {
		server.RunServer(2)
	} else if arg == "development" {
		server.RunServer(1)
	} else {
		fmt.Printf("Invalid mode '%s'. Contact the developers for more information'.\n", arg)
		return
	}
} */
