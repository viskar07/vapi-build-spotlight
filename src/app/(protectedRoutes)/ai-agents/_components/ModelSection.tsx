import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings } from 'lucide-react'
import React from 'react'
import ModelConfiguration from './ModelConfiguration'

const ModelSection = () => {
  return (
    <div className='p-8 flex-1 overflow-auto'>
        <div className="flex items-center ga-2 mb-4">
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-sx">
                <Settings />
            </span>
            <span className="uppercase text-sm font-medium">
                MODEL
            </span>
        </div>

        <ScrollArea>
            <ModelConfiguration />
        </ScrollArea>

    </div>
  )
}

export default ModelSection