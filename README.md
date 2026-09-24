# CheckPOINT - Game Backlog & Conquistas 🎮

O **CheckPOINT** é uma plataforma completa e moderna para acompanhamento da jornada gamer: registro de jogos zerados, gerenciamento de backlog, estatísticas detalhadas de tempo de jogo, análise de gêneros/plataformas e integração direta com a base de dados do **IGDB (Internet Game Database)**.

O projeto foi modernizado a partir de uma base legado e hoje é estruturado em uma arquitetura robusta de microsserviços / monorepo, contando com backend de alta performance em Go, frontend legado Angular modernizado, nova aplicação Web em React, aplicativo Mobile em React Native (Expo) com código compartilhado (`@checkpoint/core`), além de orquestração completa via **Docker** e **Makefile**.

---

## 🏛️ Arquitetura do Ecossistema

O repositório está organizado como um monorepo multi-plataforma:

```text
checkpoint-backlog-manager/
├── back-end/                      # API RESTful em GoFiber v2 + GORM + PostgreSQL + Cache + BFF IGDB
│   ├── controllers/              # Handlers HTTP organizados por domínio
│   ├── database/                 # Conexão GORM, pooling, migrações e índices
│   ├── models/                   # Modelos de dados e sanitização JSON
│   ├── security/                 # Hashing de senhas (bcrypt) e JWT
│   ├── server/                   # Rotas Fiber e middlewares (RBAC, Rate Limiting, CORS)
│   ├── services/                 # Cache em memória, cliente IGDB e lógica de negócio
│   ├── utils/                    # Utilitários e cálculo estatístico de mediana
│   └── Dockerfile                # Multi-stage Alpine build da API
├── front-end/
│   └── web/                      # Frontend Web em Angular 18 (Legado modernizado)
│       ├── src/app/              # Componentes, Guards, Interceptors e Módulo Admin
│       ├── nginx.conf            # Nginx com SPA fallback e reverse proxy para a API
│       └── Dockerfile            # Multi-stage Nginx build da aplicação Angular
├── packages/
│   └── core/                     # @checkpoint/core (Pacote Compartilhado Web/Mobile)
│       ├── src/types/            # Tipos de domínio TypeScript
│       ├── src/schemas/          # Schemas Zod de validação de formulários
│       ├── src/services/         # Cliente HTTP agnóstico de plataforma com StorageAdapter
│       └── src/hooks/            # Hooks TanStack Query v5 para listagem, mutações e cache
├── apps/
│   ├── web/                      # @checkpoint/web (Nova Aplicação Web React 18)
│   │   ├── src/components/       # UI Gamer, Poster Grid 3:4, Modais e Dashboard
│   │   ├── src/pages/            # Páginas: Zerados, Backlog, Estatísticas e Perfil
│   │   ├── nginx.conf            # Nginx de produção com reverse proxy para /api/
│   │   └── Dockerfile            # Multi-stage Nginx build da aplicação React
│   └── mobile/                   # @checkpoint/mobile (Aplicativo Mobile Expo SDK 51)
│       ├── src/app/              # Expo Router com navegação em abas (Tabs)
│       ├── src/components/       # Componentes nativos, Poster Grid e Haptic Feedback
│       └── Dockerfile            # Container Expo Web / Metro bundler (Profile mobile)
├── docker-compose.yml            # Orquestração de todos os 5 serviços e rede interna
└── Makefile                      # Automação de execução, build e gerenciamento
```

---

## 🐳 Execução via Docker (Recomendado)

O projeto possui orquestração completa via Docker Compose e comandos simplificados pelo **Makefile**.

### 🌐 Mapeamento de Portas e Containers

| Serviço | Container | Stack / Base | Porta Host | Docker Compose Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Banco de Dados** | `checkpoint-postgres` | `postgres:16-alpine` | `5432` | Padrão |
| **Backend API** | `checkpoint-backend` | Go 1.23 (`alpine:3.20`) | `8080` | Padrão |
| **Frontend Legado** | `checkpoint-frontend-angular` | Angular 18 (`nginx:alpine`) | `4200` | Padrão |
| **Frontend Novo** | `checkpoint-frontend-react` | React 18 / Vite (`nginx:alpine`) | `3000` | Padrão |
| **Frontend Mobile** | `checkpoint-frontend-mobile` | Expo SDK 51 (`node:20-alpine`) | `8081` | `mobile` |

