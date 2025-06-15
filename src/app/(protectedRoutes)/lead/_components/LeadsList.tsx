'use client'
import PageHeader from '@/components/ReuseableComponents/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartNoAxesCombinedIcon, HomeIcon, LeafIcon } from 'lucide-react'
import React, { useState } from 'react'

type Props = {
    leads:{
        name: string;
        email: string;
        phone: string;
        tags: string[];
    }[]
}

const LeadsList = ({leads}: Props) => {

    const [filtered, setFiltered] = useState(leads);


  return (
    <div className='w-full flex flex-col gap-8'>
            <PageHeader 
            leftIcon={<HomeIcon className='w-3 h-3'/>}
            mainIcon={<ChartNoAxesCombinedIcon className='w-12 h-12' />}
            rightIcon={<LeafIcon className='w-3 h-3'/>}
            heading='The Home to all your customers'
            placeholder='Search customers...'
            setFiltered={setFiltered}
            filterBy={['email','phone','tags']}
            data={leads}

        />
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className='text-sm text-muted-foreground'>Name</TableHead>
                    <TableHead className='text-sm text-muted-foreground'>Email</TableHead>
                    <TableHead className='text-sm text-muted-foreground'>Phone</TableHead>
                    <TableHead className='text-sm text-muted-foreground'>Tags</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filtered?.map((lead, index) => (
                    <TableRow key={index} className='border-0'>
                        <TableCell className='font-medium'>{lead.name}</TableCell>
                        <TableCell className='font-medium'>{lead.email}</TableCell>
                        <TableCell className='font-medium'>{lead.phone}</TableCell>
                        <TableCell className='font-medium'>{
                                lead.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline">{tag}</Badge>
                                ))
                            }</TableCell>
                    </TableRow>

                ))}
            </TableBody>
        </Table>

    </div>
  )
}

export default LeadsList