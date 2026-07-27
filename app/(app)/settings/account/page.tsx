'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { AppSidebar } from '@/features/site/components/navigation/app-sidebar'
import { SettingsNav } from '@/features/site/components/settings/settings-nav'
import { Button } from '@/features/site/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/site/components/ui/card'
import { Input } from '@/features/site/components/ui/input'
import { getOrFetchOnboardingToken } from '@/features/site/lib/api/onboarding-security'
import {
  createOrganization,
  deleteOrganization,
  getOrganizations,
  updateOrganization,
  type Organization,
} from '@/features/site/lib/api/organizations'
import { signOut, useSession } from '@/features/site/lib/auth-client'
import { routes } from '@/features/site/lib/config'
import { useOrgStore } from '@/features/site/lib/stores/org-store'
import { clearClientSession } from '@/lib/clearClientSession'

export default function AccountSettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const { setOrganizations } = useOrgStore()

  const [organizations, setLocalOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [deleteOrgDialog, setDeleteOrgDialog] = useState<{ id: number; name: string } | null>(null)
  const [deleteOrgConfirmText, setDeleteOrgConfirmText] = useState('')

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadOrganizations = useCallback(async () => {
    if (!email) return
    try {
      setLoading(true)
      const data = await getOrganizations(email)
      setLocalOrganizations(data)
      setOrganizations(data)
    } catch {
      setError('Failed to load organizations.')
    } finally {
      setLoading(false)
    }
  }, [email, setOrganizations])

  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  async function handleSignOut() {
    try {
      setSigningOut(true)
      await signOut()
      clearClientSession(queryClient)
      router.push(routes.signIn)
    } finally {
      setSigningOut(false)
    }
  }

  async function handleCreateOrg(e: FormEvent) {
    e.preventDefault()
    if (!email || !newName.trim()) return
    setCreating(true)
    setError(null)
    setNotice(null)
    try {
      // /organizations/onboard/ requires a single-use onboarding token.
      // Best-effort fetch — for active subscribers the server bypasses the
      // gate so the call still works even if Turnstile isn't available on
      // this page. TODO: add a TurnstileWidget here so free-tier users can
      // also reliably create additional orgs in environments where
      // TURNSTILE_SECRET is enabled.
      let onboardingToken: string | undefined
      try {
        onboardingToken = await getOrFetchOnboardingToken()
      } catch {
        /* surface server 401 below if the gate rejects */
      }

      const created = await createOrganization(
        {
          name: newName.trim(),
          url: newUrl.trim(),
          email,
        },
        onboardingToken,
      )
      const next = [created, ...organizations]
      setLocalOrganizations(next)
      setOrganizations(next)
      setNewName('')
      setNewUrl('')
      setNotice('Project created.')
    } catch {
      setError('Failed to create organization.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(org: Organization) {
    setEditingId(org.id)
    setEditName(org.name)
    setEditUrl(org.url ?? '')
    setError(null)
    setNotice(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditUrl('')
  }

  async function handleSaveOrg(id: number) {
    if (!editName.trim()) return
    setSavingId(id)
    setError(null)
    setNotice(null)
    try {
      const updated = await updateOrganization(id, {
        name: editName.trim(),
        url: editUrl.trim(),
      })
      const next = organizations.map(org => (org.id === id ? updated : org))
      setLocalOrganizations(next)
      setOrganizations(next)
      setEditingId(null)
      setNotice('Project updated.')
    } catch {
      setError('Failed to update organization.')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDeleteOrg(id: number) {
    setDeletingId(id)
    setDeleteOrgDialog(null)
    setDeleteOrgConfirmText('')
    setError(null)
    setNotice(null)
    try {
      await deleteOrganization(id)
      const next = organizations.filter(org => org.id !== id)
      setLocalOrganizations(next)
      setOrganizations(next)
      if (editingId === id) {
        cancelEdit()
      }
      setNotice('Project deleted.')
    } catch {
      setError('Failed to delete organization.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="border-border/60 bg-background/30 flex h-full w-full overflow-hidden border">
        <AppSidebar />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <SettingsNav />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Account</h1>
                <p className="text-muted-foreground mt-1">Manage your organizations and session.</p>
              </div>
              <Button variant="destructive" onClick={handleSignOut} disabled={signingOut}>
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>

            {error && (
              <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
                {error}
              </div>
            )}
            {notice && (
              <div className="border-success/40 bg-success/10 text-success rounded-md border p-3 text-sm">
                {notice}
              </div>
            )}

            <Card className="glass-card border-border/70">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Signed in as {email}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-border/70">
              <CardHeader>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>Edit name/URL or delete organizations from here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCreateOrg} className="grid gap-2 md:grid-cols-3">
                  <Input
                    placeholder="Project name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                  />
                  <Button type="submit" disabled={creating || !newName.trim()}>
                    {creating ? 'Creating...' : 'Add Project'}
                  </Button>
                </form>

                {loading ? (
                  <p className="text-muted-foreground text-sm">Loading organizations...</p>
                ) : organizations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No organizations found for this account.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {organizations.map(org => {
                      const isEditing = editingId === org.id
                      return (
                        <div
                          key={org.id}
                          className="border-border/70 bg-background/60 rounded-md border p-3"
                        >
                          {isEditing ? (
                            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
                              <Input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Project name"
                              />
                              <Input
                                value={editUrl}
                                onChange={e => setEditUrl(e.target.value)}
                                placeholder="https://example.com"
                              />
                              <Button
                                onClick={() => handleSaveOrg(org.id)}
                                disabled={savingId === org.id || !editName.trim()}
                              >
                                {savingId === org.id ? 'Saving...' : 'Save'}
                              </Button>
                              <Button variant="outline" onClick={cancelEdit}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{org.name}</p>
                                <p className="text-muted-foreground truncate text-xs">
                                  {org.url || 'No URL'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => startEdit(org)}>
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteOrgDialog({ id: org.id, name: org.name })
                                    setDeleteOrgConfirmText('')
                                  }}
                                  disabled={deletingId === org.id}
                                >
                                  {deletingId === org.id ? 'Deleting...' : 'Delete'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      {/* Delete Org Confirmation Dialog */}
      {deleteOrgDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border-border mx-4 w-full max-w-sm rounded-2xl border p-6 text-center shadow-xl">
            <h3 className="text-foreground mb-2 text-lg font-semibold">Delete project</h3>
            <p className="text-muted-foreground mb-4 text-left text-sm">
              This cannot be undone. Type the project name{' '}
              <strong className="text-foreground">&ldquo;{deleteOrgDialog.name}&rdquo;</strong> to
              confirm.
            </p>
            <label className="text-muted-foreground mb-1.5 block text-left text-xs font-medium">
              Project name
            </label>
            <input
              type="text"
              value={deleteOrgConfirmText}
              onChange={e => setDeleteOrgConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={deleteOrgDialog.name}
              className="border-border bg-background text-foreground focus:ring-primary/30 mb-4 w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (
                    !deleteOrgDialog ||
                    deleteOrgConfirmText.trim() !== deleteOrgDialog.name.trim()
                  )
                    return
                  handleDeleteOrg(deleteOrgDialog.id)
                }}
                disabled={deleteOrgConfirmText.trim() !== deleteOrgDialog.name.trim()}
                className="bg-destructive hover:bg-destructive flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
              >
                Delete project
              </button>
              <button
                onClick={() => {
                  setDeleteOrgDialog(null)
                  setDeleteOrgConfirmText('')
                }}
                className="border-border text-muted-foreground hover:bg-accent flex-1 rounded-xl border py-2.5 text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
