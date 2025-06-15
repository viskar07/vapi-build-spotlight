import React from 'react'
import OnBoarding from './_components/OnBoarding'
import { Upload, Webcam } from 'lucide-react'
import FeatureCard from './_components/FeatureCard'
import FeatureSectionLayout from '@/components/ReuseableComponents/LayoutsComponents/FeatureSectionLayout'
import Image from 'next/image'
import { potentialCustomer } from '@/lib/data'
import UserInfoCard from '@/components/ReuseableComponents/UserInfoCard'


const Pages = () => {
  return (
    <div className='w-full mx-auto h-full'>
      <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-14">
        <div className="space-y-6">
          <h2 className='text-primary font-semibold text-4xl'>
            Get Maximize Conversion From Your Webinar
          </h2>
          <OnBoarding />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-content-center ">
          <FeatureCard 
            icon={<Upload className='w-10 h-10' />}
            heading="Get the Recording of Your Webinar "
            link="/webinars/recordings"
          />
          <FeatureCard 
            icon={<Webcam className='w-10 h-10' />}
            heading="Review Your Complete Webinar Library "
            link="/webinars"
          />
        </div>
      </div>

      <div className="m-10 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl bg-background bg-background-10">
        <FeatureSectionLayout
          heading="See how far along are you potential customers "
          link="/lead"
        >
          <div className="p-5 flex flex-col gap-4 items-start border rounded-xl border-border backdrop-blur-3xl " > 
            <div className="w-full flex justify-between items-center gap-3">
              <p className='text-primary font-semibold text-sm'>  
                Conversation
              </p>
              <p className='text-xs text-muted-foreground font-normal' >
                50
              </p>
            </div>
            <div className="flex flex-col gap-4 items-start">
              {Array.from({length: 3}).map((_,index) =>(
                <Image
                  src="/featurecard.png"
                  className='w-full h-full rounded-xl object-cover'
                  height={250}
                  width={250}
                  alt="Info Card"
                  key={index}
                />
              ))}
            </div>
          </div>
        </FeatureSectionLayout>
        <FeatureSectionLayout
          heading="See the list of your current customers "
          link="/pipeline"
        > 
          <div className="flex gap-4 items-center h-full w-full justify-center relative flex-wrap">
            {potentialCustomer.slice(0,2).map((customer, index)=> (
              <UserInfoCard 
              // @ts-ignore
              customer={customer}
              key={index}
              tags={customer.tags}
              />
            ))}

            
            <Image
              src="/glowCard.png"
              className='absolute px-5 mb-28 hidden sm:flex backdrop-blur-[20px] rounded-xl object-cover'
              height={350}
              width={350}
              alt="Glow Card"
            />
          </div>
        </FeatureSectionLayout>
       
      </div>

    </div>
  )
}

export default Pages