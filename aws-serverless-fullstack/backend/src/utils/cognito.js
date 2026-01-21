const crypto = require('crypto');

const generateSecretHash = (username, clientId, clientSecret) => {
  const message = username + clientId;
  const hmac = crypto.createHmac('SHA256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
};

module.exports = { generateSecretHash };