---

### 🎯 Regra de Ouro: Exclusão do Mobile no `make run all`

> **Nota de Arquitetura:** O container `frontend-mobile` está isolado sob o profile **`mobile`** no `docker-compose.yml`. Ao rodar `make run all`, **apenas o Banco, Backend, Angular e React são iniciados**. O container Mobile não é executado por padrão.

### 🛠️ Tabela de Comandos do Makefile

O Makefile suporta tanto a sintaxe com espaços (`make run <alvo>`) quanto hifenizada (`make run-<alvo>`):

```bash
# ==============================================================================
# 1. INICIALIZAÇÃO DE SERVIÇOS
# ==============================================================================

# Sobe Banco, Backend, Angular e React (NÃO SOBE O MOBILE)
make run all          # ou: make run-all

# Sobe EXCLUSIVAMENTE o Frontend Mobile (Expo Web / Metro)
make run mobile       # ou: make run-mobile

# Sobe apenas o Banco PostgreSQL e o Backend Go
make run backend      # ou: make run-backend

# Sobe apenas o Banco PostgreSQL
make run db           # ou: make run-db

# Sobe o Frontend Angular Legado (com Banco e Backend)
make run angular      # ou: make run-angular

# Sobe o Frontend React Novo (com Banco e Backend)
make run react        # ou: make run-react

# ==============================================================================
# 2. OPERAÇÃO E MANUTENÇÃO
# ==============================================================================

# Constrói todas as imagens Docker (incluindo a do Mobile)
make build

# Exibe o status de todos os containers
make ps

# Visualiza os logs unificados em tempo real
make logs

# Pausa todos os containers sem removê-los
make stop

# Para e remove containers e redes
make down

# Limpeza profunda de volumes órfãos e dados temporários
make clean
```

---

## 💻 Execução Local (Sem Docker)

Caso prefira executar os serviços nativamente no ambiente de desenvolvimento:

### Pré-requisitos
- **Go:** 1.22+ ou 1.23+
- **Node.js:** 20+
- **pnpm:** 10+ (`npm install -g pnpm@latest`)
- **PostgreSQL:** 16+ ativo na porta 5432

---

### 1. Banco de Dados PostgreSQL
Crie um banco chamado `checkpoint_db`:
```sql
CREATE DATABASE checkpoint_db;
```

---

### 2. Backend Go
```bash
cd back-end

# Crie e configure as variáveis de ambiente
cp .env.example .env

# Instale dependências e execute
go mod tidy
go run main.go
# O servidor iniciará em http://localhost:8080
```

#### Variáveis de Ambiente do Backend (`back-end/.env`):
| Variável | Descrição | Exemplo / Padrão |
| :--- | :--- | :--- |
| `APP_MODE` | Modo de execução (`development` ou `production`) | `development` |
| `PORT` | Porta de escuta da API Fiber | `8080` |
| `JWT_SECRET` | Chave de assinatura criptográfica dos tokens JWT | `sua_chave_secreta_super_segura` |
| `DB_HOST_DEV` | Host do banco de desenvolvimento | `localhost` (ou `postgres` no Docker) |
| `DB_PORT_DEV` | Porta do PostgreSQL | `5432` |
| `DB_USER_DEV` | Usuário do banco | `postgres` |
| `DB_PASSWORD_DEV` | Senha do usuário do banco | `postgres` |
| `DB_NAME_DEV` | Nome da base de dados | `checkpoint_db` |
| `DB_SSLMODE_DEV` | Modo SSL do PostgreSQL | `disable` |
| `TWITCH_CLIENT_ID` | Client ID da Twitch Developer Console para IGDB | `seu_client_id` |
| `TWITCH_CLIENT_SECRET` | Client Secret da Twitch Developer Console para IGDB | `seu_client_secret` |

---

### 3. Pacote Compartilhado (`@checkpoint/core`)
Antes de iniciar as novas aplicações Web e Mobile, faça o build do pacote core:
```bash
# Na raiz do repositório
pnpm install
pnpm --filter @checkpoint/core build
```

---

### 4. Nova Aplicação Web (React 18 + Vite)
```bash
# Na raiz do repositório
pnpm dev:web
# A aplicação estará disponível em http://localhost:3000
```

---

