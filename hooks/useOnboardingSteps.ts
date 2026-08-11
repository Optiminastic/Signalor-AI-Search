'use client'

import { useMemo } from 'react'

import { useActiveProject } from '@/hooks/useActiveProject'
import { useAgencyMembers } from '@/hooks/useAgencyMembers'
import { useAgencyRole } from '@/hooks/useAgencyRole'
import { useAgentPlan } from '@/hooks/useAgentPlan'
import { useAutoFix } from '@/hooks/useAutoFix'
import { useBrandPath } from '@/hooks/useBrandPath'
import { useBrandProfile } from '@/hooks/useBrandProfile'
import { useIntegrations } from '@/hooks/useIntegrations'
import { usePrompts } from '@/hooks/usePrompts'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  cta: string
  href: string
  done: boolean
}

interface UseOnboardingResult {
  steps: OnboardingStep[]
  completed: number
  total: number
  allDone: boolean
  isLoading: boolean
}

interface StepContext {
  brandPath: (sub?: string) => string
  hasData: boolean
  connected: Set<string>
  profileApproved: boolean
  hasCustomPrompt: boolean
  fixConnected: boolean
  taskDone: boolean
  showInvite: boolean
  hasMembers: boolean
}

function coreSteps(ctx: StepContext): OnboardingStep[] {
  return [
    {
      id: 'analysis',
      title: 'Run your first analysis',
      description: 'Score your site across the six GEO pillars in about two minutes.',
      cta: 'Go to dashboard',
      href: ctx.brandPath(''),
      done: ctx.hasData,
    },
    {
      id: 'google-analytics',
      title: 'Connect Google Analytics',
      description: 'See how much traffic AI engines send you and where it lands.',
      cta: 'Connect GA4',
      href: ctx.brandPath('integrations'),
      done: ctx.connected.has('google-analytics'),
    },
    {
      id: 'search-console',
      title: 'Connect Search Console',
      description: 'Track impressions, indexing and search performance.',
      cta: 'Connect GSC',
      href: ctx.brandPath('integrations'),
      done: ctx.connected.has('search-console'),
    },
    {
      id: 'brand-profile',
      title: 'Complete your brand profile',
      description: 'Confirm what your brand does so recommendations stay on point.',
      cta: 'Review profile',
      href: ctx.brandPath('brand-profile'),
      done: ctx.profileApproved,
    },
  ]
}

function growthSteps(ctx: StepContext): OnboardingStep[] {
  const steps: OnboardingStep[] = [
    {
      id: 'track-prompt',
      title: 'Track your own prompt',
      description: 'Add a prompt your buyers ask and watch every AI engine answer it.',
      cta: 'New prompt',
      href: `${ctx.brandPath('visibility')}?tab=prompts`,
      done: ctx.hasCustomPrompt,
    },
    {
      id: 'auto-fix',
      title: 'Connect your site for auto-fix',
      description: 'Link GitHub, WordPress or Shopify so fixes apply themselves.',
      cta: 'Open integrations',
      href: ctx.brandPath('integrations'),
      done: ctx.fixConnected,
    },
    {
      id: 'first-action',
      title: 'Complete your first action',
      description: 'Knock out one Growth Agent action and bank its score points.',
      cta: 'Open actions',
      href: ctx.brandPath('actions'),
      done: ctx.taskDone,
    },
  ]
  if (ctx.showInvite) {
    steps.push({
      id: 'invite',
      title: 'Invite a teammate',
      description: 'Assign actions to teammates and share the workload.',
      cta: 'Manage team',
      href: '/profile',
      done: ctx.hasMembers,
    })
  }
  return steps
}

/**
 * The dashboard onboarding checklist. Completion is derived from real state
 * (a completed run, connected integrations, an approved brand profile, tracked
 * prompts, done tasks, teammates) so the list reflects reality — no manual
 * ticking. All sources are queries the dashboard already fetches.
 */
export function useOnboardingSteps(): UseOnboardingResult {
  const { email, slug, orgSlug, hasData, activeOrg } = useActiveProject()
  const brandPath = useBrandPath()
  const { connected, isLoading: intLoading } = useIntegrations()
  const { data: profile, isLoading: profileLoading } = useBrandProfile(orgSlug, email)
  const { data: promptData } = usePrompts(slug)
  const autofix = useAutoFix({ slug, email, orgId: activeOrg?.id })
  const { plan } = useAgentPlan()
  const { isAdmin } = useAgencyRole()
  const { members } = useAgencyMembers(isAdmin)

  return useMemo(() => {
    const ctx: StepContext = {
      brandPath,
      hasData,
      connected,
      profileApproved: profile?.status === 'approved',
      hasCustomPrompt: promptData?.hasCustomPrompt ?? false,
      fixConnected: autofix.connected,
      taskDone: (plan?.counts.done ?? 0) > 0,
      showInvite: isAdmin,
      hasMembers: members.length > 0,
    }
    const steps = [...coreSteps(ctx), ...growthSteps(ctx)]
    const completed = steps.filter(s => s.done).length
    return {
      steps,
      completed,
      total: steps.length,
      allDone: completed === steps.length,
      isLoading: intLoading || profileLoading,
    }
  }, [
    brandPath,
    hasData,
    connected,
    profile,
    promptData,
    autofix.connected,
    plan,
    isAdmin,
    members,
    intLoading,
    profileLoading,
  ])
}
