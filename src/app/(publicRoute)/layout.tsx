import React from 'react'

type Props = {
  children: React.ReactNode,
}

const layout = (props: Props) => {
  return (
    <div className='w-full container mx-auto min-h-screen '>{props.children}</div>
  )
}

export default layout