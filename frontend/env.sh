#!/bin/sh
# Generate env-config.js with runtime environment variables
echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  VITE_API_URL: \"$VITE_API_URL\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Start Nginx
exec "$@"
