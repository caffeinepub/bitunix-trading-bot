import { useState } from 'react';
import { useApiCredentials } from '../hooks/useApiCredentials';
import { useVerifyApiCredentials } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '../components/layout/Footer';
import { BotType } from '../backend';

export default function Settings() {
  const { hasCredentials, saveCredentials, deleteCredentials } = useApiCredentials();
  const verifyCredentials = useVerifyApiCredentials();

  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || String(error);

    if (errorMessage.includes('Invalid API key length')) {
      return 'طول کلید API نامعتبر است. باید بین 8 تا 64 کاراکتر باشد';
    }
    if (errorMessage.includes('Invalid API secret length')) {
      return 'طول کلید رمز نامعتبر است. باید بین 32 تا 128 کاراکتر باشد';
    }
    if (errorMessage.includes('must not contain spaces')) {
      return 'کلید API و رمز نباید شامل فاصله باشند';
    }
    if (errorMessage.includes('Invalid characters')) {
      return 'کاراکترهای نامعتبر در کلید API یا رمز';
    }
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید';
    }
    if (errorMessage.includes('Unauthorized') || errorMessage.includes('authentication')) {
      return 'خطای احراز هویت. لطفاً دوباره وارد شوید';
    }
    if (errorMessage.includes('trading permission') || errorMessage.includes('Trading')) {
      return 'دسترسی معاملاتی فعال نیست. لطفاً در صرافی Bitunix دسترسی Trading را فعال کنید';
    }

    return 'خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید';
  };

  const validateCredentials = (key: string, secret: string): string | null => {
    if (!key.trim() || !secret.trim()) {
      return 'لطفاً کلید API و رمز را وارد کنید';
    }

    if (key.length < 8 || key.length > 64) {
      return 'طول کلید API باید بین 8 تا 64 کاراکتر باشد';
    }

    if (secret.length < 32 || secret.length > 128) {
      return 'طول کلید رمز باید بین 32 تا 128 کاراکتر باشد';
    }

    if (key.includes(' ') || secret.includes(' ')) {
      return 'کلید API و رمز نباید شامل فاصله باشند';
    }

    const validChars = /^[A-Za-z0-9_-]+$/;
    if (!validChars.test(key) || !validChars.test(secret)) {
      return 'کلید API و رمز فقط می‌توانند شامل حروف، اعداد، خط تیره و زیرخط باشند';
    }

    return null;
  };

  const handleSave = async () => {
    const trimmedKey = apiKey.trim();
    const trimmedSecret = apiSecret.trim();

    const validationError = validateCredentials(trimmedKey, trimmedSecret);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    setConnectionStatus('idle');

    try {
      const enabledBotTypes: BotType[] = [BotType.grid, BotType.macdRsi, BotType.emaScalping];

      await saveCredentials.mutateAsync({
        apiKey: trimmedKey,
        apiSecret: trimmedSecret,
        enabledBotTypes,
      });

      toast.success('اطلاعات با موفقیت ذخیره شد', {
        description: 'کلیدهای API شما با موفقیت ذخیره شدند',
      });

      setApiKey('');
      setApiSecret('');
      setConnectionStatus('idle');
    } catch (error: any) {
      console.error('Failed to save credentials:', error);
      const errorMessage = getErrorMessage(error);
      toast.error('خطا در ذخیره اطلاعات', {
        description: errorMessage,
      });
      setConnectionStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!hasCredentials) {
      toast.error('لطفاً ابتدا کلیدهای API خود را ذخیره کنید');
      return;
    }

    setConnectionStatus('idle');

    try {
      await verifyCredentials.mutateAsync();
      setConnectionStatus('success');
      toast.success('اتصال موفق!', {
        description: 'اعتبار کلیدها تأیید شد',
      });
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      const errorMessage = getErrorMessage(error);
      toast.error('اتصال ناموفق', {
        description: errorMessage,
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید کلیدهای API خود را حذف کنید؟')) {
      return;
    }

    try {
      await deleteCredentials.mutateAsync();
      toast.success('کلیدهای API حذف شدند');
      setConnectionStatus('idle');
      setApiKey('');
      setApiSecret('');
    } catch (error: any) {
      console.error('Failed to delete credentials:', error);
      const errorMessage = getErrorMessage(error);
      toast.error('خطا در حذف اطلاعات', {
        description: errorMessage,
      });
    }
  };

  const isFormDisabled = isSaving || saveCredentials.isPending;

  return (
    <div className="space-y-6 pb-12 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">تنظیمات</h1>
        <p className="text-muted-foreground">پیکربندی کلیدهای API صرافی Bitunix</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>کلیدهای API صرافی Bitunix</CardTitle>
          <CardDescription>
            کلید API و رمز خود را از صرافی Bitunix وارد کنید تا معاملات فعال شوند. اطلاعات شما به صورت امن ذخیره
            می‌شوند.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasCredentials && connectionStatus === 'idle' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>کلیدهای API پیکربندی شده‌اند</AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                مشکلی در اعتبارسنجی کلیدها وجود دارد. لطفاً کلیدهای خود را بررسی کنید.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="apiKey">کلید API</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="کلید API خود را از Bitunix وارد کنید"
                disabled={isFormDisabled}
                dir="ltr"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-0 top-0"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={isFormDisabled}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">کلید رمز (Secret)</Label>
            <div className="relative">
              <Input
                id="apiSecret"
                type={showApiSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="کلید رمز خود را از Bitunix وارد کنید"
                disabled={isFormDisabled}
                dir="ltr"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-0 top-0"
                onClick={() => setShowApiSecret(!showApiSecret)}
                disabled={isFormDisabled}
              >
                {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isFormDisabled} className="flex-1">
              {isFormDisabled ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                'ذخیره کلیدها'
              )}
            </Button>
            {hasCredentials && (
              <Button
                onClick={handleDelete}
                disabled={deleteCredentials.isPending || isFormDisabled}
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
              <Button
                onClick={handleTest}
                disabled={verifyCredentials.isPending || isFormDisabled}
                variant="outline"
                className="w-full"
              >
                {verifyCredentials.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    در حال آزمایش اتصال...
                  </>
                ) : (
                  'آزمایش اتصال'
                )}
              </Button>

              {connectionStatus === 'success' && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    اتصال موفق! کلیدهای API شما معتبر هستند و کار می‌کنند.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    اتصال ناموفق بود. لطفاً کلیدهای API خود را بررسی کنید و دوباره تلاش کنید.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نحوه دریافت کلیدهای API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>به حساب کاربری Bitunix خود وارد شوید</li>
            <li>به بخش API Management در تنظیمات حساب بروید</li>
            <li>یک کلید API جدید با دسترسی‌های معاملاتی (Spot Trading و Futures Trading) بسازید</li>
            <li>کلید API و رمز را کپی کنید (آنها را امن نگه دارید!)</li>
            <li>آنها را در فرم بالا وارد کرده و ذخیره کنید</li>
          </ol>
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>نکته امنیتی:</strong> هرگز کلیدهای API خود را با کسی به اشتراک نگذارید. این کلیدها به
              اپلیکیشن اجازه می‌دهند از طرف شما معامله کند.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}
