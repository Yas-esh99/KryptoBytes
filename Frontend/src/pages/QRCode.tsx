import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Download, Leaf, Check } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function QRCode() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const qrValue = JSON.stringify({
    type: 'campuscred_payment',
    userId: user.id,
    name: user.name,
    collegeId: user.collegeId,
    amount: amount || undefined,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(user.collegeId);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'College ID copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Pay me on CampusCred',
        text: `Send LeafCoins to ${user.name} (${user.collegeId})${amount ? ` - Amount: ${amount} LC` : ''}`,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl font-bold text-foreground">
            Your QR Code
          </h1>
          <p className="text-muted-foreground mt-1">
            Show this to receive LeafCoins
          </p>
        </motion.div>

        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* QR Code */}
          <div className="relative bg-foreground p-6 rounded-2xl mx-auto w-fit mb-6">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin
              imageSettings={{
                src: '',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary p-2 rounded-xl">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-bold text-foreground">
              {user.name}
            </h2>
            <p className="text-muted-foreground">{user.collegeId}</p>
          </div>

          {/* Set Amount */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2 text-center">
              Set amount (optional)
            </p>
            <div className="relative">
              <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12 text-center text-lg"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy ID'}
            </Button>
            <Button
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="mt-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-display font-semibold text-foreground">
            How to receive payments
          </h3>
          <div className="space-y-3">
            {[
              'Show your QR code to the sender',
              'They scan it with their CampusCred app',
              'Confirm the amount and receive instantly',
            ].map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-card/40 border border-border"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}