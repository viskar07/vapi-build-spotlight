// app/calls/[callId]/page.tsx
import { getAttendeesWithResponseByCallId } from '@/actions/call'
import AttendeeCallTable from '../_components/AttendeeCallTable'
import { dummyAttendeeWithResponse } from '../_test/testdata'

type Props = {
    params: {
      callId: string
    }
  }

const Page = async ({ params }: Props) => {
  const { callId } =  params
  const attendeeWithResponse = await getAttendeesWithResponseByCallId(callId)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Call Responses</h1>
      <AttendeeCallTable data={attendeeWithResponse} />
    </div>
  )
}

export default Page
