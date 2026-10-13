# Index Language API

REST API that provides English (EN) and Spanish (ES) translations for the **Index** Discord bot.

> **Important**: This project is the standalone Language API only.  
> The Discord bot itself is developed in a separate environment and will consume this API later.  
> No Discord bot code, slash commands, or Discord authentication is included here.

## Features

- Two supported languages: **EN** (default) and **ES**
- Predefined translation catalogs stored in local JSON files
- Catalogs loaded into memory at startup (no disk reads per request)
- Consistent JSON responses
- Rate limiting, configurable CORS, centralized error handling
- Ready for deployment on Render (or any Node.js host)

## Tech Stack

- Node.js ≥ 18
- Express
- dotenv
- cors
- express-rate-limit

## Project Structure

```
index-language-api/
├── package.json
├── server.js                 # Entry point
├── .env.example
├── .gitignore
├── README.md
├── locales/
│   ├── EN.json               # English translations
│   └── ES.json               # Spanish translations
└── src/
    ├── app.js                # Express app setup
    ├── routes/
    │   ├── index.js          # /, /health
    │   └── languages.js      # /languages/*
    ├── services/
    │   └── language.service.js
    └── middleware/
        └── error-handler.js
```

## Endpoints

| Method | Path                        | Description                                      |
|--------|-----------------------------|--------------------------------------------------|
| GET    | `/`                         | API information                                  |
| GET    | `/health`                   | Health check                                     |
| GET    | `/languages`                | List supported languages + default               |
| GET    | `/languages/:lang`          | Full catalog (`EN` or `ES`)                      |
| GET    | `/languages/:lang/:key`     | Single translation (e.g. `errors.no_permission`) |

### Example responses

**GET /languages**
```json
{
  "success": true,
  "defaultLanguage": "EN",
  "languages": [
    { "code": "EN", "name": "English" },
    { "code": "ES", "name": "Español" }
  ]
}
```

**GET /languages/ES/errors.no_permission**
```json
{
  "success": true,
  "language": "ES",
  "key": "errors.no_permission",
  "text": "No tienes permisos para utilizar este comando."
}
```

### Error cases

- Unsupported language → `400`
- Invalid key format → `400`
- Key not found → `404`
- Unknown route → `404`
- Server error → `500`

## Local Development (Acode / Terminal)

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the server
npm start
```

Server will listen on the port defined in `.env` (default `3000`).

### Quick tests with curl

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/languages
curl http://localhost:3000/languages/EN
curl http://localhost:3000/languages/ES/errors.no_permission
curl http://localhost:3000/languages/FR          # should return 400
curl http://localhost:3000/languages/EN/foo.bar  # should return 404
```

## Environment Variables

| Variable               | Default     | Description                          |
|------------------------|-------------|--------------------------------------|
| `PORT`                 | `3000`      | Server port                          |
| `NODE_ENV`             | -           | `production` / `development`         |
| `CORS_ORIGIN`          | `*`         | Allowed origins (comma-separated)    |
| `RATE_LIMIT_WINDOW_MS` | `900000`    | Rate-limit window (ms)               |
| `RATE_LIMIT_MAX`       | `100`       | Max requests per window              |

## Deployment on Render

1. Push the repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect the GitHub repo.
4. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free tier is fine for this API
5. Add environment variables if you want to override defaults (optional).
6. Deploy. Render will give you a public URL, e.g. `https://index-language-api.onrender.com`.

Use that public URL from the Index Discord bot later.

## Future Integration Notes

The bot will:

1. Call `GET /languages` to discover available languages.
2. Call `GET /languages/EN` or `GET /languages/ES` to load full catalogs (or cache them).
3. Call `GET /languages/:lang/:key` for individual strings.
4. Store each Discord server’s preferred language in its **own** database.
5. Fall back to `EN` when a server has no preference set.

This API never stores server language preferences.

## License

MIT
