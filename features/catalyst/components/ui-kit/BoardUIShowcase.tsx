'use client'

import { RiHeartLine, RiSearchLine } from '@remixicon/react'
import { useState } from 'react'

import { Avatar } from '@/components/base/avatar/avatar'
import { Badge } from '@/components/base/badges/badge'
import { Button } from '@/components/base/buttons/button'
import { Checkbox } from '@/components/base/checkbox/checkbox'
import { DatePicker } from '@/components/base/date-picker/date-picker'
import { Input } from '@/components/base/input/input'
import { Select, SelectItem } from '@/components/base/select/select'
import { Switch } from '@/components/base/switch/switch'
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip'

/**
 * A live gallery of the BoardUI (ui.boardui.com) component set, mounted inside
 * the dashboard shell so it renders under the app's real theme in both light
 * and dark. Primary surfaces are retinted from BoardUI's blue to the Signalor
 * warm-red so they read as part of the product, not a bolt-on kit.
 */

function Group({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="border-t border-[var(--cat-border)] py-5 first:border-t-0">
      <p className="mb-3 text-[11px] font-semibold tracking-wider text-[var(--cat-ink-3)] uppercase">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}

function Header(): JSX.Element {
  return (
    <header className="mb-2">
      <h1 className="text-[20px] font-semibold tracking-tight text-[var(--cat-ink)]">
        BoardUI components
      </h1>
      <p className="mt-0.5 text-[13px] text-[var(--cat-ink-3)]">
        From ui.boardui.com, retinted to the Signalor brand. Toggle the theme in the top bar to
        compare light and dark.
      </p>
    </header>
  )
}

function Buttons(): JSX.Element {
  return (
    <Group title="Buttons">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="primary" leadingIcon={RiHeartLine}>
        With icon
      </Button>
    </Group>
  )
}

function Inputs(): JSX.Element {
  return (
    <Group title="Inputs">
      <div className="w-64">
        <Input placeholder="Search components…" leadingIcon={RiSearchLine} />
      </div>
      <div className="w-48">
        <Select placeholder="Pick an engine" aria-label="Engine">
          <SelectItem id="chatgpt">ChatGPT</SelectItem>
          <SelectItem id="claude">Claude</SelectItem>
          <SelectItem id="perplexity">Perplexity</SelectItem>
        </Select>
      </div>
      <DatePicker aria-label="Pick a date" />
    </Group>
  )
}

function Toggles(): JSX.Element {
  const [remember, setRemember] = useState(true)
  const [notify, setNotify] = useState(true)
  return (
    <Group title="Toggles">
      <Checkbox isSelected={remember} onChange={setRemember}>
        Remember me
      </Checkbox>
      <Switch isSelected={notify} onChange={setNotify}>
        Notifications
      </Switch>
    </Group>
  )
}

export function BoardUIShowcase(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl">
      <Header />
      <Buttons />
      <Group title="Badges">
        <Badge color="primary">Primary</Badge>
        <Badge color="neutral">Neutral</Badge>
      </Group>
      <Inputs />
      <Toggles />
      <Group title="Avatar & tooltip">
        <Avatar size="sm" alt="Ada" initials="A" />
        <Avatar size="md" alt="Bob" initials="B" />
        <TooltipTrigger>
          <Button variant="secondary">Hover me</Button>
          <Tooltip>A BoardUI tooltip</Tooltip>
        </TooltipTrigger>
      </Group>
    </div>
  )
}
