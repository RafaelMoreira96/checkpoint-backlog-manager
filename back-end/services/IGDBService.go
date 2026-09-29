package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/RafaelMoreira96/game-beating-project/database"
	"github.com/RafaelMoreira96/game-beating-project/models"
	"github.com/RafaelMoreira96/game-beating-project/utils"
)

type IGDBGenreDTO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type IGDBGameDTO struct {
	ID          uint           `json:"id"`
	Name        string         `json:"name"`
	UrlImage    string         `json:"url_image"`
	CoverURL    string         `json:"cover_url"`
	Developer   string         `json:"developer"`
	ReleaseYear int            `json:"release_year"`
	Genres      []IGDBGenreDTO `json:"genres"`
	GenreID     *uint          `json:"genre_id,omitempty"`
	GenreName   string         `json:"genre_name,omitempty"`
}

type twitchTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
	TokenType   string `json:"token_type"`
}

type igdbRawGame struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Cover *struct {
		ID      uint   `json:"id"`
		ImageID string `json:"image_id"`
		URL     string `json:"url"`
	} `json:"cover"`
	FirstReleaseDate  *int64         `json:"first_release_date"`
	Genres            []IGDBGenreDTO `json:"genres"`
	InvolvedCompanies []struct {
		Company struct {
			Name string `json:"name"`
		} `json:"company"`
		Developer bool `json:"developer"`
	} `json:"involved_companies"`
}

var igdbGenreTranslations = map[string]string{
	"shooter":                   "Tiro (Shooter)",
	"fighting":                  "Luta (Fighting)",
	"point-and-click":           "Point-and-Click",
	"music":                     "Música (Music)",
	"platform":                  "Plataforma (Platform)",
	"puzzle":                    "Quebra-cabeça (Puzzle)",
	"racing":                    "Corrida (Racing)",
	"real-time-strategy-rts":    "Estratégia em Tempo Real (RTS)",
	"role-playing-rpg":          "RPG (Role-Playing)",
	"simulator":                 "Simulador (Simulator)",
	"sport":                     "Esporte (Sport)",
	"strategy":                  "Estratégia (Strategy)",
	"turn-based-strategy-tbs":   "Estratégia em Turnos (TBS)",
	"tactical":                  "Tático (Tactical)",
	"hack-and-slash-beat-em-up": "Hack and Slash / Beat 'em up",
	"quiz-trivia":               "Quiz / Trivia",
	"pinball":                   "Pinball",
	"adventure":                 "Aventura (Adventure)",
	"indie":                     "Indie",
	"arcade":                    "Arcade",
	"visual-novel":              "Visual Novel",
	"card-and-board-game":       "Cartas e Tabuleiro (Card & Board)",
	"moba":                      "MOBA",
}

type IGDBService struct {
	client       *http.Client
	clientID     string
	clientSecret string
	tokenMu      sync.RWMutex
	cachedToken  string
	tokenExpiry  time.Time
}

var (
	igdbInstance *IGDBService
	igdbOnce     sync.Once
)

// GetIGDBService retorna a instância singleton do serviço IGDB
func GetIGDBService() *IGDBService {
	igdbOnce.Do(func() {
		igdbInstance = &IGDBService{
			client:       &http.Client{Timeout: 10 * time.Second},
			clientID:     os.Getenv("TWITCH_CLIENT_ID"),
			clientSecret: os.Getenv("TWITCH_CLIENT_SECRET"),
		}
	})
	return igdbInstance
}

