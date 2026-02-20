import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useUserProfile } from '../../hooks/useUserProfile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { userProfile, isLoading: profileLoading, isFetched, saveProfile } = useUserProfile();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const isAuthenticated = !!identity;
  
  // Only show modal when:
  // 1. User is authenticated
  // 2. Profile data has been fetched (not just loading)
  // 3. Profile is null (doesn't exist)
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter your username');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        username: username.trim(),
        email: email.trim() || '',
        createdAtNanos: BigInt(Date.now()),
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  // Don't render the dialog at all if conditions aren't met
  if (!showProfileSetup) {
    return null;
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Bitunix Trading Bot</DialogTitle>
          <DialogDescription>Please set up your profile to continue</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
