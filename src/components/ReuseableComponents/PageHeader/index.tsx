'use client';

import React, { useEffect, useState } from 'react';
import PurpleIcon from '../PurpleIcon';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Props<T> = {
  children?: React.ReactNode;
  leftIcon: React.ReactNode;
  mainIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  heading: string;
  placeholder: string;
  data?: T[]; // optional
  setFiltered?: (result: T[]) => void; // optional
  filterBy?: keyof T | (keyof T)[]; // optional
  showSearch? : boolean
};

const PageHeader = <T,>({
  data = [],
  filterBy,
  setFiltered,
  children,
  leftIcon,
  rightIcon,
  mainIcon,
  heading,
  placeholder,
  showSearch=true
}: Props<T>) => {
  const [search, setSearch] = useState('');

  // Normalize filterBy only if defined
  const filterKeys = filterBy
    ? Array.isArray(filterBy)
      ? filterBy
      : [filterBy]
    : [];

  useEffect(() => {
    if (!data.length || !filterBy || !setFiltered) return;

    const timeout = setTimeout(() => {
      const lowerSearch = search.toLowerCase();

      const filtered = data.filter((item) =>
        filterKeys.some((key) => {
          const value = item[key];
          return (
            typeof value === 'string' &&
            value.toLowerCase().includes(lowerSearch)
          );
        })
      );
      setFiltered(filtered);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, data, filterBy, setFiltered]);

  return (
    <div className='w-full flex flex-col gap-8'>
      <div className="w-full flex justify-center sm:justify-between items-center gap-8 flex-wrap">
        <p className='text-primary text-4xl font-semibold'>{heading}</p>

        <div className="relative md:mr-28">
          <PurpleIcon className='absolute -left-4 -top-3 -z-10 -rotate-45 py-3'>
            {leftIcon}
          </PurpleIcon>
          <PurpleIcon className='z-10 backdrop-blur'>
            {mainIcon}
          </PurpleIcon>
          <PurpleIcon className='absolute -right-4 -z-10 py-3 rotate-45 -top-3'>
            {rightIcon}
          </PurpleIcon>
        </div>
      </div>

      <div className="w-full flex flex-wrap gap-6 items-center justify-between">
        {showSearch && (
          <div className="w-full md:max-w-3/4 relative flex-1">
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500' />
          <Input
            type="text"
            placeholder={placeholder || 'Search ...'}
            className='pl-10 rounded-md'
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        )}
        <div className="md:max-w-1/4 w-full overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