// getAccessToken obtém ou renova o token OAuth da Twitch de forma segura
func (s *IGDBService) getAccessToken() (string, error) {
	s.tokenMu.RLock()
	if s.cachedToken != "" && time.Now().Before(s.tokenExpiry) {
		token := s.cachedToken
		s.tokenMu.RUnlock()
		return token, nil
	}
	s.tokenMu.RUnlock()

	s.tokenMu.Lock()
	defer s.tokenMu.Unlock()

	// Checagem dupla após adquirir lock de escrita
	if s.cachedToken != "" && time.Now().Before(s.tokenExpiry) {
		return s.cachedToken, nil
	}

	clientID := os.Getenv("TWITCH_CLIENT_ID")
	clientSecret := os.Getenv("TWITCH_CLIENT_SECRET")
	if clientID == "" || clientSecret == "" {
		return "", fmt.Errorf("TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET não configurados no ambiente")
	}
	s.clientID = clientID
	s.clientSecret = clientSecret

	data := url.Values{}
	data.Set("client_id", s.clientID)
	data.Set("client_secret", s.clientSecret)
	data.Set("grant_type", "client_credentials")

	resp, err := s.client.Post("https://id.twitch.tv/oauth2/token", "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		return "", fmt.Errorf("falha ao conectar à API da Twitch OAuth: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("falha na autenticação Twitch (status %d): %s", resp.StatusCode, string(body))
	}

	var tokenResp twitchTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", fmt.Errorf("falha ao decodificar token da Twitch: %w", err)
	}

	s.cachedToken = tokenResp.AccessToken
	// Subtrai 60 segundos de margem de segurança
	s.tokenExpiry = time.Now().Add(time.Duration(tokenResp.ExpiresIn-60) * time.Second)

	return s.cachedToken, nil
}

// SearchGames busca jogos na API do IGDB com expansão direta de capas e produtoras em 1 única chamada
func (s *IGDBService) SearchGames(query string) ([]IGDBGameDTO, error) {
	query = strings.TrimSpace(query)
	if query == "" {
		return []IGDBGameDTO{}, nil
	}

	token, err := s.getAccessToken()
	if err != nil {
		log.Printf("[IGDBService] Aviso de configuração: %v", err)
		return []IGDBGameDTO{}, nil
	}

	// Sanitiza aspas duplas na query do IGDB
	safeQuery := strings.ReplaceAll(query, `"`, `\"`)
	igdbBody := fmt.Sprintf(`fields name, genres.id, genres.name, genres.slug, cover.image_id, cover.url, first_release_date, involved_companies.developer, involved_companies.company.name; search "%s"; limit 15;`, safeQuery)

	req, err := http.NewRequest("POST", "https://api.igdb.com/v4/games", bytes.NewBufferString(igdbBody))
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição IGDB: %w", err)
	}

	req.Header.Set("Client-ID", s.clientID)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "text/plain")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar API IGDB: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("erro da API IGDB (status %d): %s", resp.StatusCode, string(body))
	}

	var rawGames []igdbRawGame
	if err := json.NewDecoder(resp.Body).Decode(&rawGames); err != nil {
		return nil, fmt.Errorf("falha ao decodificar resposta do IGDB: %w", err)
	}

	db := database.GetDatabase()

	results := make([]IGDBGameDTO, 0, len(rawGames))
	for _, raw := range rawGames {
		coverURL := ""
		if raw.Cover != nil {
			if raw.Cover.ImageID != "" {
				coverURL = fmt.Sprintf("https://images.igdb.com/igdb/image/upload/t_cover_big/%s.jpg", raw.Cover.ImageID)
			} else if raw.Cover.URL != "" {
				coverURL = raw.Cover.URL
				if strings.HasPrefix(coverURL, "//") {
					coverURL = "https:" + coverURL
				}
				coverURL = strings.Replace(coverURL, "t_thumb", "t_cover_big", 1)
			}
		}

		developer := "Desconhecido"
		for _, comp := range raw.InvolvedCompanies {
			if comp.Developer && comp.Company.Name != "" {
				developer = comp.Company.Name
				break
			} else if developer == "Desconhecido" && comp.Company.Name != "" {
				developer = comp.Company.Name
			}
		}

		releaseYear := 0
		if raw.FirstReleaseDate != nil && *raw.FirstReleaseDate > 0 {
			releaseYear = time.Unix(*raw.FirstReleaseDate, 0).UTC().Year()
		}

		// Match genre against local database
		var matchedGenreID *uint
		var matchedGenreName string

		if db != nil && len(raw.Genres) > 0 {
			for _, g := range raw.Genres {
				var localGenre models.Genre
				err := db.Where("igdb_genre_id = ? OR LOWER(igdb_slug) = ? OR LOWER(name_genre) LIKE ?",
					g.ID, strings.ToLower(g.Slug), "%"+strings.ToLower(g.Name)+"%").First(&localGenre).Error
				if err == nil && localGenre.IdGenre > 0 {
					matchedGenreID = &localGenre.IdGenre
					matchedGenreName = localGenre.NameGenre
					break
				}
			}
		}

		results = append(results, IGDBGameDTO{
			ID:          raw.ID,
			Name:        raw.Name,
			UrlImage:    coverURL,
			CoverURL:    coverURL,
			Developer:   developer,
			ReleaseYear: releaseYear,
			Genres:      raw.Genres,
			GenreID:     matchedGenreID,
			GenreName:   matchedGenreName,
		})
	}

	return results, nil
}

