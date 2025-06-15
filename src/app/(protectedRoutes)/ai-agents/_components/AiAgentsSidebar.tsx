'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAiAgentStore } from '@/store/useAiAgentStore'
import { Assistant } from '@vapi-ai/server-sdk/api'
import { PlusIcon, Search } from 'lucide-react'
import React, { useState } from 'react'
import CreateAssistantModal from './CreateAssistantModal'

type Props = {
    aiAgents: Assistant[] | []
}

const AiAgentsSidebar = ({aiAgents}: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {assistant,setAssistant} = useAiAgentStore()
  return (
    <div className='w-[300px] border-r border-border flex flex-col'>
        <div className="p-4">
            <Button
                className='w-full flex items-center gap-2 mb-2 hover:cursor-pointer'
                onClick={() => setIsModalOpen(true)}
                
            >
                <PlusIcon className='w-5 h-5'/>
                Create Assistant
            </Button>
            <div className="relative">
                <Input 
                    placeholder='Search Assistant...'
                    className='bg-neutral-900 border-neutral-700 pl-10'
                />
                <Search className='absolute left-3 top-2.5 h-4 w-4 text-neutral-400'/>
            </div>
        </div>

        <ScrollArea className='mt-4 overflow-auto'>
            {aiAgents.map((aiAssistant, index) => (
                <div 
                    className={`p-4 ${aiAssistant.id=== assistant?.id ? 'bg-primary/10' : ''} hover:bg-primary/20 cursor-pointer`}
                    key={index}
                    onClick={() => setAssistant(aiAssistant)}    
                >
                    <div className="font-medium">{aiAssistant.name}</div>
                </div>
            ) )}

        </ScrollArea>
        <CreateAssistantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
    </div>
  )
}

export default AiAgentsSidebar