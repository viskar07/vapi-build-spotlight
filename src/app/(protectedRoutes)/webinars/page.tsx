import { onAuthenticatedUser } from '@/actions/auth'
import { getWebinarsByPresenterId } from '@/actions/webinar'
import PageHeader from '@/components/ReuseableComponents/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Webinar } from '@prisma/client'
import { HomeIcon, LeafIcon, Webcam } from 'lucide-react'
import { redirect } from 'next/navigation'
import React from 'react'
import WebinarCard from './_components/WebinarCard'
import WebinarList from './_components/WebinarList'


type Props = {
    searchParams: Promise<{
        search: string
    }>
}
const Page = async( ) => {

    const checkUser =  await onAuthenticatedUser();
    if(!checkUser.user){
        redirect('/login')
    }

    const webinars = await getWebinarsByPresenterId(checkUser?.user.id);
  return (
  
    <WebinarList webinars={webinars}/>
)

}

export default Page