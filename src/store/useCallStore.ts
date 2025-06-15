import { Attendee } from '@prisma/client';
import { create } from 'zustand';

// ------------------ Types ------------------
export type AttendeeCall = {
  name: string;
  email: string;
  contactNo: number;
  id: string;
}[];

export type CallFormState = {
  credential: {
    vapiCredential?: string;
  };
  info: {
    agenda: string;
    description: string;
    aiAgent: string;
  };
  filterData: {
    attendee: AttendeeCall;
   
  };
};

type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

type CallValidationState = {
  credential: ValidationResult;
  info: ValidationResult;
  filterData: ValidationResult;
};

type CallStore = {
  isModalOpen: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  formData: CallFormState;
  validation: CallValidationState;

  setModalOpen: (open: boolean) => void;
  setComplete: (complete: boolean) => void;
  setSubmitting: (submitting: boolean) => void;

  updateCredentialField: <K extends keyof CallFormState['credential']>(
    field: K,
    value: CallFormState['credential'][K]
  ) => void;

  updateInfoField: <K extends keyof CallFormState['info']>(
    field: K,
    value: CallFormState['info'][K]
  ) => void;

  updateAttendeeField: (attendees: AttendeeCall) => void;



  validateStep: (stepId: keyof CallFormState) => boolean;
  getValidationStateErrors: (stepId: keyof CallFormState) => Record<string, string>;
  resetForm: () => void;
};

// ------------------ Validators ------------------
const validateCredential = (data: CallFormState['credential']): ValidationResult => ({
  valid: !!data.vapiCredential,
  errors: data.vapiCredential ? {} : { vapiCredential: 'Vapi Number Credential is required' },
});

const validateInfo = (data: CallFormState['info']): ValidationResult => {
  const errors: Record<string, string> = {};
  if (!data.agenda) errors.agenda = 'Agenda is required';
  if (!data.description) errors.description = 'Description is required';
  if (!data.aiAgent) errors.aiAgent = 'AI Agent is required';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateAttendee = (data: CallFormState['filterData']): ValidationResult => ({
  valid: data.attendee.length > 0,
  errors: data.attendee.length === 0 ? { attendee: 'Please select at least one attendee' } : {},
});

// ------------------ Initial State ------------------
const initialFormData: CallFormState = {
  credential: {
    vapiCredential: '',
  },
  info: {
    agenda: '',
    description: '',
    aiAgent: '',
  },
  filterData:{
    attendee:[]
  }
 
};

const initialValidation: CallValidationState = {
  credential: { valid: false, errors: {} },
  info: { valid: false, errors: {} },
  filterData: { valid: false, errors: {} },
};

// ------------------ Zustand Store ------------------
export const useCallStore = create<CallStore>((set, get) => ({
  isModalOpen: false,
  isCompleted: false,
  isSubmitting: false,
  formData: initialFormData,
  validation: initialValidation,

  setModalOpen: (open) => set({ isModalOpen: open }),
  setComplete: (complete) => set({ isCompleted: complete }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  updateCredentialField: (field, value) => {
    set((state) => {
      const updated = { ...state.formData.credential, [field]: value };
      const validationResult = validateCredential(updated);

      return {
        formData: {
          ...state.formData,
          credential: updated,
        },
        validation: {
          ...state.validation,
          credential: validationResult,
        },
      };
    });
  },

  updateInfoField: (field, value) => {
    set((state) => {
      const updated = { ...state.formData.info, [field]: value };
      const validationResult = validateInfo(updated);

      return {
        formData: {
          ...state.formData,
          info: updated,
        },
        validation: {
          ...state.validation,
          info: validationResult,
        },
      };
    });
  },

  updateAttendeeField: (attendees) => {
    set((state) => {
      const updated = {
        ...state.formData.filterData,
        attendee: attendees,
      };
      const validationResult = validateAttendee(updated);

      return {
        formData: {
          ...state.formData,
          filterData: updated,
        },
        validation: {
          ...state.validation,
          filterData: validationResult,
        },
      };
    });
  },



  validateStep: (stepId) => {
    const { formData } = get();
    let validationResult: ValidationResult;

    switch (stepId) {
      case 'credential':
        validationResult = validateCredential(formData.credential);
        break;
      case 'info':
        validationResult = validateInfo(formData.info);
        break;
      case 'filterData':
        validationResult = validateAttendee(formData.filterData);
        break;
    }

    set((state) => ({
      validation: {
        ...state.validation,
        [stepId]: validationResult,
      },
    }));

    return validationResult.valid;
  },

  getValidationStateErrors: (stepId) => get().validation[stepId].errors,

  resetForm: () =>
    set({
      isCompleted: false,
      isSubmitting: false,
      formData: initialFormData,
      validation: initialValidation,
    }),
}));
