const fs = require('fs');
// Load variables from .env into process.env
require('dotenv').config();

const { private_key } = JSON.parse(process.env.GOOGLE_PRIVATE_KEY);

const credentials = {
  type: 'service_account',
  project_id: 'pursuit-attendance-tracker', // Reusing this since we never did anything with it
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: private_key,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};

fs.writeFileSync(
  'cert.json',
  JSON.stringify(credentials, null, 2)
);