-- User Table
CREATE TABLE users (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    user_id VARCHAR(255),
    last_seen TIMESTAMPTZ,
);

-- AI Providers Table
CREATE TABLE ai_providers (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(unique_id),
    updated_by UUID REFERENCES users(unique_id),

    name VARCHAR(255) NOT NULL UNIQUE, -- OpenAI, Google, Anthropic, etc.
    api_key VARCHAR(255), -- Store the API Key for the company
);

-- AI Models Table
CREATE TABLE ai_models (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(unique_id),
    updated_by UUID REFERENCES users(unique_id),

    model_name VARCHAR(255) NOT NULL, -- GPT-4o, o1, GPT-4o mini, Gemini 2.0 Flash, etc.
    model_identifier VARCHAR(255) NOT NULL UNIQUE, -- gpt-4o, gpt-4o-mini, gemini-2.0-flash, etc.
    provider_id UUID REFERENCES ai_providers(unique_id),
    description TEXT, 
    context_length INT, -- Number of tokens in the context
    max_tokens INT, -- Maximum tokens to generate
    temperature NUMERIC(3, 2) DEFAULT 0.7, -- Sampling temperature
    status BOOLEAN DEFAULT TRUE, -- Active or Inactive

    CONSTRAINT model_name_identifier UNIQUE (model_name, model_identifier),
);

-- AI Chat Table
CREATE TABLE ai_chat (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(unique_id),
    updated_by UUID REFERENCES users(unique_id),

    user_id UUID REFERENCES users(unique_id),
    chat_name VARCHAR(255) NOT NULL DEFAULT 'New Chat',
);

-- AI Chat Messages Table
CREATE TABLE ai_chat_messages (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(unique_id),

    chat_id UUID REFERENCES ai_chat(unique_id),
    model_id UUID REFERENCES ai_models(unique_id),
    message TEXT NOT NULL,
    tokens_used INT, -- Number of tokens used to generate the message
);

-- AI Chat Media Table
CREATE TABLE ai_message_media (
    sr_no SERIAL PRIMARY KEY,
    unique_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(unique_id),

    message_id UUID REFERENCES ai_chat_messages(unique_id),
    media_path VARCHAR(255),
    media_type VARCHAR(50),
    media_size INT,
);