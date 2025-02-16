import { deleteObject, generateSignedUrl, generateUploadSignedUrl } from "../services/storage/index.js";

const bucketName = process.env.STORAGE_PROVIDER === 's3' ? process.env.AWS_BUCKET_NAME : process.env.MINIO_BUCKET_NAME;

export const getSignedUrl = async (req, res) => {
    try {
        const { filePath } = req.query;
        const signedUrl = await generateSignedUrl(bucketName, filePath);
        res.status(200).json({ message: 'Fetched successfully', signedUrl });
    } catch (error) {
        console.log("getSignedUrl catch = ", error);
        res.status(500).json({ message: "Something went wrong from the database", error: error?.message });
    }
}

export const getSignedUrlUseingBodyPath = async (req, res) => {
    try {
        const { filePath } = req.body;
        const signedUrl = await generateSignedUrl(bucketName, filePath, 120);

        res.status(200).json({ message: 'Fetched successfully', signedUrl });
    } catch (error) {
        console.log("getSignedUrl catch = ", error);
        res.status(500).json({ message: "Something went wrong from the database", error: error?.message });
    }
}

export const getSignedUrlForUpload = async (req, res) => {
    try {
        const { filePath } = req.body;
        console.log("filePath", filePath)
        const signedUrl = await generateUploadSignedUrl(bucketName, filePath, 120);
        res.status(200).json({ message: 'Fetched successfully', signedUrl });
    } catch (error) {
        console.log("getSignedUrlForUpload catch = ", error);
        res.status(500).json({ message: "Something went wrong from the database", error: error?.message });
    }
}

export const deleteFile = async (req, res) => {
    try {
        const { filePath } = req.body;
        await deleteObject(bucketName, filePath);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        console.log("deleteFile catch = ", error);
        res.status(500).json({ message: "Something went wrong from the database", error: error?.message });
    }
}