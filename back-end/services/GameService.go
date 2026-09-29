package services

import (
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	date_utils "github.com/RafaelMoreira96/game-beating-project/utils"
	"github.com/texttheater/golang-levenshtein/levenshtein"
	"gorm.io/gorm"
)

type GameService struct {
	db *gorm.DB
}

func NewGameService() *GameService {
	return &GameService{
		db: database.GetDatabase(),
	}
}

// AddGame adiciona um novo jogo
func (s *GameService) AddGame(game *models.Game) error {
	if game.NameGame == "" {
		return fmt.Errorf("insert a game name")
	}

	var genre models.Genre
	if err := s.db.Where("id_genre = ?", game.GenreID).First(&genre).Error; err != nil {
		return fmt.Errorf("genre not found")
	}

	var console models.Console
	if err := s.db.Where("id_console = ?", game.ConsoleID).First(&console).Error; err != nil {
		return fmt.Errorf("console not found")
	}

	game.Status = 0
	if err := s.db.Create(game).Error; err != nil {
		return fmt.Errorf("error creating game: %w", err)
	}

	return nil
}

// GetBeatenList retorna a lista de jogos finalizados (suporta paginação opcional e busca)
func (s *GameService) GetBeatenList(playerID uint, page, limit int, search string) ([]models.Game, int64, error) {
	var games []models.Game
	var total int64

	query := s.db.Model(&models.Game{}).
		Where("player_id = ? AND status = ?", playerID, models.Beaten)

	if search != "" {
		query = query.Where("name_game ILIKE ?", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("error counting games: %w", err)
	}

	query = query.
		Preload("Genre", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_genre, name_genre")
		}).
		Preload("Console", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_console, name_console")
		}).
		Order("date_beating DESC")

	if page > 0 && limit > 0 {
		offset := (page - 1) * limit
		query = query.Offset(offset).Limit(limit)
	}

	if err := query.Find(&games).Error; err != nil {
		return nil, 0, fmt.Errorf("error fetching games: %w", err)
	}

	return games, total, nil
}

// DeleteGame remove um jogo
func (s *GameService) DeleteGame(playerID uint, gameID uint) error {
	var game models.Game
	if err := s.db.Where("id_game = ? AND player_id = ?", gameID, playerID).First(&game).Error; err != nil {
		return fmt.Errorf("game not found: %w", err)
	}

	if err := s.db.Delete(&game).Error; err != nil {
		return fmt.Errorf("error deleting game: %w", err)
	}

	return nil
}

// DeleteAllBeatenGames remove todos os jogos zerados do jogador autenticado
func (s *GameService) DeleteAllBeatenGames(playerID uint) (int64, error) {
	result := s.db.Where("player_id = ? AND status = ?", playerID, models.Beaten).Delete(&models.Game{})
	if result.Error != nil {
		return 0, fmt.Errorf("error deleting beaten games: %w", result.Error)
	}
	return result.RowsAffected, nil
}

// UpdateGame atualiza um jogo
func (s *GameService) UpdateGame(playerID uint, gameID uint, updatedGame *models.Game) error {
	var game models.Game
	if err := s.db.Where("id_game = ? AND player_id = ?", gameID, playerID).First(&game).Error; err != nil {
		return fmt.Errorf("game not found: %w", err)
	}

	if updatedGame.NameGame == "" {
		return fmt.Errorf("insert a game name")
	}

	var genre models.Genre
	if err := s.db.Where("id_genre = ?", updatedGame.GenreID).First(&genre).Error; err != nil {
		return fmt.Errorf("genre not found")
	}

	var console models.Console
	if err := s.db.Where("id_console = ?", updatedGame.ConsoleID).First(&console).Error; err != nil {
		return fmt.Errorf("console not found")
	}

	game.NameGame = updatedGame.NameGame
	game.GenreID = updatedGame.GenreID
	game.ConsoleID = updatedGame.ConsoleID
	game.Status = updatedGame.Status
	game.UrlImage = updatedGame.UrlImage
	game.DateBeating = updatedGame.DateBeating
	game.TimeBeating = updatedGame.TimeBeating
	game.Developer = updatedGame.Developer
	game.ReleaseYear = updatedGame.ReleaseYear

	if err := s.db.Save(&game).Error; err != nil {
		return fmt.Errorf("error updating game: %w", err)
	}

	return nil
}

