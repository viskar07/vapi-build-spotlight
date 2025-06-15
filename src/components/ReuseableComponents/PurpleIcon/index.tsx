import { cn } from '@/lib/utils';
import React from 'react'

type Props = {
    children: React.ReactNode;
    className?: string;
}

const PurpleIcon = (props: Props) => {
  return (
    <div className={cn('px-4 py-2 iconBackground',props.className)}>
      {props.children}
    </div>
  )
}

export default PurpleIcon