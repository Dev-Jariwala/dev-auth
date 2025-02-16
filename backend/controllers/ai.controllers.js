import { openai } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, generateId } from 'ai';
import { generateSignedUrl, getObject } from "../services/storage/index.js";

const STORAGE_BUCKET = process.env.STORAGE_PROVIDER === 's3'
    ? process.env.AWS_BUCKET_NAME
    : process.env.MINIO_BUCKET_NAME;

const AI_PROVIDERS = {
    google: createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY }),
    anthropic: createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
};

const DEFAULT_MODELS = {
    google: 'gemini-2.0-flash-001',
    openai: 'gpt-4',
    anthropic: 'claude-3-5-sonnet-latest'
};

/* 
-- Table for users
CREATE TABLE auth_users(
    sr_no SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- AI Chat Table
CREATE TABLE ai_chat (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth_users(user_id),
    updated_by UUID REFERENCES auth_users(user_id),
    user_id UUID REFERENCES auth_users(user_id),
    chat_name VARCHAR(255) NOT NULL DEFAULT 'New Chat'
);

-- AI Chat Messages Table
CREATE TABLE ai_chat_messages (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth_users(user_id),
    chat_id UUID REFERENCES ai_chat(unique_id),
    message TEXT NOT NULL,
    tokens_used INT
);

-- AI Chat Media Table
CREATE TABLE ai_message_media (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth_users(user_id),
    message_id UUID REFERENCES ai_chat_messages(unique_id),
    media_path VARCHAR(255),
    media_type VARCHAR(50),
    media_size INT
); */

/**
 * Formats conversation messages with proper structure
 * @param {Array} messages - Array of conversation messages
 * @returns {Array} Formatted messages array
 */
const formatConversationHistory = (messages = []) => [
    { id: generateId(), role: 'system', content: 'Hey you are assistant for Dev Auth. Mr Dev Jariwala developed you in react and node js.' },
    { id: generateId(), role: 'system', content: 'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.' },
    ...messages.map(msg => ({ id: msg.id || generateId(), role: msg.role, content: [{ type: 'text', text: msg.content }] }))
];

/**
 * Reads file content from storage
 * @param {string} key - File key in storage
 * @returns {Promise<Buffer>} File content buffer
 */
async function readFileContent(key) {
    const fileStream = await getObject(STORAGE_BUCKET, key);
    const chunks = [];
    for await (const chunk of fileStream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

/**
 * Processes a single file and returns its prompt content
 * @param {Object} fileMetadata - File metadata object
 * @returns {Promise<Array>} Array of prompt parts
 */
async function processFile(fileMetadata) {
    const { mimetype, key, filename } = fileMetadata;

    if (mimetype.startsWith('image/')) {
        const imageUrl = await generateSignedUrl(STORAGE_BUCKET, key);
        return [
            { type: 'text', text: `User has provided image file: ${filename}` },
            { type: 'image', image: imageUrl }
        ];
    }

    const fileBuffer = await readFileContent(key);

    if (mimetype.startsWith('application/')) {
        return [
            { type: 'text', text: `User uploaded pdf file: ${filename}` },
            { type: 'file', data: fileBuffer, mimeType: mimetype }
        ];
    }

    const textContent = new TextDecoder().decode(new Uint8Array(fileBuffer));
    return [{ type: 'text', text: `User has uploaded text file: ${filename}:\nContent:\n${textContent}` }];
}

/**
 * Creates a prompt including file content
 * @param {Array} filesMetadata - Array of file metadata
 * @param {string} userMessage - User's message
 * @returns {Promise<Array>} Combined prompt array
 */
async function createEnhancedPrompt(filesMetadata, userMessage) {
    let promptParts = [];

    if (filesMetadata?.length) {
        try {
            const filePrompts = await Promise.all(
                filesMetadata.map(processFile)
            );
            promptParts = filePrompts.flat();
        } catch (error) {
            console.error("File processing error:", error);
            promptParts.push({
                type: 'text',
                text: "Error occurred while processing uploaded files."
            });
        }
    }

    return userMessage ? [{ type: 'text', text: userMessage }, ...promptParts] : promptParts;
}

/**
 * Handles AI response generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function generateAIResponse(req, res) {
    try {
        const { provider = "google", messages = [], model: requestedModel, filesMetadata, conversationId, messageId } = req.body;

        const modelName = requestedModel || DEFAULT_MODELS[provider];
        const latestUserMessage = messages[messages.length - 1]?.content;

        console.log('conversationId', conversationId);
        console.log('messageId', messageId);

        const enhancedPrompt = await createEnhancedPrompt(filesMetadata, latestUserMessage);

        const conversationHistory = [...formatConversationHistory(messages?.slice(0, -1)), { id: generateId(), role: 'user', content: enhancedPrompt }];

        const aiModel = AI_PROVIDERS[provider]?.(modelName) || openai(modelName);

        const { textStream } = streamText({ model: aiModel, messages: conversationHistory, temperature: 0.7 });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of textStream) {
            res.write(chunk);
        }
        res.end();
    } catch (error) {
        console.error("AI Response Generation Error:", error);
        res.status(500).json({ error: error.message, details: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
}