# LiveKit Self-Hosted Admin Dashboard

A production-ready admin dashboard for managing self-hosted LiveKit servers, built with Rust (backend) and Next.js (frontend).

## Environment Configuration

This project uses a single `.env` file that contains configurations for both development and production environments.

### Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **For Development (default):**
   ```bash
   # .env file should have:
   ENVIRONMENT=development
   # ... and uncomment the development section
   ```

3. **For Production:**
   ```bash
   # .env file should have:
   ENVIRONMENT=production
   # ... and uncomment the production section
   ```

4. **Start the services:**
   ```bash
   # Start LiveKit Core first
   cd ../livekit-core
   docker-compose up -d

   # Start the admin dashboard
   docker-compose up -d
   ```

### Environment Files

- **`.env.example`** - Template file with both dev and prod configs (safe to commit)
- **`.env`** - Your actual configuration (NEVER commit)

### Environment Selection

Set the `ENVIRONMENT` variable in your `.env` file:

- `ENVIRONMENT=development` - Uses localhost URLs, SQLite database, debug logging
- `ENVIRONMENT=production` - Uses production URLs, PostgreSQL database, secure settings

### Required Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `ENVIRONMENT` | `development` | `production` |
| `LIVEKIT_API_KEY` | Your dev API key | Your prod API key |
| `LIVEKIT_API_SECRET` | Your dev API secret | Your prod API secret |
| `JWT_SECRET` | Dev JWT secret | Secure 64+ char JWT secret |

### Configuration Sections

The `.env` file has two sections:

#### Development Section (ENVIRONMENT=development)
```bash
# Uncomment these lines for development
NODE_ENV=development
RUST_LOG=debug
LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=your_dev_key
LIVEKIT_API_SECRET=your_dev_secret
DATABASE_URL=sqlite://./livekit_admin.db
JWT_SECRET=dev_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

#### Production Section (ENVIRONMENT=production)
```bash
# Uncomment these lines for production
NODE_ENV=production
RUST_LOG=warn
LIVEKIT_URL=https://livekit.yourdomain.com
LIVEKIT_API_KEY=your_prod_key
LIVEKIT_API_SECRET=your_prod_secret
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=very_secure_64_char_jwt_secret
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.yourdomain.com
```

### Docker Deployment

The docker-compose.yml automatically loads the `.env` file. Simply set `ENVIRONMENT=production` in your `.env` file for production deployment.

```yaml
services:
  backend:
    env_file:
      - .env
    environment:
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      # ... other variables

  frontend:
    env_file:
      - .env
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      # ... other variables
```

### Security Notes

- **NEVER commit `.env` files** - They contain sensitive credentials
- **Use strong, unique secrets** for `JWT_SECRET` in production (64+ characters)
- **Rotate API keys regularly** for security
- **Use HTTPS URLs** in production environments
- **Restrict database access** to the backend service only
- **Switch to production config** by setting `ENVIRONMENT=production` and uncommenting prod variables

### Troubleshooting

**Backend can't find environment variables:**
- Ensure `.env` file exists in the project root
- Check that the correct section (dev/prod) is uncommented based on your `ENVIRONMENT` setting
- Check file permissions
- Verify variable names match exactly

**Frontend can't connect to API:**
- Check `NEXT_PUBLIC_API_URL` is set correctly for your environment
- Ensure backend is running and accessible
- Check Docker network connectivity

**LiveKit connection fails:**
- Verify `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are correct for your environment
- Check `LIVEKIT_URL` points to correct LiveKit server
- Ensure LiveKit server is running and accessible

**Wrong environment loaded:**
- Check that `ENVIRONMENT` variable is set to either `development` or `production`
- Ensure only one configuration section is uncommented in `.env`