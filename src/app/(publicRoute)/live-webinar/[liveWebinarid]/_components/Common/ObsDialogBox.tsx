import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rtmpURL: string;
    streamKey: string;
}

const ObsDialogBox = ({ open, onOpenChange, rtmpURL, streamKey }: Props) => {

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard`);

        } catch (e) {
            toast.error(`Failed to copy ${label} to clipboard`);
        }
    }
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>OBS Streming Credentials</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 ">
                    <div className="space-y-2">
                        <label className='text-sm font-medium'>
                            RTMP URL
                        </label>
                        <div className="flex">
                            <Input
                                className='flex-1'
                                value={rtmpURL}
                                readOnly
                            />

                            <Button
                                variant='outline'
                                className='ml-2'
                                size={'icon'}
                                onClick={() => copyToClipboard(rtmpURL, 'RTMP URL')}

                            >
                                <Copy size={16} />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className='text-sm font-medium'>
                            Stream Key
                        </label>
                        <div className="flex">
                            <Input
                                className='flex-1'
                                value={streamKey}
                                readOnly
                                type='password'
                            />

                            <Button
                                variant='outline'
                                className='ml-2'
                                size={'icon'}
                                onClick={() => copyToClipboard(streamKey, 'Stream Key')}

                            >
                                <Copy size={16} />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            This is your persnoal stream key. Do not share this with anyone.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ObsDialogBox