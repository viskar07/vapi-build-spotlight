'use client'
import PageHeader from '@/components/ReuseableComponents/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WebinarWithPresenter } from '@/lib/type'
import { Webinar } from '@prisma/client'
import { HomeIcon, LeafIcon, Webcam } from 'lucide-react'
import React, { useState } from 'react'
import WebinarCard from './WebinarCard'

type Props = {
    webinars: Webinar[]
}

const WebinarList = ({webinars}: Props) => {


    const [filtered, setFiltered] = useState<Webinar[]>(webinars);


  return (
    <Tabs defaultValue='all'
    
    >
        <PageHeader 
            leftIcon={<HomeIcon className='w-3 h-3'/>}
            mainIcon={<Webcam className='w-12 h-12' />}
            rightIcon={<LeafIcon className='w-3 h-3'/>}
            heading='The Home to all your webinar'
            placeholder='Search option..'
            setFiltered={setFiltered}
            filterBy={'title'}
            data={webinars}
        >
            <TabsList className='bg-transparent space-x-3'>
                <TabsTrigger value='all'
                className='bg-secondary opacity-50 data-[state=active]:opacity-100 px-8 py-4'
                >   All</TabsTrigger>
                <TabsTrigger value='upcoming' className='bg-secondary px-8 py-4'> Upcoming</TabsTrigger>
                <TabsTrigger value='ended' className='bg-secondary px-8 py-4'> Ended</TabsTrigger>
            </TabsList>
        </PageHeader>

        <TabsContent
            value='all'
            className='w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start mt-4 place-content-start gap-x-6 gap-y-10'
        >
            {filtered?.length > 0 ? (
                filtered?.map((webinar : Webinar, index: number) => (
                    <WebinarCard key={index} webinar={webinar} />
                ))
            ):(
                <div className="w-full col-span-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-sapn-12">
                    No Webinars Found
                </div>
            )}
        </TabsContent>

        
        <TabsContent
            value='upcoming'
            className='w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start mt-4 place-content-start gap-x-6 gap-y-10'
        >
            {filtered?.length > 0   ? (
                filtered?.map((webinar : Webinar, index: number) => {
                    if(webinar.startTime > new Date()){
                        return <WebinarCard key={index} webinar={webinar} />
                    }
                }
                )
            ):(
                <div className="w-full col-span-full h-[200px] flex justify-center items-center text-primary font-semibold text-center text-2xl col-sapn-12">
                    No Webinars Found
                </div>
            )
            }
        </TabsContent>
        <TabsContent
            value='ended'
            className='w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start mt-4 place-content-start gap-x-6 gap-y-10'
        >
            {filtered?.length > 0   ? (
                filtered?.map((webinar : Webinar, index: number) => {
                    if(webinar.startTime < new Date()){
                        return <WebinarCard key={index} webinar={webinar} />
                    }
                }
                )
            ):(
                <div className="col-span-full w-full h-[200px] flex justify-center items-center text-center text-primary font-semibold text-2xl col-sapn-12">
                    No Webinars Found
                </div>
            )
            }
        </TabsContent>

    </Tabs>
  )
}

export default WebinarList