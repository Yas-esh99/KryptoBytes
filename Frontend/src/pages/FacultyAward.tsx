import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Search,
  User,
  Leaf,
  Send,
  Check,
  Users,
  Divide,
  AlertTriangle,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/context/TransactionContext';
import { useToast } from '@/hooks/use-toast';

// Mock students for selection
const allStudents = [
  { id: '3', name: 'Mike Chen', collegeId: 'STU2024003', department: 'Computer Science' },
  { id: '4', name: 'Emma Davis', collegeId: 'STU2024004', department: 'Electronics' },
  { id: '5', name: 'John Smith', collegeId: 'STU2024005', department: 'Mechanical' },
  { id: '6', name: 'Lisa Wang', collegeId: 'STU2024006', department: 'Civil' },
  { id: '7', name: 'David Brown', collegeId: 'STU2024007', department: 'Computer Science' },
  { id: '8', name: 'Sarah Miller', collegeId: 'STU2024008', department: 'Electronics' },
  { id: '9', name: 'James Wilson', collegeId: 'STU2024009', department: 'Computer Science' },
  { id: '10', name: 'Emily Taylor', collegeId: 'STU2024010', department: 'Mathematics' },
];

const creditReasons = [
  'NSS Activity',
  'NCC Participation',
  'Event Volunteering',
  'Academic Excellence',
  'Sports Achievement',
  'Cultural Performance',
  'Internship Completion',
  'Research Contribution',
  'Good Deed',
  'Other',
];

export default function FacultyAward() {
  const { user, updateUser } = useAuth();
  const { addTransaction } = useTransactions();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<typeof allStudents>([]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isDistributeEqually, setIsDistributeEqually] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'amount' | 'confirm' | 'success'>('select');

  if (!user || user.role !== 'faculty') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertTriangle className="w-16 h-16 text-warning mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            This feature is only available for faculty members.
          </p>
        </div>
      </Layout>
    );
  }

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.collegeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudent = (student: typeof allStudents[0]) => {
    if (selectedStudents.find((s) => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter((s) => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const getTotalAmount = () => parseFloat(amount) || 0;
  const getPerStudentAmount = () => {
    const total = getTotalAmount();
    if (isDistributeEqually && selectedStudents.length > 0) {
      return Math.floor(total / selectedStudents.length);
    }
    return total;
  };

  const handleConfirm = async () => {
    if (!user) return;
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const perStudentAmount = getPerStudentAmount();
    const finalReason = reason === 'Other' ? customReason : reason;

    selectedStudents.forEach((student) => {
      addTransaction({
        fromUserId: user.id,
        fromUserName: user.name,
        toUserId: student.id,
        toUserName: student.name,
        amount: perStudentAmount,
        type: 'award',
        category: finalReason,
        description: `Faculty award: ${finalReason}`,
        status: 'completed',
      });
    });

    // Deduct from faculty balance
    const totalDeducted = isDistributeEqually
      ? perStudentAmount * selectedStudents.length
      : perStudentAmount * selectedStudents.length;
    updateBalance(-totalDeducted);

    setIsLoading(false);
    setStep('success');
  };

  const handleReset = () => {
    setStep('select');
    setSelectedStudents([]);
    setAmount('');
    setReason('');
    setCustomReason('');
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Award Leafcoin to Students
          </h1>
        </div>
        <p className="text-muted-foreground">
          Award LeafCoins to students for their achievements
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        className="flex items-center justify-center gap-2 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {['Select', 'Amount', 'Confirm', 'Done'].map((label, index) => {
          const stepIndex = ['select', 'amount', 'confirm', 'success'].indexOf(step);
          const isActive = index <= stepIndex;

          return (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={`w-8 md:w-12 h-0.5 ${
                    index < stepIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      <div className="max-w-2xl mx-auto">
        {/* Step 1: Select Students */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search students by name, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>

            {selectedStudents.length > 0 && (
              <div className="glass-card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Selected: {selectedStudents.length} students
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStudents([])}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                    >
                      {s.name}
                      <button
                        onClick={() => toggleStudent(s)}
                        className="hover:text-primary-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudents.find((s) => s.id === student.id);
                return (
                  <button
                    key={student.id}
                    onClick={() => toggleStudent(student)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-card/60 border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.collegeId} • {student.department}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              className="w-full mt-6"
              disabled={selectedStudents.length === 0}
              onClick={() => setStep('amount')}
            >
              Continue with {selectedStudents.length} students
            </Button>
          </motion.div>
        )}

        {/* Step 2: Enter Amount & Reason */}
        {step === 'amount' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {selectedStudents.length} students selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudents.map((s) => s.name).join(', ')}
                  </p>
                </div>
              </div>

              {/* Distribution Option */}
              {selectedStudents.length > 1 && (
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={isDistributeEqually ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setIsDistributeEqually(true)}
                  >
                    <Divide className="w-4 h-4" />
                    Split Equally
                  </Button>
                  <Button
                    variant={!isDistributeEqually ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setIsDistributeEqually(false)}
                  >
                    <Leaf className="w-4 h-4" />
                    Each Gets
                  </Button>
                </div>
              )}

              {/* Amount Input */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  {isDistributeEqually && selectedStudents.length > 1
                    ? 'Total amount to distribute'
                    : 'Amount per student'}
                </p>
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
                {isDistributeEqually && selectedStudents.length > 1 && getTotalAmount() > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Each student gets: <span className="text-primary font-bold">{getPerStudentAmount()} LC</span>
                  </p>
                )}
              </div>

              {/* Reason Selection */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Reason for award</p>
                <div className="flex flex-wrap gap-2">
                  {awardReasons.map((r) => (
                    <Button
                      key={r}
                      variant={reason === r ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReason(r)}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>

              {reason === 'Other' && (
                <Input
                  placeholder="Enter custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!amount || !reason || (reason === 'Other' && !customReason)}
                onClick={() => setStep('confirm')}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card p-6 mb-6">
              <h3 className="font-display text-lg font-semibold text-center mb-6">
                Confirm Award Distribution
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium text-foreground">{selectedStudents.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Amount per student</span>
                  <span className="font-bold text-lg text-primary">
                    <Leaf className="inline w-4 h-4 mr-1" />
                    {getPerStudentAmount()} LC
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-xl text-foreground">
                    {(getPerStudentAmount() * selectedStudents.length).toLocaleString()} LC
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="text-foreground">{reason === 'Other' ? customReason : reason}</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Recipients:</p>
                <p className="text-sm text-foreground mt-1">
                  {selectedStudents.map((s) => s.name).join(', ')}
                </p>
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
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Awards Distributed!
            </h2>
            <p className="text-muted-foreground mb-2">
              <span className="text-primary font-bold">{getPerStudentAmount()} LC</span> awarded to each of
            </p>
            <p className="text-muted-foreground mb-8">
              {selectedStudents.length} students
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                Award More
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