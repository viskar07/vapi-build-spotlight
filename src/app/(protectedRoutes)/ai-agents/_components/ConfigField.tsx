
import { Info } from 'lucide-react';
import React from 'react'

type Props = {
    label: string;
    showInfo?: boolean;
    children: React.ReactNode;
}

const ConfigField = ({label, showInfo, children}: Props) => {

  return (
        <div className="">
            <div className="flex items-center mb-2">
                <p className="font-medium ">{label}</p>
                {showInfo && <Info className="ml-2 text-neutral-500 ml-2"/>}
            </div>
            {children}
        </div>
  )
}

export default ConfigField