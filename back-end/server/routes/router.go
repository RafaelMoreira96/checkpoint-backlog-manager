package routes

import (
	"github.com/RafaelMoreira96/game-beating-project/controllers"
	"github.com/RafaelMoreira96/game-beating-project/utils"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	PublicMethods(app)
	ProtectedMethods(app)
}

func PublicMethods(app *fiber.App) {
	/* Login route method */
	app.Post("api/v1/login", controllers.LoginPlayer)
	app.Post("api/v1/admin_login", controllers.LoginAdmin)

	/* Register player method */
	app.Post("/api/v1/player", controllers.AddPlayer)
	app.Post("/api/v1/admin", controllers.AddAdministrator)
}

func ProtectedMethods(app *fiber.App) {
	// Security JWT implements
	app.Use(utils.JWTMiddleware)

	/* Manufacturer routes methods */
	app.Post("api/v1/manufacturer", controllers.AddManufacturer)
	app.Get("api/v1/manufacturer/list", controllers.ListAllManufacturers)
	app.Get("api/v1/manufacturer/:id", controllers.ViewManufacturer)
	app.Get("api/v1/manufacturer/list/deactivated", controllers.ListDeactivateManufacturers)
	app.Delete("api/v1/manufacturer/:id", controllers.DeleteManufacturer)
	app.Put("api/v1/manufacturer/:id", controllers.UpdateManufacturer)
	app.Put("api/v1/manufacturer/activate/:id", controllers.ReactivateManufacturer)

	/* Console routes methods */
	app.Post("/api/v1/console", controllers.AddConsole)
	app.Get("/api/v1/console/list", controllers.GetConsoles)
	app.Get("/api/v1/console/deactivated_list", controllers.GetInactiveConsoles)
	app.Get("/api/v1/console/:id", controllers.ViewConsole)
	app.Delete("/api/v1/console/:id", controllers.DeleteConsole)
	app.Put("/api/v1/console/:id", controllers.UpdateConsole)
	app.Put("/api/v1/console/activate/:id", controllers.ReactivateConsole)

	/* Genre routes methods */
	app.Post("/api/v1/genre", controllers.AddGenre)
	app.Get("/api/v1/genre/list", controllers.ListAllGenres)
	app.Get("/api/v1/genre/list/deactivated", controllers.ListDeactivateGenres)
	app.Get("/api/v1/genre/:id", controllers.ViewGenre)
	app.Delete("/api/v1/genre/:id", controllers.DeleteGenre)
	app.Put("/api/v1/genre/:id", controllers.UpdateGenre)
	app.Put("/api/v1/genre/activate/:id", controllers.ReactivateGenre)

	/* Player routes methods */
	app.Get("/api/v1/player/view", controllers.ViewPlayer)
	app.Delete("/api/v1/player/delete", controllers.DeletePlayer)

	/* Administrator routes methods */
	app.Get("/api/v1/admin/view/:id", controllers.ViewAdministrator)
	app.Get("/api/v1/admin/view", controllers.ViewAdministrator)
	app.Delete("/api/v1/admin/delete", controllers.CancelAdministratorAccount)
	app.Delete("/api/v1/admin/delete/:id", controllers.CancelAdministratorAccount)
	app.Get("/api/v1/admin/list", controllers.ListAdministrators)
	app.Put("/api/v1/admin/update/:id", controllers.UpdateAdministrator)

	/* Game routes methods */
	app.Post("/api/v1/game", controllers.AddGame)
	app.Put("/api/v1/game/:id_game", controllers.UpdateGame)
	app.Get("/api/v1/game/list_beaten", controllers.GetBeatenList)
	app.Get("/api/v1/game/:id_game", controllers.GetGame)
	app.Delete("/api/v1/game/delete_beaten/:id_game", controllers.DeleteGame)

	/* Project Update Log routes method */
	app.Post("/api/v1/log", controllers.AddLog)
	app.Delete("/api/v1/log/:id", controllers.DeleteLog)
	app.Get("/api/v1/log/list", controllers.GetLogs)

	/* Aditional routes from home page for player account */
	app.Get("/api/v1/player/last_games", controllers.LastGamesBeatingAdded)
	app.Get("/api/v1/player/last_backlog", controllers.LastGamesBacklogAdded)
	app.Get("/api/v1/player/prefered_genre", controllers.CardsInfo)

	/* Backlog routes methods */
	app.Post("/api/v1/backlog", controllers.AddBacklogGame)
	app.Get("/api/v1/backlog/list", controllers.ListBacklogGames)
}
