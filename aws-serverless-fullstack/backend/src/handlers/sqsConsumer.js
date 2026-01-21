const { SQS } = require('aws-sdk');

const sqs = new SQS({
  region: 'eu-north-1',
  endpoint: 'https://sqs.eu-north-1.amazonaws.com',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

exports.handler = async (event) => {
  console.log('SQS Event: ', JSON.stringify(event, null, 2));
  
  try {
    for (const record of event.Records) {
      let message;
      try {
        message = JSON.parse(record.body);
      } catch (e) {
        message = record.body;
      }
      console.log('Processing message:', message);
      // Your message processing logic here
    }
    return { statusCode: 200, body: 'Message processed' };
  } catch (error) {
    console.error('Error processing SQS message:', error);
    throw error;
  }
};