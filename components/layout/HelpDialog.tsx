'use client';

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zariel & Co Help Center</DialogTitle>
          <DialogDescription>
            Learn how to use the platform and manage your account
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tiers">User Tiers</TabsTrigger>
            <TabsTrigger value="tokens">Zaryo Tokens</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Zariel & Co</CardTitle>
                <CardDescription>
                  A platform connecting content creators with brands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Zariel & Co is an innovative platform where content creators can share their
                  creative ideas and brands can discover and purchase content that resonates
                  with their audience.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Upload and monetize your content ideas</li>
                    <li>Browse marketplace for creative content</li>
                    <li>Secure transactions using Zaryo tokens</li>
                    <li>Manage subscriptions and earnings</li>
                    <li>Track your content performance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Tiers</CardTitle>
                <CardDescription>
                  Understanding the different user levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Tier 1 - Creator</h4>
                  <p className="text-sm text-gray-600">
                    Content creators who upload ideas, videos, images, and other creative content.
                    Creators earn Zaryo tokens when their content is purchased by brands.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Upload content to the marketplace</li>
                    <li>Set your own pricing</li>
                    <li>Earn tokens from purchases</li>
                    <li>Requires active subscription to upload content</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Tier 2 & 3 - Company</h4>
                  <p className="text-sm text-gray-600">
                    Brands and businesses looking to purchase creative content for their marketing
                    and promotional needs.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Browse and purchase content</li>
                    <li>Purchase Zaryo tokens</li>
                    <li>Access to full marketplace</li>
                    <li>Download purchased content</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Admin</h4>
                  <p className="text-sm text-gray-600">
                    Platform administrators with full access to manage users, content, and platform settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Zaryo Tokens</CardTitle>
                <CardDescription>
                  Our platform currency for secure transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">What are Zaryo Tokens?</h4>
                  <p className="text-sm text-gray-600">
                    Zaryo is our platform's digital currency used for all content transactions.
                    It provides a secure and straightforward way to buy and sell content.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">How to Get Tokens</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Purchase tokens through the Token Management page</li>
                    <li>Choose from various token packages</li>
                    <li>Secure payment via Stripe</li>
                    <li>Creators earn tokens when content is purchased</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Using Tokens</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Browse the marketplace to find content</li>
                    <li>Click "Purchase" on any content you want</li>
                    <li>Tokens are deducted from your balance</li>
                    <li>Content is immediately available to download</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Token Balance</h4>
                  <p className="text-sm text-gray-600">
                    View your current balance, earnings, and spending history in the Token Management section.
                    All transactions are tracked for your records.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">How do I upload content?</h4>
                  <p className="text-sm text-gray-600">
                    Navigate to "My Content" and click the upload button. You'll need an active subscription
                    to upload content. Fill in the title, description, and set your price in Zaryo tokens.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">How do subscriptions work?</h4>
                  <p className="text-sm text-gray-600">
                    Creators need a subscription to upload content. Visit the Subscription page to choose
                    between monthly ($9.99) or yearly plans. Subscriptions can be managed or cancelled anytime.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">How do I purchase content?</h4>
                  <p className="text-sm text-gray-600">
                    First, purchase Zaryo tokens from the Token Management page. Then browse the marketplace,
                    find content you like, and click "Purchase". Tokens will be deducted from your balance.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Can I get a refund?</h4>
                  <p className="text-sm text-gray-600">
                    Token purchases are final. However, if you have issues with purchased content,
                    please contact support for assistance.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">How do I withdraw my earnings?</h4>
                  <p className="text-sm text-gray-600">
                    Currently, earnings are stored as Zaryo tokens in your wallet. Contact support
                    to discuss withdrawal options and conversion to cash.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">What file types are supported?</h4>
                  <p className="text-sm text-gray-600">
                    We support videos (MP4, MOV, AVI), images (JPG, PNG, GIF), and documents (PDF).
                    File size limits apply based on your subscription tier.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Need more help?</h4>
                  <p className="text-sm text-gray-600">
                    Contact our support team at support@zarielco.com for additional assistance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
