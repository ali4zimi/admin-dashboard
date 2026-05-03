import { toast } from 'vue-sonner'

export const useToast = () => ({
  success: (message: string, description?: string) =>
    toast.success(message, { description }),
  error: (message: string, description?: string) =>
    toast.error(message, { description }),
  info: (message: string, description?: string) =>
    toast(message, { description }),
  promise: toast.promise,
  raw: toast,
})
