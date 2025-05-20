#!/bin/bash

# Deploy script for ResumeArchitect
# Usage: ./scripts/deploy.sh [staging|production]

# Set default environment to staging
ENVIRONMENT=${1:-staging}

# Validate environment argument
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "Error: Invalid environment. Use 'staging' or 'production'."
  exit 1
fi

echo "📦 Deploying ResumeArchitect to $ENVIRONMENT environment..."

# Run tests
echo "🧪 Running tests..."
npm test || { echo "Tests failed. Aborting deployment."; exit 1; }

# Build the application
echo "🔨 Building application..."
if [[ "$ENVIRONMENT" == "production" ]]; then
  NODE_ENV=production npm run build || { echo "Build failed. Aborting deployment."; exit 1; }
else
  NODE_ENV=staging npm run build || { echo "Build failed. Aborting deployment."; exit 1; }
fi

# Deploy to Netlify
echo "🚀 Deploying to Netlify $ENVIRONMENT..."
if [[ "$ENVIRONMENT" == "production" ]]; then
  netlify deploy --build --prod || { echo "Netlify deployment failed."; exit 1; }
else
  netlify deploy --build --context staging || { echo "Netlify deployment failed."; exit 1; }
fi

echo "✅ Deployment to $ENVIRONMENT completed successfully!"
exit 0 