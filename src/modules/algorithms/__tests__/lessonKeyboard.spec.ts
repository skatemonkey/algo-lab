import { expect, test } from '@playwright/test'

test('clicking Solution leaves arrows and Space in control of playback', async ({ page }) => {
  await page.clock.install()
  await page.goto('/binary-search')
  const solution = page.getByRole('tab', { name: 'Solution', exact: true })
  const approach = page.getByRole('tab', { name: 'Approach', exact: true })
  const position = page.getByRole('slider', { name: 'Playback position' })
  await solution.click()
  await expect(solution).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(position).toHaveValue('1')
  await expect(solution).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(position).toHaveValue('0')
  await page.keyboard.press('ArrowLeft')
  await expect(position).toHaveValue('0')

  await page.keyboard.press('Space')
  await page.clock.runFor(2600)
  await expect(position).toHaveValue('2')
  await page.keyboard.press('ArrowRight')
  await expect(position).toHaveValue('3')
  await page.clock.runFor(5200)
  await expect(position).toHaveValue('3')
  await page.getByRole('button', { name: 'Next step', exact: true }).click()
  await page.keyboard.press('ArrowRight')
  await expect(position).toHaveValue('5')

  // Space activates a focused play button once, through its native click behavior.
  await page.getByRole('button', { name: 'Play visualization', exact: true }).focus()
  await page.keyboard.press('Space')
  await page.clock.runFor(1300)
  await expect(position).toHaveValue('6')
  await page.keyboard.press('Shift+ArrowLeft')
  await expect(approach).toHaveAttribute('aria-selected', 'true')
  await page.clock.runFor(5200)
  await page.keyboard.press('ArrowRight')
  await expect(approach).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Shift+ArrowRight')
  await expect(solution).toHaveAttribute('aria-selected', 'true')
  await expect(position).toHaveValue('6')
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeVisible()

  await position.press('End')
  const end = await position.inputValue()
  await solution.click()
  await page.keyboard.press('ArrowRight')
  await expect(position).toHaveValue(end)
})

test('section shortcuts avoid forced outlines while Tab retains normal focus', async ({ page }) => {
  await page.goto('/binary-search')
  const solution = page.getByRole('tab', { name: 'Solution', exact: true })
  const approach = page.getByRole('tab', { name: 'Approach', exact: true })
  const focusedLessonContent = page.locator('.lesson-walkthrough :focus-visible')

  await solution.click()
  await page.keyboard.press('Shift+ArrowLeft')
  await expect(approach).toHaveAttribute('aria-selected', 'true')
  await expect(focusedLessonContent).toHaveCount(0)
  await page.keyboard.press('Shift+ArrowRight')
  await expect(solution).toHaveAttribute('aria-selected', 'true')
  await expect(focusedLessonContent).toHaveCount(0)
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('1')

  await page
    .getByRole('navigation', { name: 'Question navigation' })
    .getByRole('link')
    .last()
    .focus()
  await page.keyboard.press('Tab')
  await expect(solution).toBeFocused()
  await expect(focusedLessonContent).toHaveCount(1)
  await expect(solution).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('tabpanel', { name: 'Solution', exact: true })).toBeFocused()
  await page.keyboard.press('Shift+ArrowLeft')
  await expect(approach).toHaveAttribute('aria-selected', 'true')
  await expect(focusedLessonContent).toHaveCount(0)
})

