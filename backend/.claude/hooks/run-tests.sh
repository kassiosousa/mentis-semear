#!/usr/bin/env bash
# Stop hook: roda a suíte de testes ao fim do turno, apenas se houver
# arquivos .php pendentes (modificados ou novos, ainda não commitados).
# Em caso de falha, emite um systemMessage para avisar o usuário.
root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$root" || exit 0

if { git diff --name-only HEAD; git ls-files --others --exclude-standard; } 2>/dev/null | grep -q '\.php$'; then
  if ! MSYS_NO_PATHCONV=1 docker compose exec -T php php artisan test >/tmp/mentis-test.log 2>&1; then
    printf '{"systemMessage":"⚠️ Testes falharam — rode: docker compose exec php php artisan test"}'
  fi
fi
exit 0
