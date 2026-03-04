import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, RotateCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useUserPreferences, useSetUserPreferences } from '../hooks/useQueries';
import QRCodeGenerator from './QRCodeGenerator';

interface ConfigurationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigurationMenu({ isOpen, onClose }: ConfigurationMenuProps) {
  const userId = 'default-user';
  const { data: preferences } = useUserPreferences(userId);
  const { mutate: updatePreferences, isPending: isUpdating } = useSetUserPreferences();
  
  const [customAppName, setCustomAppName] = useState('');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (preferences?.customAppName) {
      setCustomAppName(preferences.customAppName);
    }
    if (preferences?.customLogoPath) {
      setCustomLogoUrl(preferences.customLogoPath);
    }
  }, [preferences]);

  const handleAppNameSave = () => {
    try {
      updatePreferences({
        userId,
        dayMode: preferences?.dayMode ?? true,
        customAppName: customAppName.trim() || null,
        customLogoPath: customLogoUrl || null
      });
      toast.success('App name updated successfully');
    } catch (error) {
      console.error('Failed to update app name:', error);
      toast.error('Failed to update app name');
    }
  };

  const handleLogoUrlSave = () => {
    try {
      updatePreferences({
        userId,
        dayMode: preferences?.dayMode ?? true,
        customAppName: preferences?.customAppName || null,
        customLogoPath: customLogoUrl.trim() || null
      });
      toast.success('Logo URL updated successfully');
      setUploadError(null);
    } catch (error) {
      console.error('Failed to update logo URL:', error);
      toast.error('Failed to update logo URL');
    }
  };

  const handleResetLogo = () => {
    try {
      setCustomLogoUrl('');
      updatePreferences({
        userId,
        dayMode: preferences?.dayMode ?? true,
        customAppName: preferences?.customAppName || null,
        customLogoPath: null
      });
      toast.success('Logo reset to default');
      setUploadError(null);
    } catch (error) {
      console.error('Failed to reset logo:', error);
      toast.error('Failed to reset logo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuration</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">Custom App Name</Label>
                  <Input
                    id="appName"
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                    placeholder="ICP Economics Dashboard"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    Customize the application name displayed in the header
                  </p>
                </div>
                <Button onClick={handleAppNameSave} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save App Name'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={customLogoUrl || preferences?.customLogoPath || '/assets/generated/icp-logo.png'} 
                    alt="Current Logo" 
                    className="h-16 w-16 object-contain border rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/generated/icp-logo.png';
                    }}
                  />
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={customLogoUrl}
                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        type="url"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a URL to a custom logo image
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleLogoUrlSave} disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save Logo URL'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleResetLogo}
                        disabled={!customLogoUrl && !preferences?.customLogoPath}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Default
                      </Button>
                    </div>
                  </div>
                </div>
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeGenerator />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
