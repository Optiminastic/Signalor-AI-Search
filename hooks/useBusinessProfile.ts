'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { loadErrorMessage } from '@/features/catalyst/agent-approvals'
import {
  checkBusinessProfileNow,
  deleteBusinessPhoto,
  getBusinessProfile,
  PHOTO_MAX_BYTES,
  PHOTO_MIN_SIDE,
  saveBusinessDraft,
  suggestBusinessListing,
  uploadBusinessPhoto,
  type BusinessDraft,
  type BusinessProfileReport,
  type BusinessSuggestion,
  type PhotoKind,
} from '@/lib/api/agent-mode-business-profile'
import { AgentModeError } from '@/lib/api/agent-mode-request'
import { fitPhoto } from '@/lib/fit-photo'
import { queryKeys } from '@/lib/query-keys'

/** While a check runs, look again this often. */
const CHECKING_REFRESH_MS = 15_000
const TOO_BIG = 'That photo is too large to upload, even after shrinking it. Try another one.'

export interface PhotoUpload {
  file: File
  kind: PhotoKind
}

export interface BusinessProfile {
  report: BusinessProfileReport | null
  isLoading: boolean
  loadError: string | null
  checkNow: () => void
  checking: boolean
  saveDraft: (draft: BusinessDraft) => void
  saving: boolean
  saved: boolean
  suggest: () => Promise<BusinessSuggestion | null>
  suggesting: boolean
  uploadPhoto: (upload: PhotoUpload) => void
  uploading: boolean
  removePhoto: (photoId: number) => void
  /** The latest failed action's message, safe to show. */
  error: string | null
}

async function upload(
  orgSlug: string,
  { file, kind }: PhotoUpload,
): Promise<BusinessProfileReport> {
  const fitted = await fitPhoto(file, { maxBytes: PHOTO_MAX_BYTES, minSide: PHOTO_MIN_SIDE })
  if (!fitted) throw new AgentModeError(TOO_BIG, 413)
  return uploadBusinessPhoto(orgSlug, fitted, kind)
}

function firstError(...errors: (Error | null)[]): string | null {
  const error = errors.find(Boolean)
  return error ? loadErrorMessage(error) : null
}

export function useBusinessProfile(orgSlug: string): BusinessProfile {
  const queryClient = useQueryClient()
  const key = queryKeys.agentMode.businessProfile(orgSlug)
  const store = (report: BusinessProfileReport): void => {
    queryClient.setQueryData(key, report)
  }
  const query = useQuery({
    queryKey: key,
    queryFn: () => getBusinessProfile(orgSlug),
    enabled: Boolean(orgSlug),
    refetchInterval: q => (q.state.data?.checking ? CHECKING_REFRESH_MS : false),
  })
  const check = useMutation({
    mutationFn: () => checkBusinessProfileNow(orgSlug),
    onSuccess: store,
  })
  const save = useMutation({
    mutationFn: (draft: BusinessDraft) => saveBusinessDraft(orgSlug, draft),
    onSuccess: store,
  })
  const suggest = useMutation({ mutationFn: () => suggestBusinessListing(orgSlug) })
  const add = useMutation({ mutationFn: (u: PhotoUpload) => upload(orgSlug, u), onSuccess: store })
  const remove = useMutation({
    mutationFn: (photoId: number) => deleteBusinessPhoto(orgSlug, photoId),
    onSuccess: store,
  })
  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    loadError: query.error ? loadErrorMessage(query.error) : null,
    checkNow: () => check.mutate(),
    checking: check.isPending,
    saveDraft: draft => save.mutate(draft),
    saving: save.isPending,
    saved: save.isSuccess,
    suggest: () => suggest.mutateAsync().catch(() => null),
    suggesting: suggest.isPending,
    uploadPhoto: u => add.mutate(u),
    uploading: add.isPending,
    removePhoto: id => remove.mutate(id),
    error: firstError(check.error, save.error, suggest.error, add.error, remove.error),
  }
}
