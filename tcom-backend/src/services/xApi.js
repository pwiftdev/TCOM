const axios = require('axios');

async function exchangeCodeForToken({ code, clientId, clientSecret, redirectUri, codeVerifier }) {
  const payload = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  });

  const response = await axios.post('https://api.twitter.com/2/oauth2/token', payload.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    auth: { username: clientId, password: clientSecret }
  });

  return response.data;
}

async function fetchProfile(accessToken) {
  const response = await axios.get(
    'https://api.twitter.com/2/users/me?user.fields=profile_image_url,description,public_metrics,name,username',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data.data;
}

module.exports = { exchangeCodeForToken, fetchProfile };