// FetchAllGenres busca todos os gêneros cadastrados na API do IGDB
func (s *IGDBService) FetchAllGenres() ([]IGDBGenreDTO, error) {
	token, err := s.getAccessToken()
	if err != nil {
		return nil, fmt.Errorf("falha ao autenticar no IGDB: %w", err)
	}

	igdbBody := "fields id, name, slug; limit 500;"
	req, err := http.NewRequest("POST", "https://api.igdb.com/v4/genres", bytes.NewBufferString(igdbBody))
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição de gêneros IGDB: %w", err)
	}

	req.Header.Set("Client-ID", s.clientID)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "text/plain")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar API de gêneros IGDB: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("erro da API IGDB ao buscar gêneros (status %d): %s", resp.StatusCode, string(body))
	}

	var genres []IGDBGenreDTO
	if err := json.NewDecoder(resp.Body).Decode(&genres); err != nil {
		return nil, fmt.Errorf("falha ao decodificar gêneros do IGDB: %w", err)
	}

	return genres, nil
}

// SyncGenresToDatabase busca todos os gêneros do IGDB e os persiste no banco de dados local
func (s *IGDBService) SyncGenresToDatabase() (int, error) {
	genres, err := s.FetchAllGenres()
	if err != nil {
		return 0, err
	}

	db := database.GetDatabase()
	if db == nil {
		return 0, fmt.Errorf("banco de dados não disponível")
	}

	syncedCount := 0
	for _, g := range genres {
		displayName := g.Name
		if translated, exists := igdbGenreTranslations[g.Slug]; exists {
			displayName = translated
		}

		genreIDCopy := g.ID
		slugCopy := g.Slug

		var existing models.Genre
		// Search existing genre by igdb_genre_id, slug or name
		err := db.Where("igdb_genre_id = ? OR LOWER(igdb_slug) = ? OR LOWER(name_genre) = ? OR LOWER(name_genre) = ?",
			g.ID, strings.ToLower(g.Slug), strings.ToLower(displayName), strings.ToLower(g.Name)).
			First(&existing).Error

		if err != nil {
			// Não existe: cria novo gênero
			newGenre := models.Genre{
				NameGenre:   displayName,
				IgdbGenreID: &genreIDCopy,
				IgdbSlug:    &slugCopy,
				IsActive:    true,
			}
			if err := db.Create(&newGenre).Error; err == nil {
				syncedCount++
			}
		} else {
			// Já existe: atualiza informações de IGDB e ativação se necessário
			existing.IgdbGenreID = &genreIDCopy
			existing.IgdbSlug = &slugCopy
			existing.IsActive = true
			if err := db.Save(&existing).Error; err == nil {
				syncedCount++
			}
		}
	}

	// Limpar cache de gêneros
	utils.GetCache().Delete("active_genres")
	log.Printf("[IGDBService] Sincronização concluída: %d gêneros processados", syncedCount)
	return syncedCount, nil
}

type IGDBPlatformDTO struct {
	ID              uint   `json:"id"`
	Name            string `json:"name"`
	Abbreviation    string `json:"abbreviation"`
	AlternativeName string `json:"alternative_name"`
	Generation      int    `json:"generation"`
	PlatformFamily  *struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	} `json:"platform_family"`
}

// FetchAllPlatforms busca todas as plataformas da API do IGDB
func (s *IGDBService) FetchAllPlatforms() ([]IGDBPlatformDTO, error) {
	token, err := s.getAccessToken()
	if err != nil {
		return nil, fmt.Errorf("falha ao autenticar no IGDB: %w", err)
	}

	igdbBody := "fields id, name, alternative_name, abbreviation, generation, platform_family.name; limit 500; sort id asc;"
	req, err := http.NewRequest("POST", "https://api.igdb.com/v4/platforms", bytes.NewBufferString(igdbBody))
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição de plataformas IGDB: %w", err)
	}

	req.Header.Set("Client-ID", s.clientID)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "text/plain")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar API de plataformas IGDB: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("erro da API IGDB ao buscar plataformas (status %d): %s", resp.StatusCode, string(body))
	}

	var platforms []IGDBPlatformDTO
	if err := json.NewDecoder(resp.Body).Decode(&platforms); err != nil {
		return nil, fmt.Errorf("falha ao decodificar plataformas do IGDB: %w", err)
	}

	return platforms, nil
}

