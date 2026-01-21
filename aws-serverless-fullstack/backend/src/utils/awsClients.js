const AWS = require("aws-sdk");

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-north-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000 // 5 second timeout
  }
});

module.exports = {
  s3: new AWS.S3(),
  dynamo: new AWS.DynamoDB.DocumentClient(),
  sns: new AWS.SNS(),
  sqs: new AWS.SQS(),
  kinesis: new AWS.Kinesis(),
  eventBridge: new AWS.EventBridge()
};
