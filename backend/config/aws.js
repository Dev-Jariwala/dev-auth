// /config/aws.js
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { RekognitionClient } from '@aws-sdk/client-rekognition';

// s3 client configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

// SES client configuration
const sesClient = new SESClient({
    region: process.env.AWS_SES_REGION,
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY
    }
});

// Rekognition client configuration
const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_REKOGNITION_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_REKOGNITION_SECRET_ACCESS_KEY
    },
});

export { s3Client, sesClient, rekognitionClient };