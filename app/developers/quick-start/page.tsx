'use client'

import { DocsLayout } from '@/components/docs-layout'
import { CodeBlock } from '@/components/docs/code-block'
import { Tabs, Tab } from '@/components/docs/tabs'
import { Callout } from '@/components/docs/callout'
import { StepTimeline } from '@/components/docs/step-timeline'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function QuickStartPage() {
  const steps = [
    {
      title: 'Create account',
      description: 'Sign up for a free TXTLINK account. No credit card required.',
      time: '2 min',
    },
    {
      title: 'Generate API key',
      description: 'Navigate to Settings → API Keys and create a new API key.',
      time: '1 min',
    },
    {
      title: 'Install SDK',
      description: 'Install the TXTLINK SDK for your preferred language.',
      time: '1 min',
    },
    {
      title: 'Send first SMS',
      description: 'Use the SDK to send your first SMS message.',
      time: '1 min',
    },
    {
      title: 'Receive delivery report',
      description: 'Set up webhooks to receive delivery status updates (optional).',
      time: 'optional',
    },
  ]

  const nodeExample = `import { TXTLINK } from '@txtlink/sdk';

const client = new TXTLINK({
  apiKey: process.env.TXTLINK_API_KEY,
});

// Send SMS
const result = await client.sms.send({
  to: '+254712345678',
  message: 'Hello from TXTLINK!',
  senderId: 'TXTLINK',
});

console.log('Message ID:', result.messageId);
console.log('Status:', result.status);`

  const pythonExample = `from txtlink import TXTLINK

client = TXTLINK(api_key=os.getenv('TXTLINK_API_KEY'))

# Send SMS
result = client.sms.send(
    to='+254712345678',
    message='Hello from TXTLINK!',
    sender_id='TXTLINK'
)

print(f"Message ID: {result.message_id}")
print(f"Status: {result.status}")`

  const phpExample = `<?php
require 'vendor/autoload.php';

use TXTLINK\\TXTLINK;

$client = new TXTLINK([
    'api_key' => getenv('TXTLINK_API_KEY')
]);

// Send SMS
$result = $client->sms->send([
    'to' => '+254712345678',
    'message' => 'Hello from TXTLINK!',
    'sender_id' => 'TXTLINK'
]);

echo "Message ID: " . $result->message_id . "\\n";
echo "Status: " . $result->status . "\\n";`

  const responseExample = `{
  "messageId": "msg_abc123xyz",
  "status": "QUEUED",
  "to": "+254712345678",
  "senderId": "TXTLINK",
  "createdAt": "2026-02-08T12:00:00Z"
}`

  return (
    <DocsLayout>
      <div className="prose prose-slate max-w-none">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Quick Start
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Get up and running with TXTLINK in 5 minutes. Follow these steps 
            to send your first SMS.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="mb-12">
          <StepTimeline steps={steps} />
        </div>

        {/* Step 1: Create Account */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">1</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
          </div>
          <p className="text-slate-600 mb-6">
            Sign up for a free TXTLINK account. You'll get access to test API keys 
            and can send up to 100 SMS messages for free during development.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/register">
              <Button className="bg-teal-600 text-white hover:bg-teal-700">
                Create Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-slate-300 text-slate-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Step 2: Generate API Key */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">2</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Generate API key</h2>
          </div>
          <p className="text-slate-600 mb-6">
            After signing in, navigate to <strong>Settings → API Keys</strong> and 
            create a new API key. Copy it immediately—you won't be able to see it again.
          </p>
          <Callout type="warning" title="Keep your API key secure">
            Never expose your API key in frontend code or commit it to version control. 
            Use environment variables instead.
          </Callout>
        </div>

        {/* Step 3: Install SDK */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">3</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Install SDK</h2>
          </div>
          <p className="text-slate-600 mb-6">
            Install the TXTLINK SDK for your preferred programming language:
          </p>
          <Tabs defaultTab="node">
            <Tab id="node" label="Node.js">
              <CodeBlock
                code="npm install @txtlink/sdk"
                language="bash"
              />
            </Tab>
            <Tab id="python" label="Python">
              <CodeBlock
                code="pip install txtlink-sdk"
                language="bash"
              />
            </Tab>
            <Tab id="php" label="PHP">
              <CodeBlock
                code="composer require txtlink/sdk"
                language="bash"
              />
            </Tab>
          </Tabs>
        </div>

        {/* Step 4: Send First SMS */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">4</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Send first SMS</h2>
          </div>
          <p className="text-slate-600 mb-6">
            Use the SDK to send your first SMS. Replace the phone number with your own 
            to receive a test message.
          </p>

          <Tabs defaultTab="node">
            <Tab id="node" label="Node.js">
              <CodeBlock code={nodeExample} language="javascript" />
            </Tab>
            <Tab id="python" label="Python">
              <CodeBlock code={pythonExample} language="python" />
            </Tab>
            <Tab id="php" label="PHP">
              <CodeBlock code={phpExample} language="php" />
            </Tab>
          </Tabs>

          <div className="mt-6">
            <Callout type="success" title="You'll receive an SMS instantly">
              After running this code, you should receive an SMS on the phone number 
              you specified within seconds.
            </Callout>
          </div>
        </div>

        {/* Expected Response */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Expected Response</h3>
          <CodeBlock code={responseExample} language="json" />
        </div>

        {/* Next Steps */}
        <Card className="p-8 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Next Steps</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <Link href="/developers/guides/sending-sms" className="font-medium text-teal-700 hover:text-teal-800">
                  Learn about sending SMS
                </Link>
                <p className="text-sm text-slate-600">Explore advanced features like bulk SMS and delivery reports</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <Link href="/developers/guides/webhooks" className="font-medium text-teal-700 hover:text-teal-800">
                  Set up webhooks
                </Link>
                <p className="text-sm text-slate-600">Receive real-time delivery status updates</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <Link href="/developers/api/rest" className="font-medium text-teal-700 hover:text-teal-800">
                  Read the API reference
                </Link>
                <p className="text-sm text-slate-600">Complete documentation for all API endpoints</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </DocsLayout>
  )
}

