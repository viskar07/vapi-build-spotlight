import { Attendee, Webinar, User, AttendedTypeEnum } from '@prisma/client'

export type ValidationErrors = Record<string, string>

export type ValidationResult = {
  valid: boolean
  errors: ValidationErrors
}

export const validateBasicInfo = (data: {
  webinarName?: string
  description?: string
  date?: Date
  time?: string
  timeFormat?: 'AM' | 'PM'
}): ValidationResult => {
  const errors: ValidationErrors = {}

  if (!data.webinarName?.trim()) {
    errors.webinarName = 'Webinar name is required'
  }

  if (!data.description?.trim()) {
    errors.description = 'Description is required'
  }

  if (!data.date) {
    errors.date = 'Date is required'
  }

  if (!data.time?.trim()) {
    errors.time = 'Time is required'
  } else {
    // Validate time format (HH:MM)
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/
    if (!timeRegex.test(data.time)) {
      errors.time = 'Time must be in format HH:MM (e.g., 10:30)'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateCTA = (data: {
  ctaLabel?: string
  tags?: string[]
  ctaType: string
  aiAgent?: string
  priceId?:string
}): ValidationResult => {
  const errors: ValidationErrors = {}

  if (!data.ctaLabel?.trim()) {
    errors.ctaLabel = 'CTA label is required'
  }

  if (!data.ctaType) {
    errors.ctaType = 'Please select a CTA type'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateAdditionalInfo = (data: {
  lockChat?: boolean
  couponCode?: string
  couponEnabled?: boolean
}): ValidationResult => {
  const errors: ValidationErrors = {}

  
  // If coupon is enabled, code is required
  if ( data.couponEnabled && !data.couponCode?.trim() ) {
    errors.couponCode = 'Coupon code is required when enabled'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}





export type AttendanceData = {
  count: number
  users: Attendee[]
}

export type WebinarWithPresenter = Webinar & {
  presenter: User
}

export type StreamCallRecording = {
  filename: string
  url: string
  start_time: Date
  end_time: Date
  session_id: string
}

export interface PhoneNumber {
  id: string;
  vapiCallCredential: string;
  name: string;
  // add other fields as needed
}

export type AttendeeWithWebinarType = {
  attendeeId: string;
  name: string;
  email: string;
  contactNo: number | null;
  webinarId: string;
  webinarTitle?: string; // optional if title is included
  attendedType: AttendedTypeEnum;
  joinedAt: Date;
  leftAt: Date | null;
};



export interface CallRecord {
  callId: string;
  startTime: Date;
  endTime: Date;
  summary: string;
  recordingUrl: string;
  fullTranscript: string;
  endReason: string;

}
