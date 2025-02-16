import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PassThrough } from 'stream';
import { s3Client } from '../../config/aws.js';

export const listObjects = async (bucketName, prefix = '') => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            Delimiter: '/'
        });
        const response = await s3Client.send(command);
        return response.Contents || [];
    } catch (e) {
        console.log("Error in listObjects: ", e);
        throw e;
    }
}

export const getObject = async (bucketName, key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const response = await s3Client.send(command);
        return response;
    } catch (e) {
        console.log("Error in getObject: ", e);
        throw e;
    }
}

export const uploadObject = async (bucketName, key, body, mimetype) => {
    try {
        const stream = new PassThrough();
        stream.push(body);
        stream.end();

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: stream,
            ContentLength: stream.readableLength,
            ContentType: mimetype,
        });

        const response = await s3Client.send(command);
        return response;
    } catch (e) {
        console.log("Error in uploadObject: ", e)
        throw e;
    }
}

export const generateSignedUrl = async (bucketName, key, expiresIn = 3600) => {
    try {
        let commandOptions = {
            Bucket: bucketName,
            Key: key,
        };

        if (key.includes('chats/messages')) {
            const fullFileName = key.split('/')[key.split('/').length - 1];
            const fileName = fullFileName.substring(fullFileName.indexOf('_') + 1);
            commandOptions.ResponseContentDisposition = `attachment; filename="${encodeURIComponent(fileName)}"`;
        }

        const command = new GetObjectCommand(commandOptions);
        const signedUrl = await awsGetSignedUrl(s3Client, command, { expiresIn });
        return signedUrl;
    } catch (e) {
        console.log("Error in generateSignedUrl: ", e);
        throw e;
    }
}

export const generateUploadSignedUrl = async (bucketName, key, expiresIn = 3600) => {
    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const signedUrl = await awsGetSignedUrl(s3Client, command, { expiresIn });
        return signedUrl;
    } catch (e) {
        console.log("Error in generateUploadSignedUrl: ", e);
        throw e;
    }
}

export const deleteObject = async (bucketName, key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const response = await s3Client.send(command);
        return response;
    } catch (e) {
        console.log("Error in deleteObject: ", e);
        throw e;
    }
}
