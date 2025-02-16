import minioClient from '../../config/minio.js';
import { PassThrough } from 'stream';

// Create a bucket
export const createBucket = async (bucketName) => {
    try {
        const bucketExists = await minioClient.bucketExists(bucketName)
        if (!bucketExists) {
            await minioClient.makeBucket(bucketName);
            console.log('Bucket created successfully.')
        }
    }
    catch (e) {
        console.log(e)
    }
}

// list all buckets
export const listBuckets = async () => {
    try {
        const buckets = await minioClient.listBuckets()
        console.log("list of buckets: ", buckets)
        return buckets
    }
    catch (e) {
        console.log(e)
    }
}

// remove a bucket
export const removeBucket = async (bucketName) => {
    try {
        await minioClient.removeBucket(bucketName)
        console.log('Bucket removed successfully.')
    }
    catch (e) {
        console.log(e)
    }
}

// list all objects in a bucket
export const listObjects = async (bucketName, prefix = '') => {
    try {
        return new Promise((resolve, reject) => {
            const objects = [];
            const stream = minioClient.listObjectsV2(bucketName, prefix, true);
            stream.on('data', function (obj) {
                objects.push(obj);
            });
            stream.on('end', function () {
                resolve(objects);
            });
            stream.on('error', function (err) {
                reject(err);
            });
        });
    }
    catch (e) {
        console.log(e)
        throw e;
    }
}

// get object
export const getObject = async (bucketName, key) => {
    try {
        return await minioClient.getObject(bucketName, key);
    } catch (e) {
        console.log("Error in getObject: ", e);
        throw e;
    }
}

// upload an object to a bucket
export const uploadObject = async (bucketName, key, file, mimetype) => {
    try {
        const fileStream = new PassThrough();
        fileStream.push(file);
        fileStream.end();

        const metaData = {
            'Content-Type': mimetype
        }

        const upload = await minioClient.putObject(bucketName, key, fileStream, file.length, metaData)
        return upload;
    }
    catch (e) {
        console.log("Error in uploadObject: ", e)
        throw e;
    }
}

// get signed url for downloading
export const generateSignedUrl = async (bucketName, key, expiresIn = 24 * 60 * 60) => {
    try {
        const url = await minioClient.presignedGetObject(bucketName, key, expiresIn)
        return url;
    }
    catch (e) {
        console.log("Error in generateSignedUrl: ", e)
        throw e;
    }
}

// get signed url for uploading
export const generateUploadSignedUrl = async (bucketName, key, expiresIn = 24 * 60 * 60) => {
    try {
        const url = await minioClient.presignedPutObject(bucketName, key, expiresIn);
        return url;
    } catch (e) {
        console.log("Error in generateUploadSignedUrl: ", e)
        throw e;
    }
}

// delete an object
export const deleteObject = async (bucketName, key) => {
    try {
        await minioClient.removeObject(bucketName, key)
        return true;
    }
    catch (e) {
        console.log("Error in deleteObject: ", e)
        throw e;
    }
}

async function emptyBucket(bucketName) {
    try {
        const objects = await listObjects(bucketName);
        console.log('Objects in bucket:', objects);
        for (const object of objects) {
            await deleteObject(bucketName, object.name);
        }
        console.log('Bucket is now empty.');
    } catch (error) {
        console.log("Error in emptyBucket: ", error);
        throw error;
    }
}