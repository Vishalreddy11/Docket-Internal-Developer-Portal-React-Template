.PHONY: install dev build preview lint typecheck test test-e2e generate-api up down clean

install:
	pnpm install

dev:
	pnpm run dev

build:
	pnpm run build

preview:
	pnpm run preview

typecheck:
	pnpm run typecheck

lint:
	pnpm run lint

test:
	pnpm run test

test-e2e:
	pnpm run test:e2e

# Regenerate the API client types from your backend's OpenAPI spec.
# Pass URL or path as an env var:
#   API_SPEC=http://localhost:8080/openapi.json make generate-api
generate-api:
	pnpm run generate-api -- $${API_SPEC:-http://localhost:8080/openapi.json} -o src/api/generated/schema.ts

up:
	docker compose up -d --build

down:
	docker compose down

clean:
	rm -rf node_modules dist coverage playwright-report test-results
