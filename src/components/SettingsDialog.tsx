import React, { useState, useEffect } from 'react';
import { Settings, Key } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setApiKey, getApiKey, hasApiKey } from '@/lib/ai';
import { toast } from 'sonner';

export const SettingsDialog: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [key, setKey] = useState('');

    useEffect(() => {
        if (open) {
            setKey(hasApiKey() ? '••••••••••••••••••••••••••••••' : '');
        }
    }, [open]);

    const handleSave = () => {
        if (key && key !== '••••••••••••••••••••••••••••••') {
            setApiKey(key);
            toast.success('API key saved successfully!');
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary shrink-0">
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Configure your AI Assistant by providing a Google Gemini API Key.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="api-key" className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Gemini API Key
                        </Label>
                        <Input
                            id="api-key"
                            type="password"
                            placeholder="Enter your API key..."
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="col-span-3"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            You can get a free API key from Google AI Studio. The key is stored locally in your browser and never sent to our servers.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