test('section and inner-step shortcuts stay separate and preserve the current reasoning step', async ({
  page,
}) => {
  await page.goto('/mountain-peak')
  const reasoning = page.getByRole('tab', { name: 'Reasoning', exact: true })
  const solution = page.getByRole('tab', { name: 'Solution', exact: true })
  const midpoint = page.getByRole('tab', { name: 'Step 1: Midpoint rule', exact: true })
  const endpoints = page.getByRole('tab', { name: 'Step 2: Mountain endpoints', exact: true })
  const rightNeighbor = page.getByRole('tab', {
    name: 'Step 4: Right-neighbor solution',
    exact: true,
  })
  const focusedSteps = page.locator('.lesson-walkthrough.steps :focus-visible')
  await reasoning.click()
  await midpoint.click()
  await page.keyboard.press('Shift+BracketRight')
  await expect(endpoints).toHaveAttribute('aria-selected', 'true')
  await expect(focusedSteps).toHaveCount(0)
  await page.keyboard.press('ArrowRight')
  await expect(endpoints).toHaveAttribute('aria-selected', 'true')
  await expect(reasoning).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tabpanel', { name: 'Step 2: Mountain endpoints', exact: true }).focus()
  await page.keyboard.press('Shift+BracketLeft')
  await expect(midpoint).toHaveAttribute('aria-selected', 'true')
  await expect(focusedSteps).toHaveCount(0)
  await page.keyboard.press('Shift+BracketLeft')
  await expect(rightNeighbor).toHaveAttribute('aria-selected', 'true')
  await expect(focusedSteps).toHaveCount(0)

  await page.keyboard.press('Shift+ArrowRight')
  await expect(solution).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Shift+BracketRight')
  await page.keyboard.press('Shift+BracketLeft')
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('1')
  await page.keyboard.press('Shift+ArrowLeft')
  await expect(reasoning).toHaveAttribute('aria-selected', 'true')
  await expect(rightNeighbor).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Shift+BracketRight')
  await expect(midpoint).toHaveAttribute('aria-selected', 'true')
  await expect(focusedSteps).toHaveCount(0)

  const pair = page.getByRole('slider', { name: 'Move the pair', exact: true })
  await pair.press('ArrowRight')
  await expect(pair).toHaveValue('1')
  await pair.press('Shift+ArrowRight')
  await expect(reasoning).toHaveAttribute('aria-selected', 'true')
  await pair.press(']')
  await pair.press('Shift+BracketRight')
  await expect(page).toHaveURL('/mountain-peak')
  await expect(midpoint).toHaveAttribute('aria-selected', 'true')
})

test('editing, browser modifiers, composition, and held keys do not trigger lesson shortcuts', async ({
  page,
}) => {
  await page.goto('/binary-search')
  const solution = page.getByRole('tab', { name: 'Solution', exact: true })
  const position = page.getByRole('slider', { name: 'Playback position' })
  await solution.click()
  const prevented = await solution.evaluate((element) => {
    const modifiers = [
      { altKey: true },
      { ctrlKey: true },
      { metaKey: true },
      { isComposing: true },
      { repeat: true },
    ]
    return ['ArrowRight', '[', ']'].flatMap((key) =>
      modifiers.map((modifier) => {
        const event = new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
          ...modifier,
        })
        element.dispatchEvent(event)
        return event.defaultPrevented
      }),
    )
  })
  expect(prevented).toEqual(Array(15).fill(false))
  await expect(page).toHaveURL('/binary-search')
  await expect(position).toHaveValue('0')
  await expect(solution).toHaveAttribute('aria-selected', 'true')

  await page.getByRole('button', { name: 'Edit inputs', exact: true }).focus()
  await page.keyboard.press('Space')
  const length = page.getByRole('spinbutton', { name: 'Array length', exact: true })
  await expect(length).toBeFocused()
  await length.press('Shift+ArrowLeft')
  await length.press(']')
  await length.press('Shift+BracketRight')
  await expect(page).toHaveURL('/binary-search')
  await expect(solution).toHaveAttribute('aria-selected', 'true')
  const boundary = page.getByRole('slider', { name: /First true/ })
  await boundary.press('ArrowRight')
  await expect(boundary).toHaveValue('8')
  await expect(position).toHaveValue('0')
  await page.getByRole('button', { name: 'Close input editor' }).press('Enter')
  await expect(page.getByRole('form', { name: 'Search inputs' })).toHaveCount(0)

  // Editable content also retains cursor movement and typed brackets.
  await page.evaluate(() => {
    const field = document.createElement('div')
    field.contentEditable = 'plaintext-only'
    field.textContent = 'sample'
    document.querySelector('.algorithm-lesson')!.append(field)
    field.focus()
    getSelection()!.collapse(field.firstChild, 6)
  })
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press(']')
  await expect(page.locator('[contenteditable="plaintext-only"]')).toHaveText('sampl]e')
  await expect(page).toHaveURL('/binary-search')
  await expect(position).toHaveValue('0')
})

