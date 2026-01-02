import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building, Camera, Save, Leaf, Award, Calendar, Shield } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser({
      name: formData.name,
      department: formData.department,
    });
    setIsEditing(false);
    toast({
      title: 'Profile updated!',
      description: 'Your changes have been saved.',
    });
  };

  const stats = [
    { label: 'Total Earned', value: '4,250 LC', icon: Leaf },
    { label: 'Transactions', value: '47', icon: Award },
    { label: 'Member Since', value: 'Jan 2024', icon: Calendar },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className="glass-card p-6 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                />
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Department"
                />
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium capitalize">
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                  {user.department && (
                    <span className="text-muted-foreground text-sm">
                      {user.department}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Edit Button */}
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {stats.map((stat, index) => (
          <div key={index} className="glass-card p-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-2">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Account Details */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-display font-semibold text-foreground mb-4">
          Account Details
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">College ID</p>
              <p className="font-medium text-foreground">{user.collegeId}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="font-bold text-xl text-primary">{user.balance.toLocaleString()} LC</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}