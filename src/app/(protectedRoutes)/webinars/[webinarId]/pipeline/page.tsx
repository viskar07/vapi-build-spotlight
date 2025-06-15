import { getWebinarAttendance } from '@/actions/attendance';
import PageHeader from '@/components/ReuseableComponents/PageHeader';
import { AttendedTypeEnum } from '@prisma/client';
import { AlignLeft, HomeIcon, LeafIcon } from 'lucide-react';
import React from 'react'
import PipelineLayout from './_components/PipelineLayout';
import { formatColumnType } from '@/lib/utils';

type Props = {
    params: Promise<{
        webinarId: string;
    }>;
}

const Page = async(props: Props) => {

    const {webinarId} = await props.params;

    const pipelineData = await getWebinarAttendance(webinarId);

    if(!pipelineData.data){
      return (
        <div className="text 3xl h-[400px] flex justify-center items-center">
            No Pipelines Found
        </div>
      )
    }
    // TODO Show Real Data
  return (
    <div className='w-full flex flex-col gap-8'>
        <PageHeader 
            leftIcon={<HomeIcon className='w-3 h-3'/>}
            mainIcon={<AlignLeft className='w-12 h-12' />}
            rightIcon={<LeafIcon className='w-3 h-3'/>}
            heading='Keep Track Of all your Coustomers'
            placeholder='Search Name, Tag or Email'
      />
           <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
            {Object.entries(pipelineData.data).map(([columnType, columnData]) =>(
                <PipelineLayout
                    key={columnType}
                    title={formatColumnType(columnType as AttendedTypeEnum)}
                    count={columnData.count}
                    users={columnData.users}
                    tags={pipelineData.webinarTags}
                />
            ))}
           </div>

    </div>
  )
}

export default Page