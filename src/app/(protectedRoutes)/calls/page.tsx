import React from 'react'
import CallList from './_components/CallList'
import { getUserCalls } from '@/actions/call'
import { dummyCalls } from './_test/testdata'


const page = async() => {
  const calls = await getUserCalls()

  return (
    <div className='w-full flex flex-col gap-8'>  
         

        {/* Get All The calls  */}
        <CallList calls={calls} />  
        



      

    </div>
  )
}

export default page