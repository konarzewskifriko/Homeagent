# Homeagent — mobile upload version

Ta wersja nie wymaga folderów. Wgraj wszystkie 5 plików bezpośrednio do głównego katalogu repozytorium Homeagent.

Pliki:
- index.js
- package.json
- wrangler.toml
- schema.sql
- README.md

Następnie połącz repozytorium z Cloudflare, utwórz D1 `homeagent-db`,
wklej jego database_id do wrangler.toml i wykonaj schema.sql w D1.

ASARI: endpointy i autoryzacja nie są wymyślone. Trzeba je ustawić według
oficjalnej dokumentacji i danych konkretnego konta.
