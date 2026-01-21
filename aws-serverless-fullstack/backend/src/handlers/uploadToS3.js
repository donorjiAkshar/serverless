const { s3 } = require("../utils/awsClients");
const { v4: uuid } = require("uuid");

exports.handler = async (event) => {
  try {
    const contentType =
    event && event.headers
      ? event.headers["content-type"] || event.headers["Content-Type"]
      : undefined;

    let objectBody;

    if (contentType && contentType.includes("application/json")) {
      const parsed = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      objectBody = parsed && parsed.content;
    } else if (event && event.isBase64Encoded && typeof event.body === "string") {
      objectBody = Buffer.from(event.body, "base64");
    } else {
      objectBody = event.body;
    }

    if (objectBody === undefined || objectBody === null) {
      return { statusCode: 400, body: "Missing request body" };
    }
    const key = `${uuid()}.txt`;

    await s3.putObject({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: objectBody,
      ContentType: contentType || 'application/octet-stream'
    }).promise();

    return { statusCode: 200, body: JSON.stringify({ key }) };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
