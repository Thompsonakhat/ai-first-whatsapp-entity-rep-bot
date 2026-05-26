# WhatsApp Brain Bot

This is a Node.js ES module brain service for CookMyBots managed WhatsApp transport.

CookMyBots handles WhatsApp pairing, sessions, routing, and delivery. This project does not implement WhatsApp Cloud API webhooks and does not use WhatsApp provider tokens.

The service exposes:

POST /webhook/cookmybots/whatsapp

It verifies X-CookMyBots-Webhook-Secret with CMB_WHATSAPP_WEBHOOK_SECRET, accepts the managed WhatsApp payload, calls CookMyBots AI Gateway, and returns:

{ "ok": true, "reply": "..." }

## What the bot does

The bot is an AI-first WhatsApp entity representative. It represents only what the owner describes in OWNER_KNOWLEDGE.

OWNER_KNOWLEDGE is the factual source of truth. If a user asks about a missing detail, the bot must say the owner has not provided that detail yet and avoid guessing.

The bot does not contain hard-coded products, prices, contacts, rules, FAQs, policies, support flows, sales flows, moderation flows, or onboarding flows.

## Public capabilities

There are no slash commands. Users interact by sending natural WhatsApp messages.

1) Natural questions
Usage: Send a normal WhatsApp message.
Example: Who are you?
The bot answers from OWNER_KNOWLEDGE and explains when details are missing.

2) Follow-up conversation
Usage: Continue the chat naturally.
Example: Can you explain that more?
The bot uses concise recent memory when available.

3) Group-aware replies
Usage: CookMyBots routes a group or community message.
The bot keeps replies shorter and avoids spam. If CookMyBots indicates the bot should not respond, the service returns an empty reply.

## Environment variables

PORT
The HTTP listener port. Defaults to 3000.

CMB_WHATSAPP_WEBHOOK_SECRET
Secret used to verify X-CookMyBots-Webhook-Secret on managed WhatsApp webhook requests.

COOKMYBOTS_AI_ENDPOINT
CookMyBots AI Gateway base URL. Do not include /chat.

COOKMYBOTS_AI_KEY
CookMyBots AI Gateway key. Used only for Authorization: Bearer requests to the gateway.

MONGODB_URI
Optional MongoDB connection string for recent conversation memory. If missing or connection fails, the bot continues with bounded in-memory memory.

AI_TIMEOUT_MS
Optional AI request timeout. Defaults to 600000.

AI_MAX_RETRIES
Optional AI retry count. Defaults to 2.

CONCURRENCY
Optional global AI concurrency cap. Defaults to 20.

## Setup

1) Install dependencies:

npm install

2) Copy environment sample:

cp .env.sample .env

3) Fill in CookMyBots values in .env.

4) Run locally:

npm run dev

5) Start in production:

npm start

## Database

MongoDB is optional. When MONGODB_URI is provided, the bot stores recent conversation turns in the conversation_memory collection.

Indexes:

1) k ascending and updatedAt descending for recent memory lookup.
2) updatedAt descending for maintenance and debugging.

MongoDB write safety is enforced by storing createdAt only in $setOnInsert and updatedAt only in $set.

## AI Gateway

All AI replies go through CookMyBots AI Gateway:

POST {COOKMYBOTS_AI_ENDPOINT}/chat

The bot reads final chat text from response.output.content. It does not call OpenAI directly and does not use OPENAI_API_KEY.

## Deployment

Deploy as one Node.js service, for example on Render.

Build command:

npm run build

Start command:

npm start

Required deployment variables:

1) CMB_WHATSAPP_WEBHOOK_SECRET
2) COOKMYBOTS_AI_ENDPOINT
3) COOKMYBOTS_AI_KEY

Optional:

1) MONGODB_URI
2) PORT
3) AI_TIMEOUT_MS
4) AI_MAX_RETRIES
5) CONCURRENCY

## Troubleshooting

If webhook requests return unauthorized, check CMB_WHATSAPP_WEBHOOK_SECRET and the X-CookMyBots-Webhook-Secret header.

If replies say AI is not configured, check COOKMYBOTS_AI_ENDPOINT and COOKMYBOTS_AI_KEY.

If memory is not persistent, check MONGODB_URI. The bot continues running without MongoDB.

Logs print safe booleans only, such as whether keys are set. Secrets are never printed.
