import { MoveRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
    children: React.ReactNode
    heading: string
    link: string
    className?: string
}

const FeatureSectionLayout = (props: Props) => {
  return (
    <div className={`p-10 flex items-center justify-between flex-col gap-10 border rounded-3xl border-border bg-background-10 ${props.className}`}>
        {props.children}

        <div className="w-full justify-between items-center flex flex-wrap gap-10">
            <h3 className='sm:w-[70%] font-semibold text-3xl text-primary' >
                {props.heading}
            </h3>
            <Link
                href={props.link}
                className='text-primary font-semibold texl-lg flex items-center justify-centerrounded-md opacity-50'
            >
                View <MoveRightIcon className='ml-2 w-6 h-6'/>
            </Link>
        </div>

    </div>
  )
}

export default FeatureSectionLayout