### 5. Aplicação Mobile (React Native Expo)
```bash
# Na raiz do repositório
cd apps/mobile
pnpm start
# Pressione 'w' para abrir no navegador, 'a' para Android emulator, ou escaneie o QR Code com o Expo Go
```

---

### 6. Frontend Legado (Angular 18)
```bash
cd front-end/web
npm install
npm run start
# A aplicação estará disponível em http://localhost:4200
```

---

## 📱 Visão das Aplicações do Ecossistema

### 1. Pacote Compartilhado: `@checkpoint/core`
* **Localização:** `packages/core/`
* **Reuso de Código:** Compartilha **mais de 70%** da lógica de negócio entre Web e Mobile.
* **Módulos:**
  * **Tipos de Domínio:** Modelos estritos de `Game`, `Console`, `Genre`, `DashboardStats`, `AuthTokens` e `IGDBGameResult`.
  * **Schemas Zod:** Validações de entrada de formulários de jogos e autenticação com mensagens customizadas.
  * **Cliente HTTP Agnóstico:** Suporte a `StorageAdapter` desacoplado (`localStorage` no browser e `expo-secure-store` no mobile).
  * **Hooks Reativos TanStack Query v5:** `useGamesList`, `useBacklog`, `useStats`, `useIGDBGameSearch`, `useCreateGame`, etc., com gerenciamento automático de cache e revalidação otimista.

### 2. Nova Aplicação Web: `@checkpoint/web`
* **Localização:** `apps/web/`
* **Stack:** React 18, Vite 5, TailwindCSS 3, Lucide React, TanStack Query v5.
* **Destaques de Design e Funcionalidades:**
  * **Design System Obsidian Gamer:** Paleta escura Deep Obsidian (`#0D1117`), superfícies translúcidas com blur e acentos Neon Violet (`#8B5CF6`), Emerald (`#10B981`) e Cyan (`#06B6D4`).
  * **Autenticação Completa do Jogador:** Gerenciamento de sessão com `AuthContext`, modal gamer com alternância dinâmica entre *Login* e *Criar Conta*, e persistência de token JWT com validação automática de perfil. Proteção ativa para criação de jogos e backlog.
  * **Estatísticas Gamísticas Aprofundadas:** Página dedicada de métricas com filtros por Gênero, Plataforma/Console e Ano de Lançamento, barras de progresso proporcionais, paginação e modal drill-down detalhado exibindo jogo destaque, média de horas e relação completa de títulos.
  * **Poster Grid 3:4:** Grade com posters proporcionais, badges dinâmicos de status (Zerado, Backlog, Abandonado) e tempo de conclusão.
  * **Alternância de Visualização:** Toggle dinâmico entre Grade de Pôsteres e Tabela Compacta.
  * **Busca Preditiva IGDB:** Integração de busca instantânea no modal de cadastro de jogos, preenchendo automaticamente capa, título, gênero e resumo.
  * **Dashboard Gamer:** Métricas em tempo real (total de jogos zerados, tempo total jogado, média e mediana de horas, e timeline de conclusões recentes).

### 3. Aplicativo Mobile: `@checkpoint/mobile`
* **Localização:** `apps/mobile/`
* **Stack:** React Native 0.74, Expo SDK 51, Expo Router, NativeWind, `expo-secure-store`, `expo-haptics`.
* **Destaques:**
  * **Roteamento Moderno:** Navegação nativa em abas (`(tabs)`) através do Expo Router.
  * **Poster Grid Nativo:** Grade de 2 colunas responsivas em proporção 3:4 com carregamento progressivo de capas.
  * **Segurança Nativa:** Armazenamento seguro de tokens JWT no iOS Keychain e Android Keystore via `expo-secure-store`.
  * **Haptic Feedback:** Vibrações táteis nativas ao marcar jogos como zerados ou interagir com itens do backlog.

### 4. Frontend Legado Estabilizado: Angular 18
* **Localização:** `front-end/web/`
* **Stack:** Angular 18 (Standalone Components / Signals), TailwindCSS, Nginx.
* **Modernizações Aplicadas:**
  * Tema Dark Mode Gamer obsidian e pôsteres no padrão 3:4.
  * `AuthInterceptor` modular injetando tokens JWT dinâmicos.
  * Lazy loading do módulo administrativo, reduzindo drasticamente o payload inicial.

---

## 🛡️ Auditoria de Segurança, Performance e Melhorias

