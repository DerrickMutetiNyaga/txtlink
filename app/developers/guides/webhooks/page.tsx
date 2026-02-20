'use client'

import { DocsLayout } from '@/components/docs-layout'
import { CodeBlock } from '@/components/docs/code-block'
import { Callout } from '@/components/docs/callout'
import { Card } from '@/components/ui/card'
import { Tabs, Tab } from '@/components/docs/tabs'
import { Webhook, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function WebhooksPage() {
  const webhookExample = `{
  "event": "sms.delivered",
  "messageId": "507f1f77bcf86cd799439011",
  "to": "+254712345678",
  "status": "delivered",
  "deliveredAt": "2026-02-08T12:05:00Z",
  "timestamp": "2026-02-08T12:05:00Z"
}`

  const nodeExample = `// Express.js webhook handler
const express = require('express');
const crypto = require('crypto');
const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-txtlink-signature'];
  const secret = process.env.TXTLINK_WEBHOOK_SECRET;
  
  // Verify signature
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
  
  if (signature !== digest) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(req.body);
  
  // Handle different event types
  switch (event.event) {
    case 'sms.delivered':
      console.log('SMS delivered:', event.messageId);
      // Update your database
      break;
    case 'sms.failed':
      console.log('SMS failed:', event.messageId);
      // Handle failure
      break;
  }
  
  res.status(200).send('OK');
});`

  const pythonExample = `# Flask webhook handler
from flask import Flask, request, jsonify
import hmac
import hashlib
import os

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-TXTLINK-Signature')
    secret = os.getenv('TXTLINK_WEBHOOK_SECRET')
    
    # Verify signature
    hmac_obj = hmac.new(secret.encode(), request.data, hashlib.sha256)
    digest = hmac_obj.hexdigest()
    
    if signature != digest:
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = request.json
    
    # Handle different event types
    if event['event'] == 'sms.delivered':
        print(f"SMS delivered: {event['messageId']}")
    elif event['event'] == 'sms.failed':
        print(f"SMS failed: {event['messageId']}")
    
    return jsonify({'status': 'ok'}), 200`

  const events = [
    {
      event: 'sms.queued',
      description: 'SMS message has been queued for delivery',
      fields: ['messageId', 'to', 'senderId', 'timestamp'],
    },
    {
      event: 'sms.sent',
      description: 'SMS message has been sent to the carrier',
      fields: ['messageId', 'to', 'senderId', 'sentAt', 'timestamp'],
    },
    {
      event: 'sms.delivered',
      description: 'SMS message has been delivered to the recipient',
      fields: ['messageId', 'to', 'senderId', 'deliveredAt', 'timestamp'],
    },
    {
      event: 'sms.failed',
      description: 'SMS message delivery failed',
      fields: ['messageId', 'to', 'senderId', 'errorCode', 'errorMessage', 'failedAt', 'timestamp'],
    },
  ]

  return (
    <DocsLayout>
      <div className="prose prose-slate max-w-none">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Webhooks
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Webhooks allow you to receive real-time notifications about SMS delivery status. 
            Configure webhooks to get instant updates when messages are delivered or fail.
          </p>
        </div>

        {/* What are Webhooks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What are Webhooks?</h2>
          <p className="text-slate-600 mb-6">
            Webhooks are HTTP callbacks that notify your application when events occur. 
            Instead of polling the API for status updates, TXTLINK sends a POST request 
            to your webhook URL whenever an SMS status changes.
          </p>
          <Card className="p-6 bg-slate-50">
            <div className="flex items-start gap-4">
              <Webhook className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Benefits</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Real-time delivery status updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>No need to poll the API repeatedly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Reduced API calls and faster response times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Automatic retry on delivery failures</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Setting Up Webhooks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Setting Up Webhooks</h2>
          <ol className="list-decimal list-inside space-y-3 text-slate-600 mb-6">
            <li>Create a webhook endpoint in your application that accepts POST requests</li>
            <li>Log in to your TXTLINK dashboard</li>
            <li>Navigate to <strong>Settings → Webhooks</strong></li>
            <li>Click <strong>"Create Webhook"</strong></li>
            <li>Enter your webhook URL (must be HTTPS in production)</li>
            <li>Select the events you want to receive (e.g., sms.delivered, sms.failed)</li>
            <li>Save your webhook secret for signature verification</li>
          </ol>
          <Callout type="warning" title="Webhook URL Requirements">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Must be publicly accessible (not localhost)</li>
              <li>Must use HTTPS in production</li>
              <li>Must respond with 200 OK within 5 seconds</li>
              <li>Should verify webhook signatures for security</li>
            </ul>
          </Callout>
        </div>

        {/* Webhook Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Webhook Events</h2>
          <p className="text-slate-600 mb-6">
            TXTLINK sends webhooks for the following events:
          </p>
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.event} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Webhook className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{event.event}</h3>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                        {event.event}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3">{event.description}</p>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Payload Fields:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.fields.map((field) => (
                          <span key={field} className="px-2 py-1 bg-white text-slate-600 rounded text-xs font-mono">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Webhook Payload */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Webhook Payload</h2>
          <p className="text-slate-600 mb-6">
            Example webhook payload for a delivered SMS:
          </p>
          <CodeBlock code={webhookExample} language="json" />
        </div>

        {/* Implementation Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Implementation Examples</h2>
          <Tabs defaultTab="node">
            <Tab id="node" label="Node.js">
              <CodeBlock code={nodeExample} language="javascript" />
            </Tab>
            <Tab id="python" label="Python">
              <CodeBlock code={pythonExample} language="python" />
            </Tab>
          </Tabs>
        </div>

        {/* Security */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Security</h2>
          <Callout type="warning" title="Always Verify Webhook Signatures">
            <p className="mb-3">
              TXTLINK signs all webhook requests with a secret key. Always verify the signature 
              to ensure the request is authentic and hasn't been tampered with.
            </p>
            <p className="text-sm text-slate-600">
              The signature is sent in the <code className="px-1.5 py-0.5 bg-slate-100 rounded">X-TXTLINK-Signature</code> header 
              and is computed using HMAC-SHA256 with your webhook secret.
            </p>
          </Callout>
        </div>

        {/* Testing */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Testing Webhooks</h2>
          <p className="text-slate-600 mb-6">
            Use tools like ngrok or localtunnel to expose your local development server 
            for webhook testing:
          </p>
          <CodeBlock
            code={`# Using ngrok
ngrok http 3000

# Your webhook URL will be:
# https://abc123.ngrok.io/webhook`}
            language="bash"
          />
        </div>
      </div>
    </DocsLayout>
  )
}

