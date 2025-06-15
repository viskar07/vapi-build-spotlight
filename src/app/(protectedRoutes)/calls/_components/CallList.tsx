'use client';

import PageHeader from '@/components/ReuseableComponents/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calls } from '@prisma/client';
import { HomeIcon, PhoneCall, Bot, Phone } from 'lucide-react';
import React, { useState } from 'react';
import CallCard from './CallCard';

type Props = {
  calls: Calls[];
};

const CallList = ({ calls }: Props) => {
  const [filtered, setFiltered] = useState<Calls[]>(calls);

  return (
    <Tabs defaultValue="all">
      <PageHeader
        leftIcon={<HomeIcon className="w-3 h-3" />}
        mainIcon={<PhoneCall className="w-12 h-12" />}
        rightIcon={<Phone className="w-3 h-3" />}
        heading="Your Call "
        placeholder="Search calls..."
        setFiltered={setFiltered}
        filterBy="agenda"
        data={calls}
      >
        <TabsList className="bg-transparent space-x-3">
          <TabsTrigger
            value="all"
            className="bg-secondary opacity-50 data-[state=active]:opacity-100 px-8 py-4"
          >
            All
          </TabsTrigger>
          <TabsTrigger value="recent" className="bg-secondary px-8 py-4">
            Recent
          </TabsTrigger>
          <TabsTrigger value="archived" className="bg-secondary px-8 py-4">
            Archived
          </TabsTrigger>
        </TabsList>
      </PageHeader>

      <TabsContent
        value="all"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start mt-4 place-content-start gap-x-6 gap-y-10"
      >
        {filtered?.length > 0 ? (
          filtered.map((call, index) => <CallCard key={index} call={call} />)
        ) : (
          <div className="w-full col-span-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl">
            No Calls Found
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="recent"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start mt-4 place-content-start gap-x-6 gap-y-10"
      >
        {filtered?.length > 0 ? (
          filtered
            .filter((call) => {
              const createdAt = new Date(call.createdAt);
              const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return createdAt > oneWeekAgo;
            })
            .map((call, index) => <CallCard key={index} call={call} />)
        ) : (
          <div className="w-full col-span-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl">
            No Recent Calls Found
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="archived"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start mt-4 place-content-start gap-x-6 gap-y-10"
      >
        {filtered?.length > 0 ? (
          filtered
            .filter((call) => {
              const createdAt = new Date(call.createdAt);
              const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return createdAt < oneWeekAgo;
            })
            .map((call, index) => <CallCard key={index} call={call} />)
        ) : (
          <div className="w-full col-span-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl">
            No Archived Calls Found
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CallList;
