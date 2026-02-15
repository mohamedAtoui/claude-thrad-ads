# Claude with Thrad

An ad-supported AI chat application that gives users free access to Claude-level AI, funded by contextual ads from [Thrad](https://thrads.ai). Built with Next.js and Django, deployed on Vercel.

## How It Works

1. **User signs in** via email verification (6-digit code sent via Brevo)
2. **User chats** with an AI assistant — messages stream in real-time via SSE
3. **After each AI response**, a contextual ad is fetched from Thrad's SSP based on the conversation context
4. **Thrad pays Anthropic** for the AI usage — the user gets it for free

```
User  ──>  Next.js Frontend  ──>  Django API  ──>  OpenAI (GPT-4.1 Nano)
                                       │
                                       ├──>  Thrad SSP (contextual ads)
                                       ├──>  Vercel KV / Redis (storage)
                                       └──>  Brevo (email verification)
```

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend      | Django 4.2, Django REST Framework       |
| AI           | OpenAI API (GPT-4.1 Nano)              |
| Ads          | Thrad SSP API                           |
| Storage      | Vercel KV (Upstash Redis)               |
| Email        | Brevo (formerly Sendinblue)             |
| Deployment   | Vercel (frontend + backend)             |
| Icons        | lucide-react                            |

## Project Structure

```
claude-thrad-ads/
├── frontend/                       # Next.js app
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Home — new chat creation
│       │   ├── login/page.tsx      # Email verification login
│       │   ├── onboarding/page.tsx # Feature intro screen
│       │   └── chat/[id]/page.tsx  # Chat interface with streaming
│       ├── components/
│       │   ├── AdCard.tsx          # Sponsored ad display
│       │   ├── ChatInput.tsx       # Message input
│       │   ├── ChatMessage.tsx     # Message bubble (user/assistant)
│       │   ├── Sidebar.tsx         # Chat list navigation
│       │   └── ...
│       ├── context/
│       │   └── AuthContext.tsx     # Auth state (React Context)
│       └── lib/
│           ├── api.ts             # API client
│           ├── stream.ts          # SSE parser for streaming
│           ├── thrad.ts           # Ad fetching
│           └── auth.ts            # Cookie utilities
│
├── backend/                        # Django API
│   ├── config/
│   │   ├── settings.py            # Django config
│   │   └── urls.py                # Root URL router
│   ├── chat/
│   │   ├── views.py               # All API endpoints
│   │   ├── prompts.py             # System prompt
│   │   └── services/
│   │       ├── storage.py         # Redis/KV operations
│   │       ├── claude.py          # OpenAI streaming
│   │       ├── email.py           # Brevo email sending
│   │       ├── ads.py             # Thrad SSP integration
│   │       └── user_profile.py    # Interest tracking
│   ├── api/wsgi.py                # Vercel WSGI entry point
│   ├── requirements.txt
│   └── vercel.json
│
└── README.md
```

## API Endpoints

| Method | Endpoint                     | Description                  |
|--------|------------------------------|------------------------------|
| POST   | `/api/auth/send-code/`       | Send verification code email |
| POST   | `/api/auth/verify-code/`     | Verify code, get auth token  |
| GET    | `/api/chats/`                | List user's chats            |
| POST   | `/api/chats/`                | Create a new chat            |
| GET    | `/api/chats/<id>/`           | Get chat with messages       |
| POST   | `/api/chats/<id>/send/`      | Send message, stream response (SSE) |
| POST   | `/api/chats/<id>/feedback/`  | Submit like/dislike feedback  |
| POST   | `/api/chats/<id>/ads/`       | Fetch contextual ad          |

All authenticated endpoints require an `X-Auth-Token` header.

## Authentication Flow

1. User enters email on the login page
2. Backend generates a 6-digit code, stores it in Redis (10-min TTL), and sends it via Brevo
3. User enters the code in the 6-digit input (supports paste)
4. Backend verifies the code (max 5 attempts), creates a user if new, and returns a UUID auth token
5. Frontend stores the token in cookies (30-day expiry)
6. All subsequent API calls include the token via `X-Auth-Token` header

## Ad Integration

After each AI response completes streaming, the frontend requests a contextual ad:

1. Frontend sends the turn number to `POST /api/chats/<id>/ads/`
2. Backend calls Thrad SSP with the conversation context and an anonymized user ID
3. Thrad returns a relevant ad (advertiser, headline, description, CTA, link)
4. The ad is displayed as a card below the assistant's message
5. If the Thrad API is unavailable, a mock ad is shown as fallback

## Environment Variables

### Backend (`backend/.env`)

```
SECRET_KEY=<django-secret-key>
DEBUG=False
OPENAI_API_KEY=<openai-api-key>
BREVO_API_KEY=<brevo-api-key>
EMAIL_FROM_ADDRESS=<sender-email>
THRAD_API_KEY=<thrad-ssp-api-key>
THRAD_API_KEY_FALLBACK=<thrad-fallback-key>
KV_REST_API_URL=<vercel-kv-url>
KV_REST_API_TOKEN=<vercel-kv-token>
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Deployment

Both frontend and backend deploy to **Vercel** on push to `main`.

- **Frontend**: Auto-detected as a Next.js project
- **Backend**: Uses `vercel.json` to route all requests through `api/wsgi.py` (Django WSGI)

## Data Storage

All data lives in **Vercel KV (Upstash Redis)** — no traditional database required.

| Key Pattern              | Data                           | TTL     |
|--------------------------|--------------------------------|---------|
| `verify:{email_hash}`   | Verification code + attempts   | 10 min  |
| `users:{email_hash}`    | User profile + auth token      | None    |
| `tokens:{token}`        | Email hash (auth index)        | None    |
| `chats:{chat_id}`       | Chat object with messages      | None    |
| `user_chats:{email_hash}` | Set of chat IDs              | None    |
| `profiles:{email_hash}` | User interest analytics        | None    |
