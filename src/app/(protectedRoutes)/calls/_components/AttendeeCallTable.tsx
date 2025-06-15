// components/tables/attendee-call-table.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import Link from "next/link"

type Props = {
  data: {
    attendee: {
      id: string
      email: string
      name: string
      contactNo: number | null
    }
    response: {
      id: string
      startTime: Date
      endTime: Date
      summary: string
      recordingUrl: string
      fullTranscript: string
      endReason: string
    }
  }[]
}

const AttendeeCallTable = ({ data }: Props) => {
  return (
    <div className="rounded-xl border shadow-sm overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attendee</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact No</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>End Reason</TableHead>
            <TableHead>Recording</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.response.id}>
              <TableCell>{item.attendee.name}</TableCell>
              <TableCell>{item.attendee.email}</TableCell>
              <TableCell>{item.attendee.contactNo ?? 'N/A'}</TableCell>
              <TableCell>{format(new Date(item.response.startTime), 'Pp')}</TableCell>
              <TableCell>{format(new Date(item.response.endTime), 'Pp')}</TableCell>
              <TableCell className="max-w-[200px] truncate">{item.response.summary}</TableCell>
              <TableCell>{item.response.endReason}</TableCell>
              <TableCell>
                <Link
                  href={item.response.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                    <Button
                        variant={'outline'}
                    >
                  View

                    </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default AttendeeCallTable
