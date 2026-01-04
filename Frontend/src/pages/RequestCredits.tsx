import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, ArrowRight, User, Leaf } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock contacts
const mockContacts = [
  { id: '3', name: 'Mike Chen', collegeId: 'STU2024003', avatar: null },
  { id: '4', name: 'Emma Davis', collegeId: 'STU2024004', avatar: null },
  { id: '5', name: 'John Smith', collegeId: 'STU2024005', avatar: null },
];

export default function RequestCredits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isRequested, setIsRequested] = useState(false);

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.collegeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequest = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setIsRequested(true);
    toast({
      title: 'Request sent!',
      description: `Request for ${amount} LC sent to ${selectedContact?.name}`,
    });
  };

  if (isRequested) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Download className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Request Sent!
            </h2>
            <p className="text-muted-foreground mb-2">
              You requested <span className="text-primary font-bold">{amount} LC</span>
            </p>
            <p className="text-muted-foreground mb-8">
              from {selectedContact?.name}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsRequested(false);
                  setSelectedContact(null);
                  setAmount('');
                  setDescription('');
                }}
              >
                Request More
              </Button>
              <Button className="flex-1" asChild>
                <a href="/dashboard">Done</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Request LeafCoins
          </h1>
          <p className="text-muted-foreground mt-1">
            Request credits from fellow students
          </p>
        </motion.div>

        {!selectedContact ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or college ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">Select Contact</p>
              {filteredContacts.map((contact, index) => (
                <motion.button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.collegeId}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedContact.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedContact.collegeId}</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Request Amount</p>
                <div className="flex items-center justify-center gap-2">
                  <Leaf className="w-8 h-8 text-primary" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-5xl font-display font-bold text-foreground bg-transparent border-none outline-none w-40 text-center"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              <Input
                placeholder="Add a note (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedContact(null)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleRequest}>
                Send Request
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}