# ==============================================================================
# CHECKPOINT BACKLOG MANAGER - DOCKER MAKEFILE
# ==============================================================================

DOCKER_COMPOSE = docker compose

.PHONY: help all run run-all run-mobile run-backend run-db run-angular run-react \
        build stop down logs ps clean

# Permite capturar argumentos para a sintaxe 'make run <alvo>'
ifeq (run,$(firstword $(MAKECMDGOALS)))
  RUN_TARGET := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  $(eval $(RUN_TARGET):;@:)
endif

help:
	@echo "======================================================================="
	@echo "           CHECKPOINT - COMANDOS DOCKER DISPONÍVEIS                    "
	@echo "======================================================================="
	@echo "  make run all       (ou make run-all)      - Sobe DB, Backend, Angular e React (EXCLUI MOBILE)"
	@echo "  make run mobile    (ou make run-mobile)   - Sobe apenas o container Mobile (Expo)"
	@echo "  make run backend   (ou make run-backend)  - Sobe o Banco e a API Go"
	@echo "  make run db        (ou make run-db)       - Sobe apenas o PostgreSQL"
	@echo "  make run angular   (ou make run-angular)  - Sobe o Frontend Angular (Legado)"
	@echo "  make run react     (ou make run-react)    - Sobe o Frontend React (Novo)"
	@echo "  make build                                - Constrói todas as imagens Docker"
	@echo "  make stop                                 - Para todos os containers em execução"
	@echo "  make down                                 - Para e remove containers e redes"
	@echo "  make logs                                 - Exibe os logs unificados em tempo real"
	@echo "  make ps                                   - Exibe o status de todos os containers"
	@echo "  make clean                                - Remove volumes e containers órfãos"
	@echo "======================================================================="

# Handler flexível para aceitar 'make run all', 'make run mobile', etc.
run:
	@if [ "$(RUN_TARGET)" = "all" ] || [ -z "$(RUN_TARGET)" ]; then \
		$(MAKE) run-all; \
	elif [ "$(RUN_TARGET)" = "mobile" ]; then \
		$(MAKE) run-mobile; \
	elif [ "$(RUN_TARGET)" = "backend" ]; then \
		$(MAKE) run-backend; \
	elif [ "$(RUN_TARGET)" = "db" ] || [ "$(RUN_TARGET)" = "postgres" ]; then \
		$(MAKE) run-db; \
	elif [ "$(RUN_TARGET)" = "angular" ]; then \
		$(MAKE) run-angular; \
	elif [ "$(RUN_TARGET)" = "react" ]; then \
		$(MAKE) run-react; \
	else \
		echo "Alvo desconhecido: $(RUN_TARGET). Use 'make help' para ver as opções."; \
	fi

# Sobe tudo, EXCETO o Mobile (Regra estrita)
run-all:
	@echo "🚀 Iniciando CheckPOINT: Postgres, Backend, Angular e React..."
	@echo "ℹ️  O projeto Mobile foi explicitamente omitido conforme especificação."
	$(DOCKER_COMPOSE) up -d postgres backend frontend-angular frontend-react
	@echo "✅ Serviços em execução:"
	@echo "   - Postgres:         localhost:5432"
	@echo "   - Backend API:      http://localhost:8080"
	@echo "   - Frontend Angular: http://localhost:4200"
	@echo "   - Frontend React:   http://localhost:3000"

# Sobe especificamente o projeto Mobile Expo
run-mobile:
	@echo "📱 Iniciando Frontend Mobile (Expo React Native)..."
	$(DOCKER_COMPOSE) --profile mobile up -d frontend-mobile
	@echo "✅ Frontend Mobile iniciado em http://localhost:8081"

# Sobe apenas o Backend e o Postgres
run-backend:
	@echo "⚙️ Iniciando PostgreSQL e Backend Go..."
	$(DOCKER_COMPOSE) up -d postgres backend
	@echo "✅ Backend pronto em http://localhost:8080"

# Sobe apenas o banco de dados Postgres
run-db:
	@echo "🐘 Iniciando PostgreSQL..."
	$(DOCKER_COMPOSE) up -d postgres
	@echo "✅ PostgreSQL ativo na porta 5432"

# Sobe apenas o Angular Legado
run-angular:
	@echo "🅰️  Iniciando Frontend Angular..."
	$(DOCKER_COMPOSE) up -d postgres backend frontend-angular
	@echo "✅ Angular pronto em http://localhost:4200"

# Sobe apenas o React Novo
run-react:
	@echo "⚛️  Iniciando Frontend React..."
	$(DOCKER_COMPOSE) up -d postgres backend frontend-react
	@echo "✅ React pronto em http://localhost:3000"

# Build de todas as imagens Docker
build:
	@echo "🔨 Construindo todas as imagens Docker..."
	$(DOCKER_COMPOSE) --profile mobile build

# Para os containers sem remover
stop:
	@echo "🛑 Parando todos os containers..."
	$(DOCKER_COMPOSE) --profile mobile stop

# Para e remove containers, redes
down:
	@echo "🧹 Parando e removendo containers e redes..."
	$(DOCKER_COMPOSE) --profile mobile down

# Exibe logs
logs:
	$(DOCKER_COMPOSE) --profile mobile logs -f

# Status dos containers
ps:
	$(DOCKER_COMPOSE) --profile mobile ps

# Limpeza total
clean:
	@echo "⚠️  Limpando containers órfãos e volumes temporários..."
	$(DOCKER_COMPOSE) --profile mobile down -v --remove-orphans
