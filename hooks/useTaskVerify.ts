'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useActiveProject } from '@/hooks/useActiveProject'
import { verifyAction } from '@/lib/api/tasks'

interface UseTaskVerifyResult {
  verify: () => void
  verifying: boolean
}

/**
 * Re-crawls the live site to confirm a task's finding is actually resolved. On a
 * pass the backend flips the task to `verified`; either way the reason is toasted
 * and the task queries are invalidated so the status/badge refresh.
 */
export function useTaskVerify(taskId: number): UseTaskVerifyResult {
  const queryClient = useQueryClient()
  const { email } = useActiveProject()
  const toastId = `verify-${taskId}`

  const mutation = useMutation({
    mutationFn: () => verifyAction(taskId, email),
    onMutate: () => {
      toast.loading('Checking your live site to confirm the fix…', { id: toastId })
    },
    onSuccess: result => {
      if (result.verified) {
        toast.success(result.message || 'Verified — the fix is live on your site.', {
          id: toastId,
          duration: 5000,
        })
      } else {
        toast.error(result.message || 'Not resolved yet — the issue is still present.', {
          id: toastId,
          duration: 6000,
        })
      }
      void queryClient.invalidateQueries({ queryKey: ['catalyst', 'tasks'] })
    },
    onError: () => toast.error('Could not verify right now. Please try again.', { id: toastId }),
  })

  return { verify: () => mutation.mutate(), verifying: mutation.isPending }
}
