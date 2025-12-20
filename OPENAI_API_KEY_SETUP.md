# OpenAI API Key Setup Guide

## Problem
The container is failing with error: `401 Incorrect API key provided`

## Quick Fix (Fastest Solution)

**Stop the container and restart it with a new API key:**

```bash
# Stop and remove the existing container
docker stop v25-process-connections
docker rm v25-process-connections

# Run with new API key (replace YOUR_NEW_API_KEY with your actual key)
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=YOUR_NEW_API_KEY \
  --name v25-process-connections \
  v25-process-connections
```

**Get a new API key from:** https://platform.openai.com/api-keys

## Solution

### Option 1: Update API Key via Build Argument (Recommended for CI/CD)

1. **Get a new OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Build the Docker image with the new API key:**
   ```bash
   docker build --build-arg OPENAI_API_KEY=your_new_api_key_here -t v25-process-connections .
   ```

3. **Run the container:**
   ```bash
   docker run -d -p 3000:3000 --name v25-process-connections v25-process-connections
   ```

### Option 2: Update API Key at Runtime (Recommended for Quick Fixes)

1. **Get a new OpenAI API key** (same as above)

2. **Stop and remove the existing container:**
   ```bash
   docker stop v25-process-connections
   docker rm v25-process-connections
   ```

3. **Run the container with the new API key as environment variable:**
   ```bash
   docker run -d -p 3000:3000 \
     -e OPENAI_API_KEY=your_new_api_key_here \
     --name v25-process-connections \
     v25-process-connections
   ```

### Option 3: Update via Docker Compose

If you're using docker-compose, update your `docker-compose.yml`:

```yaml
services:
  harx-app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        OPENAI_API_KEY: ${OPENAI_API_KEY}  # Read from .env file
    container_name: harx-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}  # Runtime override
      # ... other environment variables
```

Then create a `.env` file:
```bash
OPENAI_API_KEY=your_new_api_key_here
```

And run:
```bash
docker-compose up --build -d
```

## Verification

After updating the API key, check the logs:
```bash
docker logs v25-process-connections
```

You should see:
- `[API] Generate profile request:` with `hasOpenAIKey: true`
- No more `401 Incorrect API key` errors
- Successful API calls to OpenAI

## Security Best Practices

⚠️ **Important:** Never commit API keys to version control!

1. Use environment variables or secrets management
2. For production, consider using Docker secrets or a secrets manager
3. Rotate API keys regularly
4. Use different keys for different environments (dev/staging/prod)

## Troubleshooting

If you still see errors after updating:

1. **Verify the API key format:** Should start with `sk-` or `sk-proj-`
2. **Check API key permissions:** Ensure it has access to the models you're using
3. **Check billing:** Ensure your OpenAI account has sufficient credits
4. **Verify the key is being passed:** Check logs for `hasOpenAIKey: true`
5. **Rebuild the container:** If using build-time args, rebuild the image

