/**
 * Run `task` once the browser is idle, resolving when it has run.
 *
 * Analytics SDKs are the classic thing to schedule this way: they are never
 * what the user came for, but loading and parsing them competes with the paint
 * and the hydration that ARE. `requestIdleCallback` yields until the main
 * thread has nothing better to do; the timeout keeps a permanently busy page
 * from starving the task forever, and the setTimeout arm covers Safari, which
 * still ships no `requestIdleCallback`.
 */
export function whenIdle(task: () => void, timeoutMs = 4000): Promise<void> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') return resolve()
    const run = (): void => {
      task()
      resolve()
    }
    const ric = (window as Window & { requestIdleCallback?: typeof requestIdleCallback })
      .requestIdleCallback
    if (typeof ric === 'function') ric(run, { timeout: timeoutMs })
    else window.setTimeout(run, 1)
  })
}
