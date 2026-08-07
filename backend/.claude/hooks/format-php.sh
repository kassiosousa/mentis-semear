#!/usr/bin/env bash
# PostToolUse hook: formata (Laravel Pint) SOMENTE o arquivo PHP recém-editado,
# rodando dentro do container. Recebe o JSON do hook no stdin.
root="$(git rev-parse --show-toplevel 2>/dev/null)" || root="."
cd "$root" 2>/dev/null || true

f="$(python -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)" || exit 0

case "$f" in
  *.php|*.PHP) ;;
  *) exit 0 ;;
esac

# Path absoluto (Windows ou Unix) -> caminho relativo dentro do container (/var/www/html = backend/)
rel="$(printf '%s' "$f" | tr '\\' '/' | sed -E 's#.*/backend/##')"

MSYS_NO_PATHCONV=1 docker compose exec -T php ./vendor/bin/pint "$rel" >/dev/null 2>&1 || true
exit 0
