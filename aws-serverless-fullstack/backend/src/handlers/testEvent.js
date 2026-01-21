const { kinesis } = require("../utils/awsClients");

// In /backend/src/handlers/testEvent.js
exports.handler = async (event) => {
  try {
    const eventData = {
      message: 'Test event from dashboard',
      timestamp: new Date().toISOString(),
      source: 'test-event'
    };

    // Send to Kinesis
    await kinesis.putRecord({
      Data: JSON.stringify(eventData),
      PartitionKey: 'test-events',
      StreamName: 'AppKinesisStream'
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Test event sent to Kinesis',
        data: eventData
      })
    };
  } catch (error) {
    console.error('Error in test event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process test event'
      })
    };
  }
};