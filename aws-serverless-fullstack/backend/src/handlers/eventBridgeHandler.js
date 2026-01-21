exports.handler = async (event) => {
  console.log("EventBridge Event:", typeof event === "string" ? event : JSON.stringify(event));
  
  if (event.httpMethod || event.requestContext?.http?.method) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Event processed" }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
  
  return { processed: true };
};