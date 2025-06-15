import Link from 'next/link'
import React from 'react'

type Props = {
    icon: React.ReactNode,
    heading: string,
    link: string
}

const FeatureCard = (props: Props) => {
    return (
        <Link 
            href={props.link}
            className='px-8 py-6 flex flex-col items-center justify-center gap-14 rounded-xl border border-border bg-secondary backdrop-blur-xl'

        >
            {props.icon}
            <p className='font-semibold text-xl text-primary'>{props.heading}</p>
        </Link>
    )
}

export default FeatureCard