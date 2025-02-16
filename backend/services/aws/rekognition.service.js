import { ListCollectionsCommand, CreateCollectionCommand, IndexFacesCommand, SearchFacesByImageCommand, DeleteCollectionCommand, ListFacesCommand, DeleteFacesCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from '../../config/aws.js';

export const listCollections = async () => {
    const command = new ListCollectionsCommand({});
    const response = await rekognitionClient.send(command);
    return response;
}

export const createCollection = async (collectionId) => {
    const command = new CreateCollectionCommand({
        CollectionId: collectionId,
    });
    const response = await rekognitionClient.send(command);
    return response;
}

export const indexFaces = async (collectionId, bucketName, key, externalImageId) => {
    const command = new IndexFacesCommand({
        CollectionId: collectionId,
        Image: {
            S3Object: {
                Bucket: bucketName,
                Name: key,
            }
        },
        ExternalImageId: externalImageId,
    });
    const response = await rekognitionClient.send(command);
    return response;
}

export const searchFacesByImage = async (collectionId, bucketName, key) => {
    console.log(collectionId, bucketName, key)
    const command = new SearchFacesByImageCommand({
        CollectionId: collectionId,
        Image: {
            S3Object: {
                Bucket: bucketName,
                Name: key
            }
        },
        MaxFaces: 1,
        FaceMatchThreshold: 95
    });
    const response = await rekognitionClient.send(command);
    // console.log(response)
    return response;
}

export const deleteCollection = async (collectionId) => {
    const command = new DeleteCollectionCommand({
        CollectionId: collectionId,
    });
    const response = await rekognitionClient.send(command);
    return response;
}

export const deleteFaces = async (collectionId, faceIds) => {
    const command = new DeleteFacesCommand({
        CollectionId: collectionId,
        FaceIds: faceIds,
    });
    const response = await rekognitionClient.send(command);
    return response;
}

export const listFaces = async (collectionId) => {
    const command = new ListFacesCommand({
        CollectionId: collectionId,
    });
    const response = await rekognitionClient.send(command);
    return response;
}