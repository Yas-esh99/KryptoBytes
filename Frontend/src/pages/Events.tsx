import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Leaf, Check, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/context/TransactionContext';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/types';
import { format } from 'date-fns';

const events: Event[] = [
  {
    id: '1',
    title: 'Tech Fest 2024',
    description: 'Annual technology festival with workshops, hackathons, and guest speakers',
    date: new Date('2024-03-15'),
    fee: 150,
    location: 'Main Auditorium',
    organizer: 'CS Department',
    capacity: 500,
    registered: 342,
  },
  {
    id: '2',
    title: 'Cultural Night',
    description: 'Celebrate diversity with performances, food, and music from around the world',
    date: new Date('2024-03-20'),
    fee: 100,
    location: 'Open Air Theatre',
    organizer: 'Cultural Committee',
    capacity: 1000,
    registered: 856,
  },
  {
    id: '3',
    title: 'Career Workshop',
    description: 'Resume building, interview prep, and networking with industry professionals',
    date: new Date('2024-03-25'),
    fee: 0,
    location: 'Seminar Hall B',
    organizer: 'Placement Cell',
    capacity: 200,
    registered: 178,
  },
  {
    id: '4',
    title: 'Sports Day',
    description: 'Inter-department sports competition with exciting prizes',
    date: new Date('2024-04-01'),
    fee: 50,
    location: 'Sports Complex',
    organizer: 'Sports Committee',
    capacity: 300,
    registered: 245,
  },
  {
    id: '5',
    title: 'AI & ML Workshop',
    description: 'Hands-on workshop on machine learning fundamentals',
    date: new Date('2024-04-10'),
    fee: 200,
    location: 'Computer Lab 3',
    organizer: 'AI Club',
    capacity: 50,
    registered: 48,
  },
];

export default function Events() {
  const { user, updateBalance } = useAuth();
  const { addTransaction } = useTransactions();
  const { toast } = useToast();
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  if (!user) return null;

  const handleRegister = (event: Event) => {
    if (event.fee > user.balance) {
      toast({
        title: 'Insufficient balance',
        description: `You need ${event.fee - user.balance} more LC`,
        variant: 'destructive',
      });
      return;
    }

    if (event.fee > 0) {
      updateBalance(-event.fee);
      addTransaction({
        fromUserId: user.id,
        fromUserName: user.name,
        toUserId: 'events',
        toUserName: event.title,
        amount: event.fee,
        type: 'debit',
        category: 'Event',
        description: `Registration for ${event.title}`,
        status: 'completed',
      });
    }

    setRegisteredEvents([...registeredEvents, event.id]);
    toast({
      title: 'Registration successful!',
      description: `You're registered for ${event.title}`,
    });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Campus Events
          </h1>
        </div>
        <p className="text-muted-foreground">
          Register for events and pay with LeafCoins
        </p>
      </motion.div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        {events.map((event, index) => {
          const isRegistered = registeredEvents.includes(event.id);
          const spotsLeft = event.capacity - event.registered;
          const isFull = spotsLeft <= 0;

          return (
            <motion.div
              key={event.id}
              className="glass-card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.fee === 0
                          ? 'bg-success/20 text-success'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {event.fee === 0 ? 'Free' : `${event.fee} LC`}
                      </span>
                      {isRegistered && (
                        <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Registered
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(event.date, 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {event.organizer}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Registration progress</span>
                    <span className="text-foreground">{event.registered}/{event.capacity}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {!isRegistered && (
                  <Button
                    className="w-full"
                    disabled={isFull}
                    onClick={() => handleRegister(event)}
                  >
                    {isFull ? (
                      'Event Full'
                    ) : event.fee === 0 ? (
                      <>
                        Register Free
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Leaf className="w-4 h-4" />
                        Pay {event.fee} LC to Register
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Layout>
  );
}