#!/bin/sh
set -eu

: "${API_URL:=/api}"
export API_URL
envsubst '${API_URL}' < /usr/share/nginx/html/runtime-config.template.js > /usr/share/nginx/html/runtime-config.js
