# CheckPOINT - Game Backlog & Conquistas 🎮

O **CheckPOINT** é uma plataforma completa e moderna para acompanhamento da jornada gamer: registro de jogos zerados, gerenciamento de backlog, estatísticas detalhadas de tempo de jogo e integração com a base de dados do IGDB.

---

## 🏛️ Arquitetura do Repositório

O projeto é estruturado em um ecossistema com backend de alta performance em Go e aplicações cliente web e mobile organizadas em monorepo com código compartilhado:

```text
checkpoint-backlog-manager/
├── back-end/                      # API RESTful em GoFiber v2 + GORM + PostgreSQL + Cache + BFF IGDB
├── front-end/
│   └── web/                      # Frontend Web em Angular 18 (SSR / Dark Mode Gamer / Poster Grid 3:4)
├── packages/
│   └── core/                     # @checkpoint/core (Tipagens TypeScript, Schemas Zod, TanStack Query Hooks)
└── apps/
    ├── web/                      # @checkpoint/web (React 18 + Vite 5 + TailwindCSS + Lucide)
    └── mobile/                   # @checkpoint/mobile (React Native + Expo SDK 51 + Expo Router + Haptics)
```

---

## 🚀 Como Executar

### 1. Backend (GoFiber v2)
Certifique-se de ter o Go instalado (versão 1.22+ ou 1.23+):
```bash
cd back-end
cp .env.example .env     # Configure as credenciais do PostgreSQL, JWT e Twitch/IGDB
go mod tidy
go run main.go           # O servidor iniciará por padrão em http://localhost:8080
```

### 2. Frontend Legado / Estabilizado (Angular 18)
```bash
cd front-end/web
npm install
npm run start            # Acessível em http://localhost:4200
```

### 3. Nova Aplicação Web (React + Vite)
Utilize o monorepo pnpm configurado na raiz:
```bash
# Na raiz do repositório
pnpm install
pnpm dev:web             # Inicia o Vite na porta 3000 com proxy automático para a API Go
```

### 4. Aplicação Mobile (React Native Expo)
```bash
# Na raiz do repositório
cd apps/mobile
pnpm start               # Inicia o Metro Bundler para iOS, Android ou Expo Go
```

---

## 🛡️ Auditoria e Melhorias Concluídas

- **Segurança e RBAC:** Autenticação JWT com segredo dinâmico, RBAC por middleware no backend, sanitização de senhas via `MarshalJSON` e interceptor de autenticação no frontend.
- **Performance e Banco:** Otimização de importação de CSV em lote (`CreateInBatches`), indexação composta no PostgreSQL, paginação na API e queries com agregações nativas.
- **Cache e Resiliência:** Cache em memória thread-safe com TTL e invalidação reativa no Go, além de pool de conexões PostgreSQL configurado.
- **Proxy BFF IGDB:** Integração com a API da Twitch/IGDB via backend em 1 única requisição direta com renovação automática de token OAuth2.
- **UI/UX Gamer:** Dark Mode nativo (Obsidian `#0D1117`), grade visual de posters 3:4, alternador entre grade e tabela compacta, e dashboard do jogador com timeline de conquistas.
- **Compartilhamento de Código (@checkpoint/core):** Mais de 70% da lógica de negócio, tipos, schemas de validação Zod e hooks do TanStack Query v5 compartilhados entre a aplicação Web React e o aplicativo Mobile Expo.