import * as s3Service from '../aws/s3.service.js';
import * as minioService from '../minio/minio.service.js';

const storageProvider = process.env.STORAGE_PROVIDER || 'minio';

const getStorageService = () => {
    switch (storageProvider.toLowerCase()) {
        case 's3':
            return s3Service;
        case 'minio':
            return minioService;
        default:
            throw new Error(`Unsupported storage provider: ${storageProvider}`);
    }
};

const storageService = getStorageService();

export const listObjects = (bucketName, prefix) =>
    storageService.listObjects(bucketName, prefix);

export const getObject = (bucketName, key) =>
    storageService.getObject(bucketName, key);

export const uploadObject = (bucketName, key, body, mimetype) =>
    storageService.uploadObject(bucketName, key, body, mimetype);

export const generateSignedUrl = (bucketName, key, expiresIn) =>
    storageService.generateSignedUrl(bucketName, key, expiresIn);

export const generateUploadSignedUrl = (bucketName, key, expiresIn) =>
    storageService.generateUploadSignedUrl(bucketName, key, expiresIn);

export const deleteObject = (bucketName, key) =>
    storageService.deleteObject(bucketName, key);
