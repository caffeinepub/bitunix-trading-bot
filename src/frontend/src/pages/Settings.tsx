import { useState } from 'react';
import { useApiCredentials } from '../hooks/useApiCredentials';
import { useGetBalance } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '../components/layout/Footer';

export default function Settings() {
  const { hasCredentials, saveCredentials, deleteCredentials } = useApiCredentials();
  const { refetch: testConnection, isFetching: isTesting } = useGetBalance();

  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error('Please enter both API key and secret');
      return;
    }

    try {
      await saveCredentials.mutateAsync({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });
      toast.success('API credentials saved successfully');
      setApiKey('');
      setApiSecret('');
      setConnectionStatus('idle');
    } catch (error) {
      console.error('Failed to save credentials:', error);
      toast.error('Failed to save credentials. Please try again.');
    }
  };

  const handleTest = async () => {
    if (!hasCredentials) {
      toast.error('Please save your API credentials first');
      return;
    }

    try {
      await testConnection();
      setConnectionStatus('success');
      toast.success('Connection successful!');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      toast.error('Connection failed. Please check your credentials.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your API credentials?')) {
      return;
    }

    try {
      await deleteCredentials.mutateAsync();
      toast.success('API credentials deleted');
      setConnectionStatus('idle');
    } catch (error) {
      console.error('Failed to delete credentials:', error);
      toast.error('Failed to delete credentials. Please try again.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your Bitunix API credentials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bitunix API Credentials</CardTitle>
          <CardDescription>
            Enter your Bitunix API key and secret to enable trading. Your credentials are encrypted and stored
            securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasCredentials && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>API credentials are configured</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Bitunix API key"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret</Label>
            <div className="relative">
              <Input
                id="apiSecret"
                type={showApiSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your Bitunix API secret"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowApiSecret(!showApiSecret)}
              >
                {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saveCredentials.isPending} className="flex-1">
              {saveCredentials.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Credentials'
              )}
            </Button>
            {hasCredentials && (
              <Button
                onClick={handleDelete}
                disabled={deleteCredentials.isPending}
                variant="destructive"
                size="icon"
              >
                {deleteCredentials.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {hasCredentials && (
            <>
              <Button onClick={handleTest} disabled={isTesting} variant="outline" className="w-full">
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {connectionStatus === 'success' && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Connection successful! Your API credentials are working.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connection failed. Please check your API credentials and try again.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Get API Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>Log in to your Bitunix account</li>
            <li>Navigate to API Management in your account settings</li>
            <li>Create a new API key with trading permissions</li>
            <li>Copy the API key and secret (keep them secure!)</li>
            <li>Paste them into the form above and save</li>
          </ol>
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}
