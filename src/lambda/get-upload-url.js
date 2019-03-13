const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

exports.handler = function(event, context, callback) {
  const s3 = new AWS.S3({ signatureVersion: 'v4' });
  const body = JSON.parse(event.body);
  console.log(body);
  // getting secrets from environment. stored in Netlify
  const {
    DEPLOY_REGION,
    SECRET_ACCESS_KEY,
    ACCESS_KEY_ID,
    BUCKET,
  } = process.env;
  AWS.config.update({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: DEPLOY_REGION,
  });

  const key = `${uuidv4()}--${body.fileName}`;
  const bucket = BUCKET;
  const signedUrlExpireSeconds = 60 * 5;

  const url = s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: key,
    ContentType: body.type,
    Expires: signedUrlExpireSeconds,
  });
  const publicUrl = `https://d7p0c2qzpgwhi.cloudfront.net/${key}`

  console.log(url, key);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl: url, publicUrl: publicUrl }),
  });
};
