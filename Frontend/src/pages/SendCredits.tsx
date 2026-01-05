import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Send as SendIcon, ArrowRight, User, Leaf, Check } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/context/TransactionContext';
import { useToast } from '@/hooks/use-toast';
import { getUsers, sendTransaction } from '@/services/api';
import { User as UserType } from '@/types';


export default function SendCredits() {
  const [step, setStep] = useState<'select' | 'amount' | 'confirm' | 'success'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedContact, setSelectedContact] = useState<UserType | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, updateBalance } = useAuth();
  const { addTransaction } = useTransactions();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        // Filter out the current user from the list
        const otherUsers = fetchedUsers.filter(u => u.uid !== user?.uid);
        setUsers(otherUsers);
      } catch (error) {
        toast({
          title: 'Error fetching users',
          description: 'Could not load user list.',
          variant: 'destructive',
        });
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user, toast]);

  const filteredContacts = users.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.college_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (contact: UserType) => {
    setSelectedContact(contact);
    setStep('amount');
  };

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    if (user && numAmount > user.balance) {
      toast({
        title: 'Insufficient balance',
        description: 'You don\'t have enough LeafCoins',
        variant: 'destructive',
      });
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!user || !selectedContact) return;
    
    setIsLoading(true);
    
    try {
      const numAmount = parseFloat(amount);
      await sendTransaction(selectedContact.college_id, numAmount);
      
      updateBalance(-numAmount);
      
      addTransaction({
        fromUserId: user.uid,
        fromUserName: user.name,
        toUserId: selectedContact.uid,
        toUserName: selectedContact.name,
        amount: numAmount,
        type: 'send',
        description: description || 'Transfer',
        status: 'completed',
      });
      
      setStep('success');

    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('select');
    setSelectedContact(null);
    setAmount('');
    setDescription('');
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <SendIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Send LeafCoins
          </h1>
          <p className="text-muted-foreground mt-1">
            Transfer credits to fellow students
          </p>
        </motion.div>

        {/* Step: Select Contact */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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
              <p className="text-sm text-muted-foreground mb-3">All Users</p>
              {filteredContacts.map((contact, index) => (
                <motion.button
                  key={contact.uid}
                  onClick={() => handleSelectContact(contact)}
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
                    <p className="text-sm text-muted-foreground">{contact.college_id}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step: Enter Amount */}
        {step === 'amount' && selectedContact && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedContact.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedContact.college_id}</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Enter Amount</p>
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
                <p className="text-sm text-muted-foreground mt-2">
                  Available: {user?.balance.toLocaleString()} LC
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant={amount === String(amt) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAmount(String(amt))}
                  >
                    {amt} LC
                  </Button>
                ))}
              </div>

              <Input
                placeholder="Add a note (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleAmountSubmit}>
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedContact && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="glass-card p-6 mb-6">
              <h3 className="font-display text-lg font-semibold text-center mb-6">
                Confirm Transfer
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium text-foreground">{selectedContact.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-xl text-foreground">
                    <Leaf className="inline w-5 h-5 text-primary mr-1" />
                    {parseFloat(amount).toLocaleString()} LC
                  </span>
                </div>
                {description && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-foreground">{description}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('amount')}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm
                    <SendIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step: Success */}
        {step === 'success' && selectedContact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Transfer Successful!
            </h2>
            <p className="text-muted-foreground mb-2">
              You sent <span className="text-primary font-bold">{parseFloat(amount).toLocaleString()} LC</span>
            </p>
            <p className="text-muted-foreground mb-8">
              to {selectedContact.name}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                Send More
              </Button>
              <Button className="flex-1" asChild>
                <a href="/dashboard">Done</a>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}