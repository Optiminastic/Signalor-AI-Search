import { redirect } from 'next/navigation'

/** Merged into the Actions page — old links land on the unfiltered board. */
export default async function CatalystTasksPage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<never> {
  const { slug } = await params
  redirect(`/dashboard/${slug}/actions?view=all`)
}
