const { dynamo } = require("../utils/awsClients");
const { v4: uuid } = require("uuid");

exports.handler = async (event) => {
  console.log("🚀 ~ dynamoHandler.js:5 ~ event:", event.body);
  try {
    const user = JSON.parse(event.body);
    console.log("🚀 ~ dynamoHandler.js:7 ~ user:", user);
    
    if (!user.email) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: false,
          message: 'Email is required' 
        })
      };
    }

    // Check if user with this email already exists
    const existingUser = await dynamo.query({
      TableName: 'UsersTable',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': user.email
      },
      Limit: 1
    }).promise();

    // If user exists, return success with existing user info
    if (existingUser.Items && existingUser.Items.length > 0) {
      const existingUserData = existingUser.Items[0];
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: true,
          message: 'User already exists',
          user: {
            userId: existingUserData.userId,
            email: existingUserData.email,
            name: existingUserData.name,
            cognitoSub: existingUserData.cognitoSub
          }
        })
      };
    }

    // If user doesn't exist, create new user
    const userId = uuid();
    const newUser = {
      userId,
      email: user.email,
      name: user.name || user.email.split('@')[0], // Default name to part before @ if not provided
      cognitoSub: user.cognitoSub || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamo.put({
      TableName: 'UsersTable',
      Item: newUser
    }).promise();

    return { 
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true,
        message: 'User created successfully',
        user: {
          userId,
          email: newUser.email,
          name: newUser.name,
          cognitoSub: newUser.cognitoSub
        }
      }) 
    };
  } catch (error) {
    console.error('Error in dynamoHandler:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        message: 'Internal server error',
        error: error.message 
      })
    };
  }
};