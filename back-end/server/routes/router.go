package routes

import (
	"github.com/RafaelMoreira96/game-beating-project/controllers"
	"github.com/RafaelMoreira96/game-beating-project/security"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	PublicMethods(app)
	ProtectedMethods(app)
}

func PublicMethods(app *fiber.App) {
	/* Auth routes method */
	authController := controllers.NewAuthController()
	app.Post("api/v1/login", authController.LoginPlayer)
	app.Post("api/v1/admin_login", authController.LoginAdmin)

	/* Register and reset password for player methods */
	playerController := controllers.NewPlayerController()
	app.Post("/api/v1/player/register", playerController.AddPlayer)
	app.Post("/api/v1/player/request_password_reset", playerController.RequestPasswordReset)

	/* Register administrator method */
	adminController := controllers.NewAdministratorController()
	app.Post("/api/v1/admin/register", adminController.AddAdministrator) // Rota pública para adicionar administrador

	/* LANDING PAGE */
	app.Get("/api/v1/landing-page/stats", controllers.StatsInfo)
}

func ProtectedMethods(app *fiber.App) {
	// Security JWT implements
	app.Use(security.JWTMiddleware)

	/* Manufacturer routes methods */
	manufacturerController := controllers.NewManufacturerController()
	app.Post("/api/v1/manufacturer", manufacturerController.AddManufacturer)
	app.Get("/api/v1/manufacturer/list", manufacturerController.ListAllManufacturers)
	app.Get("/api/v1/manufacturer/list/deactivated", manufacturerController.ListDeactivateManufacturers)
	app.Get("/api/v1/manufacturer/:id", manufacturerController.ViewManufacturer)
	app.Put("/api/v1/manufacturer/:id", manufacturerController.UpdateManufacturer)
	app.Delete("/api/v1/manufacturer/:id", manufacturerController.DeleteManufacturer)
	app.Put("/api/v1/manufacturer/activate/:id", manufacturerController.ReactivateManufacturer)
	app.Post("/api/v1/admin/csv/add_list_manufacturers", manufacturerController.ImportManufacturersFromCSV)

	/* Console routes methods */
	consoleController := controllers.NewConsoleController()
	app.Post("/api/v1/console", consoleController.AddConsole)
	app.Get("/api/v1/console/list", consoleController.GetConsoles)
	app.Get("/api/v1/console/deactivated_list", consoleController.GetInactiveConsoles)
	app.Get("/api/v1/console/:id", consoleController.ViewConsole)
	app.Put("/api/v1/console/:id", consoleController.UpdateConsole)
	app.Delete("/api/v1/console/:id", consoleController.DeleteConsole)
	app.Put("/api/v1/console/activate/:id", consoleController.ReactivateConsole)
	app.Post("/api/v1/console/import_csv", consoleController.ImportConsolesFromCSV)

	/* Genre routes methods */
	genreController := controllers.NewGenreController()
	app.Post("/api/v1/genre", genreController.AddGenre)
	app.Get("/api/v1/genre/list", genreController.ListAllGenres)
	app.Get("/api/v1/genre/list/deactivated", genreController.ListDeactivateGenres)
	app.Get("/api/v1/genre/:id", genreController.ViewGenre)
	app.Put("/api/v1/genre/:id", genreController.UpdateGenre)
	app.Put("/api/v1/genre/activate/:id", genreController.ReactivateGenre)
	app.Delete("/api/v1/genre/:id", genreController.DeleteGenre)
	app.Post("/api/v1/admin/csv/add_list_genres", genreController.ImportGenresFromCSV)

	/* Player routes methods */
	playerController := controllers.NewPlayerController()
	app.Get("/api/v1/player/view", playerController.ViewPlayerProfileInfo)
	app.Delete("/api/v1/player/delete", playerController.DeletePlayer)
	app.Put("/api/v1/player/update", playerController.UpdatePlayer)

	/* Administrator routes methods */
	adminController := controllers.NewAdministratorController()
	app.Get("/api/v1/admin/view/:id", adminController.ViewAdministratorById)
	app.Get("/api/v1/admin/view", adminController.ViewAdministratorProfile)
	app.Delete("/api/v1/admin/delete", adminController.CancelAdministratorInProfile)
	app.Delete("/api/v1/admin/delete/:id", adminController.CancelAdministratorInList)
	app.Get("/api/v1/admin/list", adminController.ListAdministrators)
	app.Put("/api/v1/admin/update/:id", adminController.UpdateAdministratorById)
	app.Put("/api/v1/admin/update", adminController.UpdateAdministrator)

	/* Game routes methods */
	gameController := controllers.NewGameController()
	app.Post("/api/v1/game", gameController.AddGame)
	app.Get("/api/v1/game/list_beaten", gameController.GetBeatenList)
	app.Get("/api/v1/game/:id_game", gameController.GetGame)
	app.Delete("/api/v1/game/delete_beaten/:id_game", gameController.DeleteGame)
	app.Put("/api/v1/game/:id_game", gameController.UpdateGame)
	app.Post("/api/v1/game/import_csv", gameController.ImportGamesFromCSV)

	/* Project Update Log routes methods */
	logController := controllers.NewLogController()
	app.Post("/api/v1/log", logController.AddLog)
	app.Delete("/api/v1/log/:id", logController.DeleteLog)
	app.Get("/api/v1/log/list", logController.GetLogs)

	/* Frontend routes methods */
	dashboardController := controllers.NewDashboardController()
	app.Get("/api/v1/player/last_games", dashboardController.LastGamesBeatingAdded)
	app.Get("/api/v1/player/last_backlog", dashboardController.LastGamesBacklogAdded)
	app.Get("/api/v1/player/prefered_genre", dashboardController.CardsInfo)
	app.Get("/api/v1/admin/last_players_added", dashboardController.LastPlayersRegistered)
	app.Get("/api/v1/admin/last_admin_added", dashboardController.LastAdminsRegistered)
	app.Get("/api/v1/admin/cards_info", dashboardController.AdminCardsInfo)

	/* Backlog routes methods */
	backlogController := controllers.NewBacklogController()
	app.Post("/api/v1/backlog", backlogController.AddBacklogGame)
	app.Get("/api/v1/backlog/list", backlogController.ListBacklogGames)

	statsController := controllers.NewStatsController()
	app.Get("/api/v1/statistics/beaten-statistics", statsController.BeatedStats)
	app.Get("/api/v1/statistics/beaten-by-genre/:genre_id", statsController.BeatedStatsByGenre)
	app.Get("/api/v1/statistics/beaten-by-console/:console_id", statsController.BeatedStatsByConsole)
	app.Get("/api/v1/statistics/beaten-by-release-year/:release_year", statsController.BeatedStatsByReleaseYear)

	//app.Post("/reset-password", ResetPassword)
}
