const { sns } = require('../utils/awsClients');

const TOPIC_ARN = 'arn:aws:sns:eu-north-1:236262668532:MySNSTopic';

// Subscribe an email to the SNS topic
exports.subscribe = async (event) => {
  try {
    const { email } = JSON.parse(event.body);
    
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Email is required'
        })
      };
    }

    // Check if email is already subscribed
    const { Subscriptions } = await sns.listSubscriptionsByTopic({ TopicArn: TOPIC_ARN }).promise();
    const existingSubscription = Subscriptions.find(
      sub => sub.Protocol === 'email' && sub.Endpoint.toLowerCase() === email.toLowerCase()
    );

    if (existingSubscription) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Email is already subscribed',
          subscriptionArn: existingSubscription.SubscriptionArn
        })
      };
    }

    // Subscribe the email
    const params = {
      Protocol: 'email',
      TopicArn: TOPIC_ARN,
      ReturnSubscriptionArn: true,
      Endpoint: email
    };

    const { SubscriptionArn } = await sns.subscribe(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Subscription request sent. Please check your email to confirm.',
        subscriptionArn: SubscriptionArn
      })
    };
  } catch (error) {
    console.error('Error subscribing email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to subscribe email',
        details: error.message
      })
    };
  }
};

// List all email subscribers
exports.listSubscribers = async () => {
  try {
    const { Subscriptions } = await sns.listSubscriptionsByTopic({ TopicArn: TOPIC_ARN }).promise();
    
    const emailSubscriptions = Subscriptions
      .filter(sub => sub.Protocol === 'email')
      .map(sub => ({
        endpoint: sub.Endpoint,
        subscriptionArn: sub.SubscriptionArn,
        status: sub.SubscriptionArn === 'PendingConfirmation' ? 'pending' : 'confirmed'
      }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        subscribers: emailSubscriptions,
        count: emailSubscriptions.length
      })
    };
  } catch (error) {
    console.error('Error listing subscribers:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch subscribers',
        details: error.message
      })
    };
  }
};

// Unsubscribe an email
exports.unsubscribe = async (event) => {
  try {
    const { subscriptionArn } = JSON.parse(event.body);
    
    if (!subscriptionArn) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Subscription ARN is required'
        })
      };
    }

    await sns.unsubscribe({ SubscriptionArn: subscriptionArn }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Successfully unsubscribed'
      })
    };
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to unsubscribe',
        details: error.message
      })
    };
  }
};
