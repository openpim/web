cat << EOF > /web/env.js
window.OPENPIM_SERVER_URL = '${OPENPIM_SERVER_URL}';
EOF

nginx -g 'daemon off;'
