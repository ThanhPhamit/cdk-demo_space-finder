# Space Finder Monitoring

This directory contains monitoring and alerting functionality for the Space Finder application.

## 🔗 Tutorial: Creating a Slack Webhook for Your Channel

### Step 1: Create a Slack App

1. **Go to Slack API website**:

   - Visit: https://api.slack.com/apps
   - Click **"Create New App"**

2. **Choose creation method**:
   - Select **"From scratch"**
   - Enter your app name (e.g., "Space Finder Alerts")
   - Select your workspace
   - Click **"Create App"**

### Step 2: Enable Incoming Webhooks

1. **Navigate to Incoming Webhooks**:

   - In your app dashboard, go to **"Features" → "Incoming Webhooks"**
   - Toggle **"Activate Incoming Webhooks"** to **ON**

2. **Add Webhook to Workspace**:
   - Click **"Add New Webhook to Workspace"**
   - Select the channel where you want to receive notifications
   - Click **"Allow"**

### Step 3: Get Your Webhook URL

After authorization, you'll see your webhook URL:

```
https://hooks.slack.com/services/YOUR_WORKSPACE_ID/YOUR_CHANNEL_ID/YOUR_SECRET_TOKEN
```

⚠️ **Security Warning**: This URL contains sensitive credentials - never commit it to version control!

### Step 4: Test Your Webhook

You can test it with curl:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Space Finder!"}' \
YOUR_WEBHOOK_URL
```

### Step 5: Configure Environment Variable

Store the webhook URL securely as an environment variable:

#### Option A: AWS Systems Manager Parameter Store

```bash
aws ssm put-parameter \
  --name "/space-finder/slack-webhook-url" \
  --value "YOUR_WEBHOOK_URL" \
  --type "SecureString" \
  --description "Slack webhook URL for Space Finder notifications"
```

#### Option B: AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name "space-finder/slack-webhook" \
  --description "Slack webhook for Space Finder" \
  --secret-string '{"webhook_url":"YOUR_WEBHOOK_URL"}'
```

### Step 6: Deploy with CDK

Update your CDK stack to include the webhook URL as an environment variable for your Lambda function.

## Files in this Directory

- `handler.ts` - Lambda function that sends notifications to Slack
- `README.md` - This file with setup instructions

## 🔒 Security Best Practices

1. **Never commit webhook URLs** to version control
2. **Use environment variables** or AWS parameter store
3. **Rotate webhook URLs** periodically
4. **Limit webhook permissions** to specific channels
5. **Monitor webhook usage** in Slack app settings
