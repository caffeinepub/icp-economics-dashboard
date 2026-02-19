import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function QRCodeGenerator() {
  const [url, setUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const generateQRCode = () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      // Validate URL
      new URL(url);
      
      // Generate QR code using QR Server API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qrUrl);
      toast.success('QR code generated successfully');
    } catch (error) {
      toast.error('Please enter a valid URL');
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
      toast.success('QR code downloaded');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qrUrl">Enter URL</Label>
          <Input
            id="qrUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => e.key === 'Enter' && generateQRCode()}
          />
        </div>
        
        <Button onClick={generateQRCode} className="w-full">
          Generate QR Code
        </Button>

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt="Generated QR Code" 
                className="border rounded-lg shadow-sm"
              />
            </div>
            <Button 
              onClick={downloadQRCode} 
              variant="outline" 
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
