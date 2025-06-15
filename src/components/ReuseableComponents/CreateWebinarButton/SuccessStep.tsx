import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckIcon, Copy, ExternalLink, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

type Props = {
    webinarLink: string
    onCreateNew: () => void,
}

const SuccessStep = (props: Props) => {
    const [copied, setCopied] = useState(false);
    const handleCopyLink = () => {
        navigator.clipboard.writeText(props.webinarLink);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

  return (
    <div className='relative text-center space-y-6  py-8 px-6 '>
        <div className="flex items-center justify-center ">
            <div className="bg-green-500 rounded-full p-2">
                <CheckIcon className="w-6 h-6 text-white" />
            </div>
        </div>
        <h2 className='text-2xl font-bold '>
            Your webinar has been created successfully!
        </h2>
        <p className='text-sm text-muted-foreground'>
            Share your webinar link with your attendees to start the webinar.
        </p>
        <div className="relative flex items-center justify-center">
            <Input
              value={props.webinarLink}
              readOnly
              className="bg-muted border-input rounded-r-none"

            />
            <Button 
                onClick={handleCopyLink}
                variant='outline'
                className="rounded-l-none border-l-0 border-gray-800"
            >
                {copied ? (
                    <CheckIcon className="w-4 h-4 " />
                ):(
                    <Copy className="w-4 h-4" />
                ) }
            </Button>
        </div>

        <div className="mt-4 flex justify-center">
            <Link
                href={props.webinarLink}
                target='_blank'
            >
            <Button
                variant={'outline'}
                className={'border-muted text-primary hover:bg-input'}
            >
                <ExternalLink className='w-4 h-4 mr-2' />
                Preview Webinar
            </Button>
            </Link>
        </div>
        
        {
            props.onCreateNew && (
                <Button
                    variant={'outline'}
                    className={'border-gray-700 text-white hover:bg-gray-800'}
                    onClick={props.onCreateNew}
                >
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create New
                </Button>
            )
        }

    </div>
  )
}

export default SuccessStep