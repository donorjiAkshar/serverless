const { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, GlobalSignOutCommand, AdminConfirmSignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { generateSecretHash } = require('../utils/cognito');

// Configure AWS SDK client
const client = new CognitoIdentityProviderClient({ 
  region: 'eu-north-1',
  logger: console
});

// Helper function to generate auth parameters
const getAuthParams = (username, clientId, clientSecret) => {
  const params = {
    USERNAME: username,
    PASSWORD: '',
  };
  
  if (clientSecret) {
    params.SECRET_HASH = generateSecretHash(username, clientId, clientSecret);
  }
  
  return params;
};

// Helper function to create API response
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

// Main handler function
exports.handler = async (event) => {
  const { action } = event.pathParameters || {};
  const body = JSON.parse(event.body || '{}');
  const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
  const clientSecret = process.env.COGNITO_USER_POOL_CLIENT_SECRET;

  try {
    // Input validation
    if (!clientId || !clientSecret) {
      throw new Error('Server configuration error');
    }

    switch (action) {
      case 'signup':
        console.log('Signup attempt for user:', body.email);

        if (!body.email || !body.password) {
          return createResponse(400, { error: 'Email and password are required' });
        }
        
        const signUpParams = {
          ClientId: clientId,
          Username: body.email,
          Password: body.password,
          SecretHash: generateSecretHash(body.email, clientId, clientSecret),
          UserAttributes: [
            { Name: 'email', Value: body.email },
            { Name: 'name', Value: body.name || body.email.split('@')[0] }
            // email_verified is managed by Cognito and should not be set manually
          ]
        };
        
        console.log('Signup params:', JSON.stringify({
          ...signUpParams,
          Password: '***',
          SecretHash: '***'
        }, null, 2));
        
        const signUpCommand = new SignUpCommand(signUpParams);
        const signUpResponse = await client.send(signUpCommand);
        
        // In the signup case, after signup is successful:
        console.log('Signup successful, response:', signUpResponse);

        // In development, auto-confirm the user if needed
        if (process.env.IS_OFFLINE || process.env.NODE_ENV === 'development') {
          try {
            const userPoolId = process.env.COGNITO_USER_POOL_ID;
            if (!userPoolId) {
              throw new Error('COGNITO_USER_POOL_ID is not set in environment variables');
            }

            console.log('Attempting to auto-confirm user with pool ID:', userPoolId);
            
            const adminConfirmCommand = new AdminConfirmSignUpCommand({
              UserPoolId: userPoolId,
              Username: body.email
            });

            console.log('Sending AdminConfirmSignUpCommand with params:', {
              UserPoolId: userPoolId,
              Username: body.email
            });

            const confirmResponse = await client.send(adminConfirmCommand);
            console.log('Admin confirm response:', confirmResponse);
            console.log('User confirmed successfully');
          } catch (confirmError) {
            console.error('Error in admin confirm:', {
              name: confirmError.name,
              message: confirmError.message,
              stack: confirmError.stack,
              code: confirmError.code,
              time: new Date().toISOString()
            });
            throw confirmError; // Re-throw to see the full error in logs
          }
        }
        
        return createResponse(200, { 
          success: true, 
          message: 'User registered successfully',
          user: {
            email: body.email,
            name: body.name || body.email.split('@')[0],
            confirmed: (process.env.IS_OFFLINE || process.env.NODE_ENV === 'development')
          }
        });

      case 'login':
        if (!body.email || !body.password) {
          return createResponse(400, { error: 'Email and password are required' });
        }
        
        const authParams = getAuthParams(body.email, clientId, clientSecret);
        authParams.PASSWORD = body.password;
        
        const authCommand = new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: clientId,
          AuthParameters: authParams
        });
        
        const authResult = await client.send(authCommand);
        
        if (!authResult.AuthenticationResult) {
          return createResponse(401, { error: 'Authentication failed: Invalid credentials' });
        }

        return createResponse(200, {
          success: true,
          accessToken: authResult.AuthenticationResult.AccessToken,
          idToken: authResult.AuthenticationResult.IdToken,
          refreshToken: authResult.AuthenticationResult.RefreshToken,
          expiresIn: authResult.AuthenticationResult.ExpiresIn,
          tokenType: authResult.AuthenticationResult.TokenType
        });

      case 'logout':
        if (!event.headers?.authorization || !event.headers.authorization.startsWith('Bearer ')) {
          return createResponse(401, { error: 'Missing or invalid authorization token' });
        }
        
        const accessToken = event.headers.authorization.replace('Bearer ', '');
        console.log("🚀 ~ auth.js ~ accessToken:", accessToken);
        
        const signOutCommand = new GlobalSignOutCommand({
          AccessToken: accessToken
        });
        
        await client.send(signOutCommand);
        
        return createResponse(200, { 
          success: true, 
          message: 'Successfully logged out' 
        });

      default:
        return createResponse(400, { 
          success: false, 
          message: 'Invalid action. Valid actions are: signup, login, logout' 
        });
    }
  } catch (error) {
    console.error('Auth error:', error);
    
    // Handle specific Cognito errors
    let errorMessage = error.message;
    let statusCode = 400;
    
    if (error.name === 'UsernameExistsException') {
      errorMessage = 'User with this email already exists';
    } else if (error.name === 'NotAuthorizedException') {
      errorMessage = 'Incorrect username or password';
      statusCode = 401;
    } else if (error.name === 'UserNotConfirmedException') {
      errorMessage = 'Please confirm your email before logging in';
      statusCode = 403;
    } else if (error.name === 'UserNotFoundException') {
      errorMessage = 'User not found';
      statusCode = 404;
    }
    
    return createResponse(statusCode, { 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.name : undefined
    });
  }
};