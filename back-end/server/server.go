package server

import (
	"log"
	"os"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/server/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
)

func RunServer(mode uint) {
	app := fiber.New()

	app.Use(helmet.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:4200, http://localhost:3000, http://localhost:8081, https://checkpoint-dusky.vercel.app, http://checkpoint-dusky.vercel.app",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	app.Use(compress.New())

	if mode == 1 {
		log.Println("DEV MODE")
		database.ConnectDevMode()
	} else {
		log.Println("PROD MODE - WARNING FOR DEBUG")
		database.ConnectProdMode()
	}

	routes.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("Servidor iniciando na porta :%s\n", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Erro ao iniciar o servidor na porta :%s: %v", port, err)
	}
}