test('plain brackets follow question order without wrapping or triggering other controls', async ({
  page,
}) => {
  const paths = [
    'binary-search',
    'first-occurrence',
    'first-not-smaller',
    'square-root',
    'rotated-minimum',
    'mountain-peak',
    'remove-duplicates',
    'linked-list-middle',
    'move-zeros',
  ]
  await page.goto('/binary-search')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.keyboard.press('[')
  await expect(page).toHaveURL('/binary-search')
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')

  for (const path of paths.slice(1)) {
    await page.keyboard.press(']')
    await expect(page).toHaveURL('/' + path)
    await expect(page.getByRole('navigation', { name: 'Question navigation' })).toContainText(
      `Question ${paths.indexOf(path) + 1} of ${paths.length}`,
    )
  }
  await page.keyboard.press(']')
  await expect(page).toHaveURL('/move-zeros')

  for (const path of paths.slice(0, -1).reverse()) {
    await page.keyboard.press('[')
    await expect(page).toHaveURL('/' + path)
    await expect(page.getByRole('navigation', { name: 'Question navigation' })).toBeVisible()
  }
  await page.getByRole('link', { name: 'Back to questions' }).click()
  await expect(page).toHaveURL('/')
  await page.keyboard.press(']')
  await expect(page).toHaveURL('/')
})

test('the shared controller covers questions and patterns without stale registrations', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/mountain-peak')
  const help = page.locator('summary[aria-label="Keyboard shortcuts"]')
  await help.click()
  await expect(page.getByRole('note', { name: 'Keyboard shortcuts' }).locator('dd')).toHaveText([
    'Visualization step',
    'Play / pause',
    'Lesson section',
    'Approach / reasoning step',
    'Question',
  ])
  await expect(page.getByRole('note', { name: 'Keyboard shortcuts' }).locator('kbd')).toHaveText([
    '← / →',
    'Space',
    'Shift + ← / →',
    'Shift + [ / ]',
    '[ / ]',
  ])
  await page.screenshot({
    path: '.artifacts/lesson-keyboard-shortcuts.png',
    fullPage: true,
    animations: 'disabled',
  })
  await help.press('Escape')
  await expect(page.getByRole('note', { name: 'Keyboard shortcuts' })).toBeHidden()
  await expect(help).toBeFocused()

  await page.getByRole('link', { name: 'Back to questions' }).click()
  await page.locator('a[href="/linked-list-middle"]').click()
  await help.click()
  await expect(page.getByRole('note', { name: 'Keyboard shortcuts' }).locator('dd')).toHaveText([
    'Visualization step',
    'Play / pause',
    'Lesson section',
    'Question',
  ])
  await help.press('Escape')
  await page.getByRole('heading', { level: 1 }).click()
  await page.keyboard.press('Shift+ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('1')
  await page.keyboard.press('Shift+ArrowLeft')
  await page.keyboard.press('Shift+BracketRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Shift+ArrowRight')
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('1')

  await page.getByRole('link', { name: 'Back to questions' }).click()
  await page.locator('a[href="/patterns/binary-search"]').click()
  await page.getByRole('heading', { level: 1 }).click()
  await page.keyboard.press(']')
  await page.keyboard.press('[')
  await expect(page).toHaveURL('/patterns/binary-search')
  for (let step = 0; step < 3; step++) await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('3')
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Keep right', exact: true }).click()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('5')
  expect(errors).toEqual([])
})
