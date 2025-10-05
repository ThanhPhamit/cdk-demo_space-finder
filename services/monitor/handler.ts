import { SNSEvent } from 'aws-lambda';

const webHookUrl = process.env.SLACK_WEBHOOK_URL || '';

async function handler(event: SNSEvent, _context: any): Promise<void> {
  for (const record of event.Records) {
    await fetch(webHookUrl, {
      method: 'POST',
      body: JSON.stringify({
        text: `Huston, we have a problem: ${record.Sns.Message}`,
      }),
    });
  }
}

export { handler };
