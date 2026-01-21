const { sns } = require("../utils/awsClients");

exports.handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    const topicArn = 'arn:aws:sns:eu-north-1:236262668532:MySNSTopic';
    
    // Set a timeout for the SNS publish operation
    const publishPromise = sns.publish({
      TopicArn: topicArn,
      Message: message,
      MessageAttributes: {
        'email': {
          DataType: 'String',
          StringValue: 'true'
        }
      }
    }).promise();
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SNS publish timed out')), 5000); // 5 second timeout
    });
    const response = await Promise.race([publishPromise, timeoutPromise]);
    
    console.log('Message published successfully:', response.MessageId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Message published to SNS',
        messageId: response.MessageId
      })
    };
  } catch (error) {
    console.error('Error in SNS publisher:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process request',
        details: error.message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      })
    };
  }
};