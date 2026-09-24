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
)

type IGDBGameDTO struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	UrlImage    string `json:"url_image"`
	CoverURL    string `json:"cover_url"`
	Developer   string `json:"developer"`
	ReleaseYear int    `json:"release_year"`
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
	FirstReleaseDate  *int64 `json:"first_release_date"`
	InvolvedCompanies []struct {
		Company struct {
			Name string `json:"name"`
		} `json:"company"`
		Developer bool `json:"developer"`
	} `json:"involved_companies"`
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
	igdbBody := fmt.Sprintf(`fields name, cover.image_id, cover.url, first_release_date, involved_companies.developer, involved_companies.company.name; search "%s"; limit 15;`, safeQuery)

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

		results = append(results, IGDBGameDTO{
			ID:          raw.ID,
			Name:        raw.Name,
			UrlImage:    coverURL,
			CoverURL:    coverURL,
			Developer:   developer,
			ReleaseYear: releaseYear,
		})
	}

	return results, nil
}
