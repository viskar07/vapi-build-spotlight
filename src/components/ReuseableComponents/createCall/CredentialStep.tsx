'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCallStore } from '@/store/useCallStore';
import { Check, } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { setupTwilioSIPTrunk } from '@/actions/vapi';
import { PhoneNumber } from '@/lib/type';
import { addVapiCallId } from '@/actions/call';

type Props = {
    VapiCallCredential: PhoneNumber[] | []
}

const CredentialStep = ({ VapiCallCredential }: Props) => {
  const {
    formData,
    updateCredentialField,
    getValidationStateErrors,
  } = useCallStore();

  const errors = getValidationStateErrors('credential');

  const { vapiCredential } = formData.credential;

  const [createNew, setCreateNew] = useState(false);
  const [twilioNumber, setTwilioNumber] = useState('');
  const [twilioGateway, setTwilioGateway] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [title,setTitle] = useState('')



  const handleSelectVapiAgents = (value: string) => {
    updateCredentialField('vapiCredential', value);
  };


  const handleCreateTwilioCredential = async () => {
    setIsLoading(true);
    try {
      const res = await setupTwilioSIPTrunk(twilioGateway,twilioNumber);
      if(res.error){
          toast.error('Something went Wrong.');
          
      }
      if(res.phoneNumberId){
      updateCredentialField('vapiCredential', res.phoneNumberId);
      const vapiCallId = await addVapiCallId(title,res.phoneNumberId)
    

      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>Create New Number Using Twillo</Label>
        <Switch checked={createNew} onCheckedChange={setCreateNew} />
      </div>

      {createNew ? (
        <>
          <div className="space-y-2">
            <Label>Title </Label>
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Twilio Phone Number (E.164 Format)</Label>
            <Input
              placeholder="+14155552671"
              value={twilioNumber}
              onChange={(e) => setTwilioNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Twilio Termination SIP URI</Label>
            <Input
              placeholder="your-trunk.pstn.twilio.com"
              value={twilioGateway}
              onChange={(e) => setTwilioGateway(e.target.value)}
            />
          </div>

          <Button onClick={handleCreateTwilioCredential} disabled={isLoading} variant={'outline'}>
            {isLoading ? 'Creating...' : vapiCredential? (
                <>
                    <Check className="h-4 w-4 mr-2 text-accent-primary" />
                    All set
                </>
            ):'Check Twilio Credential'}
          </Button>
        </>
      ) : (
        <div className="space-y-2">
          <Label>Select Your Number</Label>
         
          <Select value={vapiCredential} onValueChange={handleSelectVapiAgents}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a number" />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {VapiCallCredential.length > 0 ? (
                VapiCallCredential.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-id" disabled>
                  No Credential Found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

{errors.vapiCredential && (
          <p className="text-red-400 text-sm">{errors.vapiCredential}</p>
        )}
    </div>
  );
};

export default CredentialStep;
