import { AttendedTypeEnum } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatColumnType =(columnType: AttendedTypeEnum):string => {
  return columnType
          .split('_')
         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
         .join(' ')
}
