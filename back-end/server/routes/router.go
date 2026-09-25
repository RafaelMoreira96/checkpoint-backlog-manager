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
	app.Post("/api/v1/login", authController.LoginPlayer)
	app.Post("/api/v1/admin_login", authController.LoginAdmin)

	/* Register and reset password for player methods */
	playerController := controllers.NewPlayerController()
	app.Post("/api/v1/player/register", playerController.AddPlayer)
	app.Post("/api/v1/player/request_password_reset", playerController.RequestPasswordReset)
	app.Post("/api/v1/player/reset-password", playerController.ResetPassword)
	app.Get("/api/v1/player/public/:nickname", playerController.GetPublicProfile)

	/* LANDING PAGE */
	app.Get("/api/v1/landing-page/stats", controllers.StatsInfo)

	/* External Catalog (IGDB Proxy) routes */
	externalGamesController := controllers.NewExternalGamesController()
	app.Get("/api/v1/external/games/search", externalGamesController.SearchGames)
	app.Post("/api/v1/external/genres/sync", externalGamesController.SyncGenres)
}

func ProtectedMethods(app *fiber.App) {
	// Base protected group with JWT Middleware
	api := app.Group("/api/v1", security.JWTMiddleware)

	// Roles
	adminOnly := security.RequireRole("admin")
	playerOnly := security.RequireRole("player")
	anyRole := security.RequireRole("player", "admin")

	externalGamesController := controllers.NewExternalGamesController()

	/* Manufacturer routes methods */
	manufacturerController := controllers.NewManufacturerController()
	api.Post("/manufacturer", adminOnly, manufacturerController.AddManufacturer)
	api.Get("/manufacturer/list", anyRole, manufacturerController.ListAllManufacturers)
	api.Get("/manufacturer/list/deactivated", adminOnly, manufacturerController.ListDeactivateManufacturers)
	api.Get("/manufacturer/:id", anyRole, manufacturerController.ViewManufacturer)
	api.Put("/manufacturer/:id", adminOnly, manufacturerController.UpdateManufacturer)
	api.Delete("/manufacturer/:id", adminOnly, manufacturerController.DeleteManufacturer)
	api.Put("/manufacturer/activate/:id", adminOnly, manufacturerController.ReactivateManufacturer)
	api.Post("/manufacturer/import_csv", adminOnly, manufacturerController.ImportManufacturersFromCSV)

	/* Console routes methods */
	consoleController := controllers.NewConsoleController()
	api.Post("/console", adminOnly, consoleController.AddConsole)
	api.Get("/console/list", anyRole, consoleController.GetConsoles)
	api.Get("/console/deactivated_list", adminOnly, consoleController.GetInactiveConsoles)
	api.Get("/console/:id", anyRole, consoleController.ViewConsole)
	api.Put("/console/:id", adminOnly, consoleController.UpdateConsole)
	api.Delete("/console/:id", adminOnly, consoleController.DeleteConsole)
	api.Put("/console/activate/:id", adminOnly, consoleController.ReactivateConsole)
	api.Post("/console/import_csv", adminOnly, consoleController.ImportConsolesFromCSV)

	/* Genre routes methods */
	genreController := controllers.NewGenreController()
	api.Post("/genre", adminOnly, genreController.AddGenre)
	api.Post("/genre/sync-igdb", anyRole, externalGamesController.SyncGenres)
	api.Get("/genre/list", anyRole, genreController.ListAllGenres)
	api.Get("/genre/list/deactivated", adminOnly, genreController.ListDeactivateGenres)
	api.Get("/genre/:id", anyRole, genreController.ViewGenre)
	api.Put("/genre/:id", adminOnly, genreController.UpdateGenre)
	api.Put("/genre/activate/:id", adminOnly, genreController.ReactivateGenre)
	api.Delete("/genre/:id", adminOnly, genreController.DeleteGenre)
	api.Post("/genre/import_csv", adminOnly, genreController.ImportGenresFromCSV)

	/* Player routes methods */
	playerController := controllers.NewPlayerController()
	api.Get("/player/view", playerOnly, playerController.ViewPlayerProfileInfo)
	api.Delete("/player/delete", playerOnly, playerController.DeletePlayer)
	api.Put("/player/update", playerOnly, playerController.UpdatePlayer)

	/* Administrator routes methods */
	adminController := controllers.NewAdministratorController()
	api.Post("/admin/register", adminOnly, adminController.AddAdministrator)
	api.Get("/admin/view/:id", adminOnly, adminController.ViewAdministratorById)
	api.Get("/admin/view", adminOnly, adminController.ViewAdministratorProfile)
	api.Delete("/admin/delete", adminOnly, adminController.CancelAdministratorInProfile)
	api.Delete("/admin/delete/:id", adminOnly, adminController.CancelAdministratorInList)
	api.Get("/admin/list", adminOnly, adminController.ListAdministrators)
	api.Put("/admin/update/:id", adminOnly, adminController.UpdateAdministratorById)
	api.Put("/admin/update", adminOnly, adminController.UpdateAdministrator)

	/* Game routes methods */
	gameController := controllers.NewGameController()
	api.Post("/game", playerOnly, gameController.AddGame)
	api.Get("/game/list_beaten", playerOnly, gameController.GetBeatenList)
	api.Get("/game/:id_game", playerOnly, gameController.GetGame)
	api.Delete("/game/delete_beaten/:id_game", playerOnly, gameController.DeleteGame)
	api.Put("/game/:id_game", playerOnly, gameController.UpdateGame)
	api.Post("/game/import_csv", playerOnly, gameController.ImportGamesFromCSV)

	/* Project Update Log routes methods */
	logController := controllers.NewLogController()
	api.Post("/log", adminOnly, logController.AddLog)
	api.Delete("/log/:id", adminOnly, logController.DeleteLog)
	api.Get("/log/list", anyRole, logController.GetLogs)

	/* Frontend routes methods */
	dashboardController := controllers.NewDashboardController()
	api.Get("/player/last_games", playerOnly, dashboardController.LastGamesBeatingAdded)
	api.Get("/player/last_backlog", playerOnly, dashboardController.LastGamesBacklogAdded)
	api.Get("/player/prefered_genre", playerOnly, dashboardController.CardsInfo)
	api.Get("/admin/last_players_added", adminOnly, dashboardController.LastPlayersRegistered)
	api.Get("/admin/last_admin_added", adminOnly, dashboardController.LastAdminsRegistered)
	api.Get("/admin/cards_info", adminOnly, dashboardController.AdminCardsInfo)

	/* Backlog routes methods */
	backlogController := controllers.NewBacklogController()
	api.Post("/backlog", playerOnly, backlogController.AddBacklogGame)
	api.Get("/backlog/list", playerOnly, backlogController.ListBacklogGames)

	statsController := controllers.NewStatsController()
	api.Get("/statistics/beaten-statistics", playerOnly, statsController.BeatedStats)
	api.Get("/statistics/beaten-by-genre/:genre_id", playerOnly, statsController.BeatedStatsByGenre)
	api.Get("/statistics/beaten-by-console/:console_id", playerOnly, statsController.BeatedStatsByConsole)
	api.Get("/statistics/beaten-by-release-year/:release_year", playerOnly, statsController.BeatedStatsByReleaseYear)
	api.Get("/statistics/beaten-by-year/:year", playerOnly, statsController.BeatedStatsByYear)
}
