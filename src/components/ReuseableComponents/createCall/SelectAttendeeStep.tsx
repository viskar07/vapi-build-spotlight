'use client';

import { AttendeeCall, useCallStore } from '@/store/useCallStore';
import { AttendedTypeEnum } from '@prisma/client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useEffect, useState } from 'react';
import { AttendeeWithWebinarType } from '@/lib/type';

type Props = {
  attendee: AttendeeWithWebinarType[];
  webinarKeys: { id: string; name: string }[];
};

const attendeeTypeLabels: Record<AttendedTypeEnum, string> = {
  REGISTERED: "Registered",
  ATTENDED: "Attended",
  ADDED_TO_CART: "Added to Cart",
  FOLLOW_UP: "Follow Up",
  BREAKOUT_ROOM: "Breakout Room",
  CONVERTED: "Converted",
};

const SelectAttendeeStep = (props: Props) => {
  const {
    
    updateAttendeeField,

    
  } = useCallStore();

  const [selectedWebinar, setSelectedWebinar] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<AttendedTypeEnum | 'ALL'>('ALL');
  const [filtered, setFiltered] = useState<AttendeeCall>([]);

  const originalAttendees = props.attendee;

  useEffect(() => {
    const handleFilter = () => {
      if (originalAttendees.length === 0) return;

      let filteredData = [...originalAttendees];

      if (selectedType !== 'ALL') {
        filteredData = filteredData.filter(
          (att) => att.attendedType === selectedType
        );
      }

      if (selectedWebinar !== 'ALL') {
        filteredData = filteredData.filter(
          (att) => att.webinarId === selectedWebinar
        );
      }

      const mappedAttendees = filteredData.map((att) => ({
        id: att.attendeeId,
        name: att.name,
        email: att.email,
        contactNo: att.contactNo ?? 1234567890,
      }));

      setFiltered(mappedAttendees);
      updateAttendeeField(mappedAttendees);
    };

    handleFilter();
  }, [selectedType, selectedWebinar, originalAttendees, updateAttendeeField]);

  const showInitialError = originalAttendees.length === 0;
  const showFilteredError = originalAttendees.length > 0 && filtered.length === 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Select Webinar</Label>
        <Select value={selectedWebinar} onValueChange={(val) => setSelectedWebinar(val)}>
          <SelectTrigger className="w-full !bg-background/50 border border-input">
            <SelectValue>
              {selectedWebinar === 'ALL' ? 'All Webinars' : props.webinarKeys.find(w => w.id === selectedWebinar)?.name || 'Select Webinar'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-input max-h-48">
            <SelectItem value="ALL">All</SelectItem>
            {props.webinarKeys.map((web) => (
              <SelectItem key={web.id} value={web.id}>
                {web.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Attendee Type</Label>
        <Select
          value={selectedType}
          onValueChange={(val) => setSelectedType(val as AttendedTypeEnum | 'ALL')}
        >
          <SelectTrigger className="w-full !bg-background/50 border border-input">
            <SelectValue>
              {selectedType === 'ALL' ? 'All Types' : attendeeTypeLabels[selectedType]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-input max-h-48">
            <SelectItem value="ALL">All</SelectItem>
            {Object.values(AttendedTypeEnum).map((type) => (
              <SelectItem key={type} value={type}>
                {attendeeTypeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    

      {showInitialError && (
        <p className="text-red-500 text-sm mt-2">
          You don’t have any attendees.
        </p>
      )}
      {showFilteredError && (
        <p className="text-red-500 text-sm mt-2">
          No attendees found for the selected filters.
        </p>
      )}

      {filtered.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} attendee(s) found.
        </p>
      )}
    </div>
  );
};

export default SelectAttendeeStep;
