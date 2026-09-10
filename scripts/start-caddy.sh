#!/usr/bin/env sh
set -eu

PORT="${PORT:-3000}"
USER_NAME="${APP_USERNAME:-admin}"
PASSWORD="${APP_PASSWORD:-}"

AUTH_BLOCK=""
if [ -n "$PASSWORD" ]; then
  HASH="$(caddy hash-password --plaintext "$PASSWORD")"
  AUTH_BLOCK=$(cat <<EOF
	basic_auth {
		${USER_NAME} ${HASH}
	}
EOF
)
  echo "Caddy basic auth enabled for user '${USER_NAME}'"
else
  echo "Caddy basic auth disabled (set APP_PASSWORD to enable)"
fi

CONFIG="/tmp/Caddyfile.railway"
cat > "$CONFIG" <<EOF
{
	admin off
	persist_config off
	auto_https off
	log {
		format json
	}
	servers {
		trusted_proxies static private_ranges 100.0.0.0/8
	}
}

:${PORT} {
	log {
		format json
	}
${AUTH_BLOCK}
	root * dist
	encode gzip
	file_server
	try_files {path} /index.html
}
EOF

exec caddy run --config "$CONFIG" --adapter caddyfile
