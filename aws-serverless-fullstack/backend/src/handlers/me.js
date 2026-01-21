const { CognitoIdentityProviderClient, GetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({ region: 'eu-north-1' });

exports.handler = async (event) => {
  try {
    console.log("🚀 ~ me.js:8 ~ event.headers:", event.headers);
    const token = event.headers.authorization.replace('Bearer ', '');
    const command = new GetUserCommand({ AccessToken: token });
    const user = await client.send(command);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        username: user.Username,
        attributes: user.UserAttributes.reduce((acc, attr) => {
          acc[attr.Name] = attr.Value;
          return acc;
        }, {})
      })
    };
  } catch (error) {
    console.error('Get user error:', error);
    return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
  }
};