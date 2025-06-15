import {
  validateAdditionalInfo,
  validateBasicInfo,
  validateCTA,
  ValidationErrors,
} from "@/lib/type";
import { CtaTypeEnum } from "@prisma/client";
import { create } from "zustand";

type validationState = {
  basicInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };
  cta: {
    valid: boolean;
    errors: ValidationErrors;
  };
  additionalInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };
};

export type WebinarFormState = {
  basicInfo: {
    webinarName?: string;
    description?: string;
    date?: Date;
    time?: string;
    timeFormat?: "AM" | "PM";
    thumbnail?: string;
  };
  cta: {
    ctaLabel?: string;
    tags?: string[];
    ctaType: CtaTypeEnum;
    aiAgent?: string;
    priceId?: string;
  };
  additionalInfo: {
    lockChat?: boolean;
    couponCode?: string;
    couponEnabled?: boolean;
  };
};

interface WebinarStore {
  isModalOpen: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  formData: WebinarFormState;
  validation: validationState;

  setModalOpen: (open: boolean) => void;
  setComplete: (complete: boolean) => void;
  setSubmitting: (submitting: boolean) => void;

  updateBasicInfoFields: <K extends keyof WebinarFormState["basicInfo"]>(
    field: K,
    value: WebinarFormState["basicInfo"][K]
  ) => void;

  updateCtaFields: <K extends keyof WebinarFormState["cta"]>(
    field: K,
    value: WebinarFormState["cta"][K]
  ) => void;

  updateAdditionalInfoFields: <
    K extends keyof WebinarFormState["additionalInfo"]
  >(
    field: K,
    value: WebinarFormState["additionalInfo"][K]
  ) => void;

  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  validateStep: (stepId: keyof WebinarFormState) => boolean;

  getValidationStateErrors: (
    stepId: keyof WebinarFormState
  ) => ValidationErrors;

  resetForm: () => void;
}

const initialValidation: validationState = {
  basicInfo: {
    valid: false,
    errors: {},
  },
  cta: {
    valid: false,
    errors: {},
  },
  additionalInfo: {
    valid: false,
    errors: {},
  },
};

const initialFormData: WebinarFormState = {
  basicInfo: {
    webinarName: "",
    description: "",
    date: undefined,
    time: "",
    timeFormat: "AM",
    thumbnail: "",
  },
  cta: {
    ctaLabel: "",
    tags: [],
    ctaType: "BOOK_A_CALL",
    aiAgent: "",
    priceId: "",
  },
  additionalInfo: {
    lockChat: false,
    couponCode: "",
    couponEnabled: false,
  },
};

export const useWebinarStore = create<WebinarStore>((set, get) => ({
  isModalOpen: false,
  isCompleted: false,
  isSubmitting: false,
  formData: initialFormData,
  validation: initialValidation,

  setModalOpen: (open: boolean) => set({ isModalOpen: open }),
  setComplete: (complete: boolean) => set({ isCompleted: complete }),
  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  updateBasicInfoFields: (field, value) => {
    set((state) => {
      const newBasicInfo = { ...state.formData.basicInfo, [field]: value };
      const validationResult = validateBasicInfo(newBasicInfo);

      return {
        formData: {
          ...state.formData,
          basicInfo: newBasicInfo,
        },
        validation: {
          ...state.validation,
          basicInfo: validationResult,
        },
      };
    });
  },

  updateCtaFields: (field, value) => {
    set((state) => {
      const newCTA = { ...state.formData.cta, [field]: value };
      const validationResult = validateCTA(newCTA);

      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },
        validation: {
          ...state.validation,
          cta: validationResult,
        },
      };
    });
  },

  updateAdditionalInfoFields: (field, value) => {
    set((state) => {
      const newAdditionalInfo = {
        ...state.formData.additionalInfo,
        [field]: value,
      };
      const validationResult = validateAdditionalInfo(newAdditionalInfo);

      return {
        formData: {
          ...state.formData,
          additionalInfo: newAdditionalInfo,
        },
        validation: {
          ...state.validation,
          additionalInfo: validationResult,
        },
      };
    });
  },

  addTag: (tag: string) => {
    set((state) => {
      const newTags = [...(state.formData.cta.tags || []), tag];
      const newCTA = { ...state.formData.cta, tags: newTags };

      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },
      };
    });
  },

  removeTag: (tag: string) => {
    set((state) => {
      const newTags = (state.formData.cta.tags || []).filter((t) => t !== tag);
      const newCTA = { ...state.formData.cta, tags: newTags };

      return {
        formData: {
          ...state.formData,
          cta: newCTA,
        },
      };
    });
  },

  validateStep: (stepId: keyof WebinarFormState) => {
    const { formData } = get();
    let validationResult;

    switch (stepId) {
      case "basicInfo":
        validationResult = validateBasicInfo(formData.basicInfo);
        break;
      case "cta":
        validationResult = validateCTA(formData.cta);
        break;
      case "additionalInfo":
        validationResult = validateAdditionalInfo(formData.additionalInfo);
        break;
    }

    set((state) => {
      return {
        validation: {
          ...state.validation,
          [stepId]: validationResult,
        },
      };
    });
    return validationResult.valid;
  },

  getValidationStateErrors: (stepId) => {
    return get().validation[stepId].errors;
  },

  resetForm: () =>
    set({
      isCompleted: false,
      isSubmitting: false,
      formData: initialFormData,
      validation: initialValidation,
    }),
}));