Todo o código-fonte passou por um ciclo exaustivo de auditoria e resolução de débitos técnicos. Abaixo está o resumo consolidado das 11 tarefas de auditoria e 5 melhorias arquiteturais implementadas:

| ID | Categoria | Severidade | Descrição da Resolução |
| :--- | :--- | :--- | :--- |
| `[critico]_01` | Segurança | Crítica | Segredo JWT extraído de variável de ambiente com chave dinâmica; proteção de rota admin. |
| `[critico]_02` | Segurança | Crítica | Criação de `AuthInterceptor` Angular com injeção automática de Bearer Token; remoção de tokens hardcoded. |
| `[critico]_03` | Segurança | Crítica | Sanitização de senhas via `MarshalJSON` nas structs GORM, impedindo vazamento de hashes em respostas JSON. |
| `[critico]_04` | Segurança | Crítica | Middleware de RBAC (`RequireRole("admin")`) no GoFiber protegendo operações sensíveis do sistema. |
| `[alto]_05` | Performance | Alta | Otimização da importação de CSV eliminando problema N+1 através de pré-carga e `CreateInBatches`. |
| `[alto]_06` | Banco | Alta | Paginação retrocompatível na API e criação de índices compostos no PostgreSQL (`idx_games_player_status`). |
| `[alto]_07` | Frontend | Alta | Lazy loading do módulo de Administração no Angular e remoção de pacotes npm não utilizados. |
| `[alto]_08` | Segurança | Alta | Fluxo seguro de redefinição de senha com tokens JWT temporários e hash bcrypt. |
| `[medio]_09` | Performance | Média | Consultas estatísticas otimizadas via SQL nativo e algoritmo correto para cálculo de mediana de horas. |
| `[medio]_10` | Infra | Média | Porta dinâmica via variável `PORT` e configuração de Connection Pooling no PostgreSQL (`SetMaxOpenConns`, `SetMaxIdleConns`). |
| `[baixo]_11` | Qualidade | Baixa | Limpeza de dead code, imports não utilizados e tratamento seguro de campos de data nulos (`*time.Time`). |
| `[melhoria]_01` | Arquitetura | Média | Cache thread-safe em memória (`RWMutex`) com TTL e invalidação reativa no GoFiber. |
| `[melhoria]_02` | UI/UX | Alta | Redesign completo Gamer: Dark Mode Nativo, Grid 3:4 de posters e alternador Grade/Tabela. |
| `[melhoria]_03` | Frontend | Alta | Nova aplicação Web em React 18 + Vite 5 + TailwindCSS + TanStack Query v5. |
| `[melhoria]_04` | Mobile | Média | Novo aplicativo Mobile React Native com Expo SDK 51, Expo Router e Haptics. |
| `[melhoria]_05` | Integração | Alta | Proxy BFF no GoFiber para API IGDB/Twitch OAuth2, reduzindo requisições de 31 para 1 e blindando credenciais. |

---

## 📡 Principais Endpoints da API REST (GoFiber)

### Autenticação & Usuários
- `POST /api/v1/user/register` — Cadastro de novo jogador
- `POST /api/v1/user/auth` — Login e obtenção de token JWT
- `POST /api/v1/user/admin/register` — Cadastro administrativo protegido por chave
- `POST /api/v1/user/forgot-password` — Solicitação de redefinição de senha
- `POST /api/v1/user/reset-password` — Confirmação e redefinição com token

### Jogos & Backlog
- `GET /api/v1/player/games?page=1&limit=20` — Lista paginada de jogos concluídos
- `POST /api/v1/player/games` — Registro de novo jogo
- `PUT /api/v1/player/games/:id` — Atualização de status, horas e notas
- `DELETE /api/v1/player/games/:id` — Remoção de jogo do registro
- `GET /api/v1/player/backlog` — Lista de jogos pendentes no backlog
- `GET /api/v1/player/stats` — Estatísticas completas agregadas (total de horas, média, mediana e favoritos)
- `POST /api/v1/player/import/csv` — Importação em massa de histórico de jogos via CSV

### Integração IGDB (BFF Proxy)
- `GET /api/v1/igdb/search?query=Zelda` — Busca de títulos e capas diretamente na base do IGDB
- `GET /api/v1/igdb/game/:id` — Detalhes completos e metadados de um jogo específico

---

## 📜 Licença

Distribuído sob a licença **MIT**. Consulte `LICENSE` para mais informações.