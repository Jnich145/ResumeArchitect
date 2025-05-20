# 🚀 ResumeArchitect

ResumeArchitect is an AI-enhanced, multi-template resume builder that helps users create professional resumes with intelligent suggestions and ATS compatibility analysis.

## 📋 Table of Contents
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Setup Guide](#-setup-guide)
  - [Required API Keys](#required-api-keys-and-external-services)
  - [Environment Variables](#environment-variables)
  - [Local Development](#local-development)
  - [Mock Services](#mock-service-option)
- [Production Deployment](#-production-deployment-requirements)
- [Deployment Scripts](#-using-the-built-in-deployment-scripts)
- [Troubleshooting](#-troubleshooting-common-issues)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🎨 Multiple professional templates with customization options
- 💾 Auto-save with visual feedback
- 📝 AI-powered content suggestions and improvements
- 🤖 ATS compatibility analysis and scoring
- 📊 Resume analytics dashboard
- 🔒 Secure authentication and user management
- 💳 Subscription-based premium features
- 📱 Responsive design for all devices
- 🌐 Internationalization support
- 🎯 Perfect PDF export

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **State Management**: React Context + Hooks
- **PDF Generation**: jsPDF + html2canvas
- **AI Integration**: OpenAI API
- **Authentication**: JWT with HttpOnly cookies
- **Payment Processing**: Stripe
- **Internationalization**: i18next

## 🚀 Setup Guide

### Required API Keys and External Services

#### 1. MongoDB Database
- **Where to get it**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **What to do**:
  - Create a free account
  - Create a new cluster
  - Set up a database user with password
  - Get your connection string from "Connect" > "Connect your application"

#### 2. OpenAI API
- **Where to get it**: [OpenAI Platform](https://platform.openai.com/)
- **What to do**:
  - Create an account
  - Go to API keys section
  - Create a new secret key
  - Note: Free tier has limited usage; for production, you'll need to add billing

#### 3. Stripe API
- **Where to get it**: [Stripe Dashboard](https://dashboard.stripe.com/)
- **What to do**:
  - Create an account
  - Get your test API keys from the Developers section
  - Create products and pricing plans (for subscription tiers)
  - Note product/price IDs for your plans

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/resumeArchitect?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:5173

# OpenAI API
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o

# Stripe Integration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_BASIC=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM=price_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Local Development

1. **Clone and Install Dependencies**:
   ```bash
   git clone https://github.com/your-username/resumearchitect.git
   cd resumearchitect
   npm install
   ```

2. **Start Development Servers**:
   ```bash
   # Run both frontend and backend
   npm run dev:all

   # Or run them separately
   npm run dev          # Frontend
   npm run dev:server   # Backend
   ```

3. **Access the Application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

### Mock Service Option

For testing without real API keys, the application includes mock implementations:

- If no OpenAI API key is provided, the app will use mock AI responses
- If no Stripe API key is provided, the app will simulate subscription functionality
- If no MongoDB URI is provided, a mock database will be used

You'll see warning messages like these when using mock services:
```
⚠️ No Stripe API key found. Using mock Stripe implementation for development.
⚠️ No OpenAI API key found. Using mock AI implementation for development.
```

This mock mode is perfect for UI testing and development but won't provide real data processing or storage.

## 🚀 Production Deployment Requirements

For a production-ready deployment, you need to:

1. **MongoDB Production Database**:
   - Set up a production MongoDB cluster with backups
   - Implement proper security measures (network access, strong password)
   - Consider MongoDB Atlas dedicated cluster for performance

2. **OpenAI API Configuration**:
   - Add a payment method to your OpenAI account
   - Set usage limits to control costs
   - Monitor token usage regularly
   - Consider using GPT-3.5-Turbo for cost savings on non-critical features

3. **Stripe Production Setup**:
   - Switch to production keys (different from test keys)
   - Complete your Stripe account verification
   - Create real products and pricing plans
   - Set up webhook endpoints and secure them with proper signatures
   - Implement proper payment error handling

4. **Environment Variables**:
   - Set secure, unique keys for JWT_SECRET and JWT_REFRESH_SECRET
   - Update NODE_ENV to "production"
   - Set CLIENT_URL to your production frontend URL

5. **Deployment Options**:
   - Frontend: Netlify, Vercel, or any static hosting
   - Backend: Render, Railway, Fly.io, or AWS/GCP/Azure
   - Make sure to set all environment variables in your hosting platform

6. **Additional Production Considerations**:
   - Set up monitoring and logging (e.g., Sentry, LogRocket)
   - Configure automatic backups for your database
   - Set up SSL certificates for custom domains
   - Implement a CI/CD pipeline for automated testing and deployment

## 🔄 Using the Built-in Deployment Scripts

ResumeArchitect includes deployment scripts for Netlify:

1. **Staging Deployment**:
   ```bash
   npm run deploy:staging
   ```

2. **Production Deployment**:
   ```bash
   npm run deploy:production
   ```

These scripts will run tests and deploy to the appropriate environment.

## ❓ Troubleshooting Common Issues

- **API Connection Errors**: Check that your backend server is running on port 3001
- **Database Connection Errors**: Verify your MongoDB connection string and network access settings
- **Missing Environment Variables**: Ensure all required environment variables are set
- **CORS Issues**: Make sure your CLIENT_URL matches the actual frontend URL

If you encounter any issues, check the server logs and browser console for specific error messages.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
