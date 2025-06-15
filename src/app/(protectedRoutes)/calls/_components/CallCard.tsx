'use client';

import { Calls } from '@prisma/client';
import { AlignLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {
  call: Calls;
};

const CallCard = ({ call }: Props) => {
  return (
    <div className="flex gap-3 flex-col items-start w-full transform transition-transform duration-300 ease-in-out hover:scale-102">
      <Link
        href={`/calls/${call.id}`}
        className="w-full max-w-[400px]"
      >
        <Image
          src="/darkthumbnail.png" // 👈 Use your actual default image path
          width={400}
          height={100}
          alt={call.agenda}
          className="rounded-md w-[400px] h-[200px] object-cover overflow-hidden"
        />
      </Link>

      <div className="w-full flex justify-between gap-3 items-center">
        <Link
          href={`/calls/${call.id}`}
          className="flex flex-col gap-2 items-start"
        >
          <div>
            <p className="text-sm text-primary font-semibold">
              {call.agenda}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {call.description || 'No description provided.'}
            </p>
          </div>
        </Link>

        <Link
          href={`/calls/${call.id}/responses`}
          className="flex px-3 py-2 rounded-md border-[0.5px] border-border bg-secondary"
        >
          <AlignLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default CallCard;
