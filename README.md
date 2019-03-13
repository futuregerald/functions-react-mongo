This project shows how to use Lambda functions to get a presigned S3 URL, as well as connect and add data to a MongoDB server. The base app is a simple React project used to send data to the functions, update the image file, and display the changed Data.

The functions are in /src/lambda and below are short descriptions on what they do:

## get-upload-url.js

This function uses the Amazon S3 SDK to get a presigned URL that's valid for 5 minutes. This URL is returned to the frontend along with the public CloudFront URL for the file. The presigned URL is generated with a key that's a combination of a UUIDv4 + filename to provide unique URL's for each file, even if they have the same file-name.

## post-user-details.js

This function takes a JSON payload from the frontend and uses it to update or create documents in MongoDB.

## get-user-details.js

This function takes a JSON payload that includes the user's Identity ID and uses it to find the document containing that user's details, then return it to the frontend client

## Demo site:

https://lambda-profile-demo.netlify.com/
