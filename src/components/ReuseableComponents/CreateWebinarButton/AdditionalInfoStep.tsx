import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useWebinarStore } from '@/store/useWebinarStore';
import { Info } from 'lucide-react';
import React from 'react'


const AdditionalInfoStep = () => {
    const { formData, updateAdditionalInfoFields, getValidationStateErrors } = useWebinarStore();
    const { lockChat,couponEnabled ,couponCode} = formData.additionalInfo;
    const errors = getValidationStateErrors("additionalInfo");

    const handleToggleLockChat = (checked: boolean) => {
        updateAdditionalInfoFields('lockChat', checked);
    }
    const handleCoupenEnabled = (checked: boolean) => {
        updateAdditionalInfoFields('couponEnabled', checked);
    }
    const handleCoupenCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateAdditionalInfoFields('couponCode', e.target.value);
    }
    
    return (
        <div className='space-y-8'>
            <div className="flex items-center justify-between">
                <div className="">
                    <Label htmlFor='lock-chat' className='text-base font-medium' >
                        Lock Chat
                    </Label>
                    <p className='text-sm text-gray-400'>
                        Turn it on to make chat visible to only attendees of your webinar.
                    </p>
                </div>
                <Switch
                    id='lock-chat'
                    checked={lockChat || false}
                    onCheckedChange={handleToggleLockChat}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="">
                        <Label htmlFor='coupen-enabled' className='text-base font-medium' >
                            Coupen Enabled
                        </Label>
                        <p className='text-sm text-gray-400'>
                            Turn it on to offer discount to your attendees.
                        </p>
                    </div>
                    <Switch
                        id='coupen-enabled'  
                        checked={couponEnabled || false}
                        onCheckedChange={handleCoupenEnabled}
                    />
                </div>
                {couponEnabled && (
                    <div className="space-y-2">
                        <Input 
                            id='coupen-code'
                            value={couponCode}
                            onChange={handleCoupenCodeChange}
                            placeholder='Paste your coupen code here'
                            className={cn('!bg-background/50 border border-input ',
                                errors.couponCode && 'border-red-400 focus-visible:ring-red-400' 
                            )}
                        />
                        {errors.couponCode && (
                            <p className='text-red-400 text-sm'>
                                {errors.couponCode}
                            </p>
                        )}
                        <div className="flex item-start gap-2 text-sm text-gray-400 mt-2">
                            <Info className='h-4 w-4 mt-0.5'/>
                            <p>
                                This coupen code can be used to promote a sale. Users can use this for the buy now CTA
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>

    )
}

export default AdditionalInfoStep