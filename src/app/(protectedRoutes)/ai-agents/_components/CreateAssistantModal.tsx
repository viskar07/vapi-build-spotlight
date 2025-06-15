import { createAssistant } from '@/actions/vapi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

type Props = {
    isOpen: boolean,
    onClose: () => void,
}

const CreateAssistantModal = ({ isOpen, onClose }: Props) => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createAssistant(name)
            if (!res.success) {
                throw new Error('Something went wrong')
            }
            router.refresh();
            setName("");
            onClose();
            toast.success('Assistant created successfully')
            // @ts-ignore
        } catch (error) {
            // toast.error(error.message)
            console.log(error);
            
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
            <div className="bg-muted/80 rounded-lg w-full max-w-md p-6 border border-input shadow-xl">
                <div className="flex justify-between items-center mb-6 ">
                    <h2 className='text-xl font-semibold'>Create Assistant</h2>
                    <button
                        className='text-neutral-400 hover:text-white'
                        onClick={onClose}
                    >
                        <X className='h-5 w-5' />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className='block  font-medium mb-2' >Assistant Name</label>
                        <Input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Enter Assistant Name'
                            className='bg-neutral-800 border-neutral-700'
                            required
                        />
                        <p className='text-xs text-neutral-400 mt-2'>
                            This name will be used to identify the assistant.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                    <Button
                        type='button'
                        onClick={onClose}
                        variant={'outline'}

                    >
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={!name.trim() || loading}

                    >
                        {loading ? (
                            <>
                                <Loader2 className='mr-2 animate-spin' />
                                Creating...
                            </>
                        ): "Create Assistant"}
                    </Button>
                    </div>
                </form>
            </div>

        </div>
    )
}

export default CreateAssistantModal