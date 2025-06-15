import { getAllAttendeeLeads } from '@/actions/attendance'

import React from 'react'
import LeadsList from './_components/LeadsList'




const page = async () => {

    const leadData = await getAllAttendeeLeads()
    
  return (
   <LeadsList leads={leadData}/>
  )
}

export default page