import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { validateTransaction, getTransactions } from '@/services/api';
import { TransactionItem } from '@/components/TransactionItem';
import { CheckCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Validate() {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPendingTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await getTransactions(1, 10, 'pending'); // Assuming getTransactions can filter by status
      setPendingTransactions(response.transactions);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch pending transactions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_validator) {
      fetchPendingTransactions();
    }
  }, [user]);

  const handleValidateNextTransaction = async () => {
    if (!user?.is_validator) {
      toast({
        title: 'Unauthorized',
        description: 'Only validators can validate transactions.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await validateTransaction();
      toast({
        title: 'Validation Successful',
        description: 'The next pending transaction has been validated.',
      });
      await fetchPendingTransactions(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Validation Failed',
        description: error.message || 'An unexpected error occurred during validation.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.is_validator) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-12">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You must be a validator to access this page. Stake your Leafcoin to become one!
          </p>
          <Button asChild>
            <Link to="/stake">Go to Staking</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <CheckCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Transaction Validation
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and validate pending transactions to earn rewards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-6 mb-6"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">
            Next Pending Transaction
          </h3>

          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingTransactions.length > 0 ? (
            <>
              <TransactionItem
                transaction={pendingTransactions[0]}
                currentUserId={user.uid}
                index={0}
              />
              <Button
                className="w-full mt-6"
                onClick={handleValidateNextTransaction}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckCheck className="h-5 w-5 mr-2" />
                )}
                Validate Transaction
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pending transactions to validate at the moment.
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}