// GetGame retorna um jogo pelo ID
func (s *GameService) GetGame(playerID uint, gameID uint) (*models.Game, error) {
	var game models.Game
	if err := s.db.
		Preload("Genre", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_genre, name_genre")
		}).
		Preload("Console", func(db *gorm.DB) *gorm.DB {
			return db.Select("id_console, name_console")
		}).
		Where("id_game = ? AND player_id = ?", gameID, playerID).
		First(&game).Error; err != nil {
		return nil, fmt.Errorf("game not found: %w", err)
	}
	return &game, nil
}

// ImportGamesFromCSV importa jogos a partir de um arquivo CSV de forma otimizada
func (s *GameService) ImportGamesFromCSV(playerID uint, file io.Reader) error {
	// 1. Pré-carregar consoles ativos uma única vez para lookup e cálculo Levenshtein
	var consoles []models.Console
	if err := s.db.Select("id_console, name_console").Where("is_active = true").Find(&consoles).Error; err != nil {
		return fmt.Errorf("error fetching active consoles: %w", err)
	}

	// 2. Pré-carregar gêneros ativos uma única vez para lookup e cálculo fuzzy
	var genres []models.Genre
	if err := s.db.Select("id_genre, name_genre").Where("is_active = true").Find(&genres).Error; err != nil {
		return fmt.Errorf("error fetching active genres: %w", err)
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("error starting transaction: %w", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	cfg := date_utils.DefaultCSVBatchConfig()
	cfg.Comma = ';'
	cfg.BatchSize = 100
	cfg.MinColumnCount = 7

	_, err := date_utils.ProcessCSVInBatches[models.Game](
		file,
		cfg,
		func(lineNum int, record []string) (models.Game, error) {
			if strings.ToLower(record[0]) == "nome do jogo" {
				return models.Game{}, nil
			}

			gameName := strings.TrimSpace(record[0])
			genreName := strings.TrimSpace(record[1])
			developer := strings.TrimSpace(record[2])
			consoleName := strings.TrimSpace(record[3])
			dateStr := strings.TrimSpace(record[4])

			var dateBeating date_utils.Date
			if dateStr != "" {
				var parseErr error
				dateBeating, parseErr = date_utils.ParseDate(dateStr)
				if parseErr != nil {
					return models.Game{}, fmt.Errorf("invalid date format at line %d: %w", lineNum, parseErr)
				}
			}

			rawTimeBeating := strings.TrimSpace(record[5])
			processedTimeBeating := strings.Replace(rawTimeBeating, ",", ".", -1)
			timeBeating, _ := strconv.ParseFloat(processedTimeBeating, 64)

			releaseYearStr := strings.TrimSpace(record[6])
			releaseYear, parseYearErr := strconv.ParseUint(releaseYearStr, 10, 32)
			if parseYearErr != nil {
				return models.Game{}, fmt.Errorf("error parsing release year at line %d: %w", lineNum, parseYearErr)
			}

			var consoleID *uint
			if consoleName != "" {
				closestConsoleID, _ := findClosestConsoleNamePreloaded(consoles, consoleName)
				if closestConsoleID > 0 {
					consoleID = &closestConsoleID
				}
			}

			var genreID *uint
			if genreName != "" {
				closestGenreID, _ := findClosestGenreNamePreloaded(genres, genreName)
				if closestGenreID > 0 {
					genreID = &closestGenreID
				}
			}

			var urlImage string
			if len(record) > 7 {
				urlImage = strings.TrimSpace(record[7])
			}

			game := models.Game{
				NameGame:    gameName,
				UrlImage:    urlImage,
				Developer:   developer,
				GenreID:     genreID,
				ConsoleID:   consoleID,
				DateBeating: date_utils.Date(dateBeating),
				TimeBeating: timeBeating,
				ReleaseYear: int(releaseYear),
				PlayerID:    playerID,
				Status:      models.Beaten,
			}

			if err := game.Validate(); err != nil {
				return models.Game{}, fmt.Errorf("validation error at line %d: %w", lineNum, err)
			}

			return game, nil
		},
		func(batchNumber int, batch []models.Game) error {
			// Inserção em batch de 100 registros por query diretamente no banco
			if len(batch) == 0 {
				return nil
			}
			if err := tx.Create(&batch).Error; err != nil {
				return fmt.Errorf("error inserting batch %d: %w", batchNumber, err)
			}
			return nil
		},
	)

	if err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

var consoleAliases = map[string]string{
	"nintendo 8-bits":                     "nintendo 8-bits",
	"nes":                                 "nintendo 8-bits",
	"famicom":                             "nintendo 8-bits",
	"nintendo entertainment system":       "nintendo 8-bits",
	"gameboy":                             "gameboy",
	"game boy":                            "gameboy",
	"game boy color":                      "gameboy color",
	"gameboy color":                       "gameboy color",
	"gameboy advance":                     "gameboy advance",
	"game boy advance":                    "gameboy advance",
	"gba":                                 "gameboy advance",
	"super nintendo":                      "super nintendo",
	"snes":                                "super nintendo",
	"super famicom":                       "super nintendo",
	"super nintendo entertainment system": "super nintendo",
	"nintendo 64":                         "nintendo 64",
	"n64":                                 "nintendo 64",
	"gamecube":                            "nintendo gamecube",
	"nintendo gamecube":                   "nintendo gamecube",
	"gc":                                  "nintendo gamecube",
	"wii":                                 "nintendo wii",
	"nintendo wii":                        "nintendo wii",
	"wii u":                               "nintendo wii u",
	"nintendo wii u":                      "nintendo wii u",
	"switch":                              "nintendo switch",
	"nintendo switch":                     "nintendo switch",
	"ds":                                  "nintendo ds",
	"nds":                                 "nintendo ds",
	"nintendo ds":                         "nintendo ds",
	"3ds":                                 "nintendo 3ds",
	"nintendo 3ds":                        "nintendo 3ds",
	"ps1":                                 "playstation",
	"psx":                                 "playstation",
	"playstation":                         "playstation",
	"ps2":                                 "playstation 2",
	"playstation 2":                       "playstation 2",
	"ps3":                                 "playstation 3",
	"playstation 3":                       "playstation 3",
	"ps4":                                 "playstation 4",
	"playstation 4":                       "playstation 4",
	"ps5":                                 "playstation 5",
	"playstation 5":                       "playstation 5",
	"psp":                                 "playstation portable",
	"playstation portable":                "playstation portable",
	"ps vita":                             "playstation vita",
	"playstation vita":                    "playstation vita",
	"xbox 360":                            "xbox 360",
	"x360":                                "xbox 360",
	"xbox one":                            "xbox one",
	"xone":                                "xbox one",
	"xbox series x|s":                     "xbox series x|s",
	"series x":                            "xbox series x|s",
	"series s":                            "xbox series x|s",
	"mega drive":                          "sega megadrive",
	"sega megadrive":                      "sega megadrive",
	"genesis":                             "sega megadrive",
	"sega genesis":                        "sega megadrive",
	"32x":                                 "sega 32x",
	"sega 32x":                            "sega 32x",
	"master system":                       "sega master system",
	"sega master system":                  "sega master system",
	"pc":                                  "pc",
	"pc (steam)":                          "pc (steam)",
	"windows":                             "pc",
	"steam":                               "pc (steam)",
	"mobile":                              "mobile",
	"android":                             "mobile",
	"ios":                                 "mobile",
	"arcade":                              "arcade",
	"fliperama":                           "arcade",
}

// findClosestConsoleNamePreloaded encontra o console mais próximo com correspondência exata, alias e fuzzy
func findClosestConsoleNamePreloaded(consoles []models.Console, inputName string) (uint, string) {
	cleanedInput := strings.ToLower(strings.TrimSpace(inputName))
	if cleanedInput == "" {
		return 0, ""
	}

	// 1. Verificação de correspondência exata
	for _, console := range consoles {
		cleanedConsole := strings.ToLower(strings.TrimSpace(console.NameConsole))
		if cleanedInput == cleanedConsole {
			return console.IdConsole, console.NameConsole
		}
	}

	// 2. Verificação via dicionário de aliases
	if targetAlias, ok := consoleAliases[cleanedInput]; ok {
		for _, console := range consoles {
			cleanedConsole := strings.ToLower(strings.TrimSpace(console.NameConsole))
			if cleanedConsole == targetAlias {
				return console.IdConsole, console.NameConsole
			}
		}
	}

	// 3. Verificação de contenção parcial de substring
	for _, console := range consoles {
		cleanedConsole := strings.ToLower(strings.TrimSpace(console.NameConsole))
		if strings.Contains(cleanedConsole, cleanedInput) || strings.Contains(cleanedInput, cleanedConsole) {
			return console.IdConsole, console.NameConsole
		}
	}

	// 4. Fallback: Levenshtein similarity
	closestConsoleID := uint(0)
	closestConsoleName := ""
	highestSimilarity := 0.75

	for _, console := range consoles {
		cleanedConsole := strings.ToLower(strings.TrimSpace(console.NameConsole))
		similarity := levenshtein.RatioForStrings([]rune(cleanedInput), []rune(cleanedConsole), levenshtein.DefaultOptions)
		if similarity > highestSimilarity {
			highestSimilarity = similarity
			closestConsoleID = console.IdConsole
			closestConsoleName = console.NameConsole
		}
	}

	return closestConsoleID, closestConsoleName
}

var genreAliases = map[string]string{
	"plataforma":              "plataforma (platform)",
	"platform":                "plataforma (platform)",
	"plataforma 2d":           "plataforma (platform)",
	"plataforma 3d":           "plataforma 3d",
	"luta":                    "luta (fighting)",
	"fighting":                "luta (fighting)",
	"tiro em primeira pessoa": "tiro (shooter)",
	"tiro em terceira pessoa": "tiro (shooter)",
	"fps":                     "tiro (shooter)",
	"shmup":                   "tiro (shooter)",
	"shoot em up":             "tiro (shooter)",
	"shoot 'em up":            "tiro (shooter)",
	"run and gun":             "tiro (shooter)",
	"run & gun":               "tiro (shooter)",
	"rail shooter":            "tiro (shooter)",
	"tiro":                    "tiro (shooter)",
	"shooter":                 "tiro (shooter)",
	"beat 'em up":             "hack and slash / beat 'em up",
	"beat em up":              "hack and slash / beat 'em up",
	"hack and slash":          "hack and slash / beat 'em up",
	"hack & slash":            "hack and slash / beat 'em up",
	"aventura":                "aventura (adventure)",
	"adventure":               "aventura (adventure)",
	"corrida":                 "corrida (racing)",
	"racing":                  "corrida (racing)",
	"combate veicular":        "corrida (racing)",
	"ação":                    "ação e aventura",
	"acao":                    "ação e aventura",
	"action":                  "ação e aventura",
	"survival horror":         "survival horror",
	"terror":                  "survival horror",
	"rpg de ação":             "rpg / ação",
	"rpg de acao":             "rpg / ação",
	"action rpg":              "rpg / ação",
	"arpg":                    "rpg / ação",
	"rpg de tiro":             "rpg / ação",
	"rpg":                     "rpg (role-playing)",
	"role-playing":            "rpg (role-playing)",
	"dungeon crawler":         "rpg (role-playing)",
	"puzzle":                  "quebra-cabeça (puzzle)",
	"quebra cabeca":           "quebra-cabeça (puzzle)",
	"quebra-cabeça":           "quebra-cabeça (puzzle)",
	"point and click":         "point-and-click",
	"point-and-click":         "point-and-click",
	"metroidvania":            "metroidvania",
	"gerenciamento":           "simulador (simulator)",
	"simulação":               "simulador (simulator)",
	"simulator":               "simulador (simulator)",
	"futebol":                 "esporte (sport)",
	"esportes/futebol":        "esporte (sport)",
	"esporte":                 "esporte (sport)",
	"esportes":                "esporte (sport)",
	"sport":                   "esporte (sport)",
	"sports":                  "esporte (sport)",
	"exploração":              "aventura (adventure)",
	"exploracao":              "aventura (adventure)",
	"visual novel":            "visual novel",
	"musical":                 "música (music)",
	"música":                  "música (music)",
	"musica":                  "música (music)",
	"music":                   "música (music)",
	"ritmo":                   "música (music)",
	"jogo interativo":         "visual novel",
	"estratégia":              "estratégia (strategy)",
	"estrategia":              "estratégia (strategy)",
	"strategy":                "estratégia (strategy)",
	"rts":                     "estratégia em tempo real (rts)",
	"tbs":                     "estratégia em turnos (tbs)",
	"tático":                  "tático (tactical)",
	"tatico":                  "tático (tactical)",
	"tactical":                "tático (tactical)",
	"roguelike":               "roguelike",
	"roguelite":               "roguelike",
	"soulslike":               "soulslike",
	"mundo aberto":            "mundo aberto",
	"open world":              "mundo aberto",
	"moba":                    "moba",
	"arcade":                  "arcade",
	"indie":                   "indie",
	"pinball":                 "pinball",
}

// findClosestGenreNamePreloaded encontra o gênero mais próximo com correspondência exata, alias, stripping de parênteses e fuzzy
func findClosestGenreNamePreloaded(genres []models.Genre, inputName string) (uint, string) {
	cleanedInput := strings.ToLower(strings.TrimSpace(inputName))
	if cleanedInput == "" {
		return 0, ""
	}

	// 1. Verificação de correspondência exata
	for _, g := range genres {
		cleanedGenre := strings.ToLower(strings.TrimSpace(g.NameGenre))
		if cleanedInput == cleanedGenre {
			return g.IdGenre, g.NameGenre
		}
	}

	// 2. Verificação via dicionário de aliases
	if targetAlias, ok := genreAliases[cleanedInput]; ok {
		for _, g := range genres {
			cleanedGenre := strings.ToLower(strings.TrimSpace(g.NameGenre))
			if cleanedGenre == targetAlias {
				return g.IdGenre, g.NameGenre
			}
		}
	}

	// 3. Verificação com remoção de parênteses e sufixos do banco (ex: "Plataforma (Platform)" -> "plataforma")
	for _, g := range genres {
		cleanedGenre := strings.ToLower(strings.TrimSpace(g.NameGenre))
		baseGenre := cleanedGenre
		if idx := strings.Index(baseGenre, "("); idx > 0 {
			baseGenre = strings.TrimSpace(baseGenre[:idx])
		}
		if cleanedInput == baseGenre {
			return g.IdGenre, g.NameGenre
		}
	}

	// 4. Verificação de contenção parcial de substring
	for _, g := range genres {
		cleanedGenre := strings.ToLower(strings.TrimSpace(g.NameGenre))
		if strings.Contains(cleanedGenre, cleanedInput) || strings.Contains(cleanedInput, cleanedGenre) {
			return g.IdGenre, g.NameGenre
		}
	}

	// 5. Fallback: Levenshtein similarity
	closestID := uint(0)
	closestName := ""
	highestSimilarity := 0.70

	for _, g := range genres {
		cleanedGenre := strings.ToLower(strings.TrimSpace(g.NameGenre))
		similarity := levenshtein.RatioForStrings([]rune(cleanedInput), []rune(cleanedGenre), levenshtein.DefaultOptions)
		if similarity > highestSimilarity {
			highestSimilarity = similarity
			closestID = g.IdGenre
			closestName = g.NameGenre
		}
	}

	return closestID, closestName
}
