import { expect, test } from '@playwright/test'

for (const [route, stacked, separated] of [
  ['linked-list-middle', 5, 6],
  ['remove-duplicates', 2, 3],
  ['first-occurrence', 13, 6],
  ['square-root', 19, 3],
] as const) {
  test(`${route}: moving stems never paint over another pointer label`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(`/${route}`)
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await page.evaluate(() => document.fonts.ready)
    const slider = page.getByRole('slider', { name: 'Playback position' })
    await slider.fill(String(stacked))
    const workspace = page.locator('.lesson-workspace')
    await workspace.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations({ subtree: true }).map((animation) => animation.finished),
      )
    })

    for (const step of [separated, stacked]) {
      const result = await workspace.evaluate(async (element, step) => {
        const slider = element.querySelector<HTMLInputElement>('[aria-label="Playback position"]')!
        slider.value = String(step)
        slider.dispatchEvent(new Event('input', { bubbles: true }))
        const collisions: string[] = []
        let overlaps = 0
        let moving = false
        const start = performance.now()
        // Inspect the actual painted frames, including the first moments of unstacking.
        while (performance.now() - start < 350) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
          const pointers = [...element.querySelectorAll<HTMLElement>('.array-pointer')]
          moving ||= pointers.some((pointer) =>
            pointer
              .getAnimations()
              .some(
                (animation) =>
                  animation instanceof CSSTransition && animation.transitionProperty === 'left',
              ),
          )
          for (const pointer of pointers) {
            const stem = pointer.querySelector('.pointer-stem')!.getBoundingClientRect()
            const x = stem.left + stem.width / 2
            for (const other of pointers) {
              if (other === pointer) continue
              const label = other.querySelector('.pointer-label')!.getBoundingClientRect()
              const top = Math.max(label.top, stem.top)
              const bottom = Math.min(label.bottom, stem.bottom)
              if (x <= label.left || x >= label.right || bottom <= top) continue
              overlaps++
              const hit = document.elementFromPoint(x, (top + bottom) / 2)
              if (hit?.closest('.pointer-stem'))
                collisions.push(`${pointer.dataset.pointer} over ${other.dataset.pointer}`)
            }
          }
        }
        return { moving, overlaps, collisions }
      }, step)
      expect(result.moving).toBe(true)
      expect(result.overlaps).toBeGreaterThan(0)
      expect(result.collisions).toEqual([])
    }
  })
}
