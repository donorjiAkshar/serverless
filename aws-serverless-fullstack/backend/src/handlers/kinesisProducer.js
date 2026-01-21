// In /backend/src/handlers/kinesisProducer.js
const { kinesis } = require('../utils/awsClients');

exports.handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body);
    
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false,
          error: 'Message is required' 
        })
      };
    }

    const params = {
      Data: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
        source: 'dashboard'
      }),
      PartitionKey: 'dashboard-events',
      StreamName: 'YourKinesisStreamName'
    };

    const response = await kinesis.putRecord(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Event sent to Kinesis',
        sequenceNumber: response.SequenceNumber,
        shardId: response.ShardId
      })
    };
  } catch (error) {
    console.error('Error sending to Kinesis:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send event to Kinesis',
        details: error.message
      })
    };
  }
};