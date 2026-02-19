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
import { useUserPreferences, useUpdateUserPreferences } from '../hooks/useQueries';
import { useFileUpload } from '../blob-storage/FileStorage';
import QRCodeGenerator from './QRCodeGenerator';

interface ConfigurationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigurationMenu({ isOpen, onClose }: ConfigurationMenuProps) {
  const { data: preferences } = useUserPreferences();
  const { mutate: updatePreferences, isPending: isUpdating } = useUpdateUserPreferences();
  const { uploadFile, isUploading } = useFileUpload();
  
  const [customAppName, setCustomAppName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (preferences?.customAppName) {
      setCustomAppName(preferences.customAppName);
    }
  }, [preferences]);

  const handleAppNameSave = () => {
    try {
      updatePreferences({
        dayMode: preferences?.dayMode ?? true,
        customAppName: customAppName.trim() || null,
        customLogoPath: preferences?.customLogoPath || null
      });
      toast.success('App name updated successfully');
    } catch (error) {
      console.error('Failed to update app name:', error);
      toast.error('Failed to update app name');
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a PNG, JPG, JPEG, GIF, or WebP file');
      toast.error('Invalid file type');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      toast.error('File too large');
      return;
    }

    try {
      const logoPath = `logos/${Date.now()}-${file.name}`;
      const result = await uploadFile(logoPath, file);
      
      updatePreferences({
        dayMode: preferences?.dayMode ?? true,
        customAppName: preferences?.customAppName || null,
        customLogoPath: result.url
      });
      
      toast.success('Logo uploaded successfully');
      setUploadError(null);
    } catch (error) {
      console.error('Logo upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      setUploadError(errorMessage);
      toast.error('Failed to upload logo');
    }

    // Reset input
    event.target.value = '';
  };

  const handleResetLogo = () => {
    try {
      updatePreferences({
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
                    src={preferences?.customLogoPath || '/assets/generated/icp-logo.png'} 
                    alt="Current Logo" 
                    className="h-16 w-16 object-contain border rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/generated/icp-logo.png';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a custom logo (PNG, JPG, JPEG, GIF, WebP - max 5MB)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Label htmlFor="logoUpload" className="cursor-pointer">
                        <Button asChild disabled={isUploading}>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Browse File'}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="logoUpload"
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleResetLogo}
                        disabled={!preferences?.customLogoPath || isUpdating}
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