// SyncPlatformsToDatabase sincroniza todas as plataformas do IGDB e consoles essenciais
func (s *IGDBService) SyncPlatformsToDatabase() (int, error) {
	platforms, err := s.FetchAllPlatforms()
	if err != nil {
		log.Printf("[IGDBService] Aviso: erro ao buscar plataformas da API IGDB: %v", err)
	}

	db := database.GetDatabase()
	if db == nil {
		return 0, fmt.Errorf("banco de dados não disponível")
	}

	// Garante fabricantes essenciais
	mfgDefaults := []struct {
		Name string
		Year int
	}{
		{"Sony Interactive Entertainment", 1993},
		{"Nintendo", 1889},
		{"Microsoft Gaming", 2001},
		{"Valve / PC Gaming", 1996},
		{"Sega", 1960},
		{"Atari", 1972},
		{"SNK", 1978},
		{"NEC", 1987},
		{"Bandai", 1950},
		{"Panasonic / 3DO", 1918},
		{"Commodore", 1954},
		{"Apple", 1976},
		{"Google / Android", 1998},
		{"Arcade / Diversos", 1971},
		{"Mobile / Diversos", 2007},
		{"Outras Fabricantes", 1970},
	}

	mfgMap := make(map[string]uint)
	for _, m := range mfgDefaults {
		var existing models.Manufacturer
		if err := db.Where("LOWER(name_manufacturer) = LOWER(?)", m.Name).First(&existing).Error; err != nil {
			newMfg := models.Manufacturer{
				NameManufacturer: m.Name,
				YearFounded:      m.Year,
				IsActive:         true,
			}
			if err := db.Create(&newMfg).Error; err == nil {
				mfgMap[strings.ToLower(m.Name)] = newMfg.IdManufacturer
			}
		} else {
			mfgMap[strings.ToLower(m.Name)] = existing.IdManufacturer
		}
	}

	getMfgID := func(keyword string) uint {
		keyword = strings.ToLower(keyword)
		for k, id := range mfgMap {
			if strings.Contains(k, keyword) {
				return id
			}
		}
		if id, ok := mfgMap["outras fabricantes"]; ok {
			return id
		}
		return 1
	}

	syncedCount := 0

	// 1. Cadastra consoles da planilha
	essentialConsoles := []struct {
		Name    string
		MfgKey  string
		Release string
	}{
		{"Nintendo 8-bits", "nintendo", "1983"},
		{"Super Nintendo", "nintendo", "1990"},
		{"Nintendo 64", "nintendo", "1996"},
		{"Nintendo GameCube", "nintendo", "2001"},
		{"Nintendo Wii", "nintendo", "2006"},
		{"Nintendo Wii U", "nintendo", "2012"},
		{"Nintendo Switch", "nintendo", "2017"},
		{"Nintendo Switch 2", "nintendo", "2025"},
		{"Gameboy", "nintendo", "1989"},
		{"Gameboy Color", "nintendo", "1998"},
		{"Gameboy Advance", "nintendo", "2001"},
		{"Nintendo DS", "nintendo", "2004"},
		{"Nintendo 3DS", "nintendo", "2011"},
		{"PlayStation", "sony", "1994"},
		{"PlayStation 2", "sony", "2000"},
		{"PlayStation 3", "sony", "2006"},
		{"PlayStation 4", "sony", "2013"},
		{"PlayStation 5", "sony", "2020"},
		{"PlayStation Portable", "sony", "2004"},
		{"PlayStation Vita", "sony", "2011"},
		{"Xbox", "microsoft", "2001"},
		{"Xbox 360", "microsoft", "2005"},
		{"Xbox One", "microsoft", "2013"},
		{"Xbox Series X|S", "microsoft", "2020"},
		{"Sega Master System", "sega", "1985"},
		{"Sega MegaDrive", "sega", "1988"},
		{"Sega 32X", "sega", "1994"},
		{"Sega CD", "sega", "1991"},
		{"Sega Saturn", "sega", "1994"},
		{"Sega Dreamcast", "sega", "1998"},
		{"Sega Game Gear", "sega", "1990"},
		{"PC", "valve", "1981"},
		{"PC (Steam)", "valve", "2003"},
		{"Arcade", "arcade", "1971"},
		{"Mobile", "mobile", "2007"},
		{"Atari 2600", "atari", "1977"},
		{"Atari 5200", "atari", "1982"},
		{"Atari 7800", "atari", "1986"},
		{"Neo Geo", "snk", "1990"},
		{"TurboGrafx-16 / PC Engine", "nec", "1987"},
		{"WonderSwan", "bandai", "1999"},
		{"3DO Interactive Multiplayer", "3do", "1993"},
		{"Commodore 64", "commodore", "1982"},
		{"Amiga", "commodore", "1985"},
	}

	for _, c := range essentialConsoles {
		var existing models.Console
		if err := db.Where("LOWER(name_console) = LOWER(?)", c.Name).First(&existing).Error; err != nil {
			newConsole := models.Console{
				NameConsole:    c.Name,
				ManufacturerID: getMfgID(c.MfgKey),
				ReleaseDate:    c.Release,
				IsActive:       true,
			}
			if err := db.Create(&newConsole).Error; err == nil {
				syncedCount++
			}
		}
	}

	// 2. Cadastra plataformas do IGDB
	for _, p := range platforms {
		pname := strings.TrimSpace(p.Name)
		if pname == "" {
			continue
		}

		var existing models.Console
		if err := db.Where("LOWER(name_console) = LOWER(?)", pname).First(&existing).Error; err != nil {
			fam := ""
			if p.PlatformFamily != nil {
				fam = p.PlatformFamily.Name
			}
			combined := strings.ToLower(fam + " " + pname)
			mfgID := getMfgID("outras")

			if strings.Contains(combined, "nintendo") || strings.Contains(combined, "game boy") || strings.Contains(combined, "switch") || strings.Contains(combined, "famicom") || strings.Contains(combined, "wii") {
				mfgID = getMfgID("nintendo")
			} else if strings.Contains(combined, "playstation") || strings.Contains(combined, "sony") || strings.Contains(combined, "psp") || strings.Contains(combined, "vita") || strings.Contains(combined, "psvr") {
				mfgID = getMfgID("sony")
			} else if strings.Contains(combined, "xbox") || strings.Contains(combined, "microsoft") {
				mfgID = getMfgID("microsoft")
			} else if strings.Contains(combined, "sega") || strings.Contains(combined, "genesis") || strings.Contains(combined, "dreamcast") || strings.Contains(combined, "saturn") {
				mfgID = getMfgID("sega")
			} else if strings.Contains(combined, "atari") {
				mfgID = getMfgID("atari")
			} else if strings.Contains(combined, "snk") || strings.Contains(combined, "neo geo") {
				mfgID = getMfgID("snk")
			} else if strings.Contains(combined, "nec") || strings.Contains(combined, "pc engine") || strings.Contains(combined, "turbografx") {
				mfgID = getMfgID("nec")
			} else if strings.Contains(combined, "commodore") || strings.Contains(combined, "amiga") {
				mfgID = getMfgID("commodore")
			} else if strings.Contains(combined, "apple") || strings.Contains(combined, "mac") || strings.Contains(combined, "ios") {
				mfgID = getMfgID("apple")
			} else if strings.Contains(combined, "android") || strings.Contains(combined, "google") {
				mfgID = getMfgID("google")
			} else if strings.Contains(combined, "arcade") {
				mfgID = getMfgID("arcade")
			} else if strings.Contains(combined, "pc") || strings.Contains(combined, "windows") || strings.Contains(combined, "dos") || strings.Contains(combined, "linux") || strings.Contains(combined, "steam") {
				mfgID = getMfgID("valve")
			}

			genYear := "Clássico"
			if p.Generation > 0 {
				genYear = fmt.Sprintf("Gen %d", p.Generation)
			}

			newConsole := models.Console{
				NameConsole:    pname,
				ManufacturerID: mfgID,
				ReleaseDate:    genYear,
				IsActive:       true,
			}
			if err := db.Create(&newConsole).Error; err == nil {
				syncedCount++
			}
		}
	}

	log.Printf("[IGDBService] Sincronização de consoles concluída: %d consoles processados", syncedCount)
	return syncedCount, nil
}
