import { expect, test } from '@playwright/test'
import { applyPreset } from './lessonHelpers'

test('approach introduces both decisions before the code and keeps pointers aligned', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/binary-search')
  const approach = page.getByRole('tabpanel', { name: 'Approach', exact: true })
  await expect(page.getByRole('tab')).toHaveText(['Approach', 'Solution'])
  await expect(approach).toBeVisible()
  await expect(page.getByRole('tablist')).toHaveCount(1)
  await expect(approach.getByRole('tablist')).toHaveCount(0)
  await expect(page.locator('.inspector')).toBeHidden()
  await expect(page.locator('.reasoning-label')).toHaveCount(0)
  await expect(approach.getByRole('heading')).toHaveText(['Split', 'Search', 'Return'])
  await expect(approach.locator('.pattern-path')).toHaveText(
    /Pattern\s*Binary search\s*Boundary search/,
  )
  await expect(approach.locator('.return-rule')).toHaveText('Saved index, or −1 if none.')
  const decisions = approach.getByRole('list', { name: 'Midpoint decisions' })
  const activeDecision = decisions.locator('[aria-current="true"]')
  await expect(decisions.locator('.rule-condition')).toHaveText(['== false', '== true'])
  await expect(decisions.locator('.rule-action')).toHaveText([
    'Search right',
    'Save mid · Search left',
  ])
  await expect(activeDecision).toHaveCount(0)
  await expect(approach.getByText('Select a cell to try mid.', { exact: true })).toHaveCount(0)
  const feedback = approach.locator('.approach-range .range-caption')
  await expect(feedback).toHaveCount(0)
  await expect(approach.getByRole('link', { name: 'Binary search' })).toHaveAttribute(
    'href',
    '/patterns/binary-search',
  )
  await expect(
    page.locator('.lesson-heading').getByRole('link', { name: 'AlgoMonster' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next step' })).toHaveCount(0)
  await expect(approach.locator('.approach-cell')).toHaveCount(12)
  await expect(approach.locator('[data-pointer="first true"]')).toHaveAttribute('data-index', '7')

  await approach.getByRole('button', { name: 'Try index 5 as mid: false', exact: true }).click()
  await expect(activeDecision.locator('.rule-condition')).toHaveText('== false')
  await expect(feedback).toHaveText('Search right')
  await expect(approach.locator('.approach-range')).toHaveAttribute('data-range-left', '6')
  await expect(approach.locator('.approach-range')).toHaveAttribute('data-range-right', '11')
  await expect(approach.locator('.saved-value')).toHaveCount(0)
  await expect(approach.locator('.approach-array li').first()).toHaveClass(/discarded/)
  await expect(approach.locator('.approach-array li').last()).not.toHaveClass(/discarded/)
  await approach.getByRole('button', { name: 'Try index 9 as mid: true', exact: true }).click()
  await expect(activeDecision.locator('.rule-condition')).toHaveText('== true')
  await expect(feedback).toHaveText('Search left')
  await expect(approach.locator('.approach-range .saved-value')).toHaveText('9')
  await expect(approach.locator('.approach-array li').last()).toHaveClass(/discarded/)
  await expect(approach.locator('.approach-array li').first()).not.toHaveClass(/discarded/)
  await expect(approach.locator('.approach-range')).toHaveAttribute('data-range-right', '8')
  await expect(approach.locator('[data-pointer="first true"]')).toHaveAttribute('data-index', '7')

  await page.evaluate(() => document.fonts.ready)
  for (const index of [0, 6, 7, 11]) {
    await approach.locator('.approach-cell').nth(index).click()
    const cell = (await approach.locator('.approach-cell').nth(index).boundingBox())!
    await expect
      .poll(async () => {
        const stem = (await approach.locator('[data-pointer="mid"] .pointer-stem').boundingBox())!
        return Math.abs(stem.x + stem.width / 2 - cell.x - cell.width / 2)
      })
      .toBeLessThan(1)
    const panel = (await approach.boundingBox())!
    for (const label of await approach
      .locator('.pointer-label, .range-caption, .saved-marker')
      .all()) {
      const box = (await label.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(panel.x)
      expect(box.x + box.width).toBeLessThanOrEqual(panel.x + panel.width)
    }
    const mid = (await approach.locator('[data-pointer="mid"] .pointer-label').boundingBox())!
    const goal = (await approach
      .locator('[data-pointer="first true"] .pointer-label')
      .boundingBox())!
    if (index === 7) expect(mid.y + mid.height).toBeLessThan(goal.y)
    else expect(Math.abs(mid.y - goal.y)).toBeLessThan(1)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({
    path: '.artifacts/first-true-approach-1280.png',
    fullPage: true,
    animations: 'disabled',
  })
  await approach.getByRole('button', { name: 'Try index 11 as mid: true', exact: true }).click()
  await expect(activeDecision).toHaveCount(0)
  await expect(feedback).toHaveCount(0)
  await expect(approach.locator('.saved-marker')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('examples carry between approach and solution, including missing and empty boundaries', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/binary-search')
  const input = page.getByRole('combobox', { name: 'Approach input' })
  await input.selectOption('0')
  await expect(page.locator('.approach-cell')).toHaveText([
    'false',
    'false',
    'true',
    'true',
    'true',
  ])
  await expect(page.locator('.boundary-approach [data-pointer="first true"]')).toHaveAttribute(
    'data-index',
    '2',
  )
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByTestId('array-length')).toHaveText('n = 5')
  await expect(page.getByTestId('assignment-result')).toHaveText('0, 4')
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 2')
  await applyPreset(page, 1)
  await page.getByRole('tab', { name: 'Approach', exact: true }).click()
  await expect(input).toHaveValue('1')
  await expect(page.locator('.approach-cell')).toHaveText(Array(12).fill('false'))
  await expect(page.locator('.boundary-approach [data-pointer="first true"]')).toHaveCount(0)
  await page.locator('.approach-cell').nth(10).click()
  const feedback = page.locator('.approach-range .range-caption')
  await expect(feedback).toHaveText('Search right')
  await expect(page.locator('.approach-range')).toHaveAttribute('data-range-left', '11')
  await expect(page.locator('.approach-range')).toHaveAttribute('data-range-right', '11')
  const panel = (await page.locator('.boundary-approach').boundingBox())!
  const rightCaption = (await feedback.boundingBox())!
  expect(rightCaption.x + rightCaption.width).toBeLessThanOrEqual(panel.x + panel.width)
  await page.locator('.approach-cell').last().click()
  await expect(feedback).toHaveText('Search right · empty')
  await expect(page.locator('.search-range')).toHaveCount(0)
  await expect(page.locator('.approach-range')).toHaveAttribute(
    'aria-label',
    'Search range is empty',
  )
  await input.selectOption('2')
  await expect(page.locator('.approach-cell')).toHaveText(Array(12).fill('true'))
  await expect(feedback).toHaveCount(0)
  await page.locator('.approach-cell').nth(1).click()
  await expect(feedback).toHaveText('Search left')
  await expect(page.locator('.approach-range')).toHaveAttribute('data-range-left', '0')
  await expect(page.locator('.approach-range')).toHaveAttribute('data-range-right', '0')
  const leftCaption = (await feedback.boundingBox())!
  expect(leftCaption.x).toBeGreaterThanOrEqual(panel.x)
  await page.locator('.approach-cell').first().click()
  await expect(feedback).toHaveText('Search left · empty')
  await expect(page.locator('.search-range')).toHaveCount(0)
  await expect(page.locator('.saved-value')).toHaveText('0')
  await expect(page.locator('.boundary-approach [data-pointer="first true"]')).toHaveAttribute(
    'data-index',
    '0',
  )
  await expect(page.locator('.approach-range')).toHaveAttribute(
    'aria-label',
    'Search range is empty',
  )
  await input.selectOption('3')
  await expect(feedback).toHaveCount(0)
  await expect(page.locator('.saved-marker')).toHaveCount(0)
  await expect(page.locator('.approach-cell')).toHaveCount(0)
  await expect(page.locator('.boundary-approach .array-pointer')).toHaveCount(0)
  await expect(page.getByLabel('Empty array', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return -1')
  expect(errors).toEqual([])
})

test('switching tabs pauses playback and keyboard navigation preserves the current step', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/binary-search')
  const approach = page.getByRole('tab', { name: 'Approach', exact: true })
  const solution = page.getByRole('tab', { name: 'Solution', exact: true })
  await page.getByRole('button', { name: 'Try index 9 as mid: true', exact: true }).click()
  await approach.focus()
  await approach.press('Shift+ArrowRight')
  await expect(solution).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: 'Play visualization' }).click()
  await page.clock.runFor(2600)
  const slider = page.getByRole('slider', { name: 'Playback position' })
  await expect(slider).toHaveValue('2')
  await approach.click()
  await expect(page.locator('.saved-value')).toHaveText('9')
  await page.clock.runFor(10000)
  await page.getByRole('heading', { name: 'Find the first true', exact: true }).click()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowRight')
  await page.clock.runFor(2600)
  await approach.focus()
  await approach.press('End')
  await expect(solution).toBeFocused()
  await expect(slider).toHaveValue('2')
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeVisible()
  await solution.press('Home')
  await expect(approach).toBeFocused()
  await page.getByRole('combobox', { name: 'Approach input' }).selectOption('0')
  await solution.click()
  await expect(slider).toHaveValue('0')
  await page.goto('/first-not-smaller')
  await expect(page.getByRole('tab')).toHaveText(['Approach', 'Solution'])
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByRole('complementary', { name: 'Solution' })).toBeVisible()
})

test('Current input stays selectable and restores the original array after any example', async ({
  page,
}) => {
  await page.goto('/binary-search')
  const input = page.getByRole('combobox', { name: 'Approach input' })
  const current = input.getByRole('option', { name: 'Current input', exact: true })
  await expect(input).toHaveValue('custom')
  await expect(current).toBeEnabled()

  for (const preset of ['0', '1', '2', '3']) {
    await input.selectOption(preset)
    await expect(input).toHaveValue(preset)
    await expect(current).toBeEnabled()
    await input.selectOption('custom')
    await expect(input).toHaveValue('custom')
    await expect(page.locator('.approach-cell')).toHaveText([
      ...Array(7).fill('false'),
      ...Array(5).fill('true'),
    ])
    await expect(page.locator('.boundary-approach [data-pointer="first true"]')).toHaveAttribute(
      'data-index',
      '7',
    )
  }

  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByTestId('array-length')).toHaveText('n = 12')
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 7')
})

test('Current input remembers valid custom edits, including values that match a preset', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/binary-search')
  const approach = page.getByRole('tab', { name: 'Approach', exact: true })
  const solution = page.getByRole('tab', { name: 'Solution', exact: true })
  const input = page.getByRole('combobox', { name: 'Approach input' })
  await solution.click()
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  const length = page.getByRole('spinbutton', { name: 'Array length' })
  await length.fill('8')
  await length.press('Enter')
  const boundary = page.getByRole('slider', { name: /First true/ })
  await boundary.press('Home')
  for (let index = 0; index < 3; index++) await boundary.press('ArrowRight')
  await length.fill('17')
  await length.press('Enter')
  await expect(page.getByRole('alert')).toBeVisible()

  await approach.click()
  await expect(input).toHaveValue('custom')
  await input.selectOption('0')
  await input.selectOption('custom')
  await expect(page.locator('.approach-cell')).toHaveText([
    ...Array(3).fill('false'),
    ...Array(5).fill('true'),
  ])
  await solution.click()
  await expect(page.getByTestId('array-length')).toHaveText('n = 8')
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 3')

  await applyPreset(page, 1)
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await boundary.press('Home')
  await approach.click()
  await expect(input).toHaveValue('custom')
  await input.selectOption('3')
  await input.selectOption('custom')
  await expect(input).toHaveValue('custom')
  await expect(page.locator('.approach-cell')).toHaveText(Array(12).fill('true'))
  expect(errors).toEqual([])
})

test('Approach edits update the array live and share applied values with Solution', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/binary-search')
  await page.evaluate(() => document.fonts.ready)
  const approach = page.getByRole('tabpanel', { name: 'Approach', exact: true })
  const edit = approach.getByRole('button', { name: 'Edit inputs', exact: true })
  const array = approach.locator('.approach-array-board')
  const cells = approach.locator('.approach-cell')
  const arrayBounds = await array.boundingBox()
  const stepsBounds = await approach.getByRole('list', { name: 'Approach steps' }).boundingBox()
  await expect(edit).toHaveText('')
  await approach.getByRole('button', { name: 'Try index 9 as mid: true', exact: true }).click()
  await edit.click()
  const length = approach.getByRole('spinbutton', { name: 'Array length', exact: true })
  const boundary = approach.getByRole('slider', { name: /First true/ })
  const preset = approach.getByRole('combobox', { name: 'Input preset' })
  await expect(length).toBeFocused()
  await expect(approach.locator('.saved-marker')).toHaveCount(0)
  expect(await array.boundingBox()).toEqual(arrayBounds)
  expect(await approach.getByRole('list', { name: 'Approach steps' }).boundingBox()).toEqual(
    stepsBounds,
  )
  await expect(cells.first()).toBeDisabled()
  await expect(approach.getByRole('button', { name: 'Apply inputs' })).toHaveCount(0)

  await boundary.press('Home')
  for (let index = 0; index < 3; index++) await boundary.press('ArrowRight')
  await expect(cells).toHaveText([...Array(3).fill('false'), ...Array(9).fill('true')])
  await preset.selectOption('0')
  await expect(cells).toHaveText(['false', 'false', 'true', 'true', 'true'])
  await expect(length).toHaveValue('5')
  await preset.selectOption('custom')
  await expect(cells).toHaveText([...Array(3).fill('false'), ...Array(9).fill('true')])
  await expect(length).toHaveValue('12')

  await length.fill('8')
  await expect(cells).toHaveCount(12)
  await expect(approach.getByRole('button', { name: 'Apply inputs' })).toBeVisible()
  await length.press('Enter')
  await expect(cells).toHaveText([...Array(3).fill('false'), ...Array(5).fill('true')])
  await expect(length).toBeFocused()
  await expect(approach.getByRole('button', { name: 'Apply inputs' })).toHaveCount(0)
  await expect(edit).toHaveAttribute('aria-expanded', 'true')
  const controls = (await approach.getByRole('form', { name: 'Search inputs' }).boundingBox())!
  const pointer = (await approach
    .locator('[data-pointer="first true"] .pointer-label')
    .boundingBox())!
  expect(controls.y + controls.height).toBeLessThan(pointer.y)
  await page.screenshot({
    path: '.artifacts/first-true-approach-editor.png',
    fullPage: true,
    animations: 'disabled',
  })

  await approach.getByRole('button', { name: 'Close input editor' }).click()
  await expect(edit).toBeFocused()
  await expect(cells.first()).toBeEnabled()
  await cells.nth(5).click()
  await expect(approach.locator('.range-caption')).toHaveText('Search left')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByTestId('array-length')).toHaveText('n = 8')
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 3')
  expect(errors).toEqual([])
})

test('Approach validates drafts, handles empty inputs, and closes its editor when changing sections', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/binary-search')
  const approach = page.getByRole('tabpanel', { name: 'Approach', exact: true })
  const edit = approach.getByRole('button', { name: 'Edit inputs', exact: true })
  const length = approach.getByRole('spinbutton', { name: 'Array length', exact: true })
  const boundary = approach.getByRole('slider', { name: /First true/ })
  const preset = approach.getByRole('combobox', { name: 'Input preset' })
  const cells = approach.locator('.approach-cell')
  await edit.click()
  await preset.selectOption('3')
  await expect(boundary).toBeDisabled()
  await expect(approach.getByLabel('Empty array', { exact: true })).toBeVisible()
  await preset.selectOption('2')
  await expect(cells).toHaveText(Array(12).fill('true'))
  await expect(boundary).toBeEnabled()
  await preset.selectOption('custom')
  await length.fill('8')
  await length.press('Enter')
  await expect(cells).toHaveText([...Array(7).fill('false'), 'true'])

  await length.fill('17')
  await length.press('Enter')
  await expect(approach.getByRole('alert')).toBeVisible()
  await expect(length).toHaveAttribute('aria-invalid', 'true')
  await page.screenshot({
    path: '.artifacts/first-true-approach-editor-error.png',
    fullPage: true,
    animations: 'disabled',
  })
  await expect(length).toHaveAttribute(
    'aria-describedby',
    (await approach.getByRole('alert').getAttribute('id'))!,
  )
  await expect(cells).toHaveCount(8)
  await preset.selectOption('0')
  await expect(approach.getByRole('alert')).toHaveCount(0)
  await preset.selectOption('custom')
  await expect(length).toHaveValue('8')
  await expect(cells).toHaveText([...Array(7).fill('false'), 'true'])
  await length.fill('2')
  await length.press('Escape')
  await expect(edit).toBeFocused()
  await expect(approach.getByRole('form', { name: 'Search inputs' })).toHaveCount(0)
  await edit.click()
  await expect(length).toHaveValue('8')
  await length.fill('17')
  await length.press('Enter')

  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByRole('form', { name: 'Search inputs' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await expect(page.getByRole('spinbutton', { name: 'Array length' })).toHaveValue('8')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByRole('slider', { name: /First true/ }).press('Home')
  await page.getByRole('tab', { name: 'Approach', exact: true }).click()
  await expect(edit).toHaveAttribute('aria-expanded', 'false')
  await expect(cells).toHaveText(Array(8).fill('true'))
  await expect(page.getByRole('form', { name: 'Search inputs' })).toHaveCount(0)
  await expect(approach.getByRole('combobox', { name: 'Approach input' })).toHaveValue('custom')
  expect(errors).toEqual([])
})

test('Solution decisions follow the comparison and persist through its branch updates', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install()
  await page.goto('/binary-search')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  const solution = page.getByRole('tabpanel', { name: 'Solution', exact: true })
  const decisions = solution.getByRole('list', { name: 'Midpoint decisions' })
  const active = decisions.locator('[aria-current="true"] .rule-condition')
  const next = page.getByRole('button', { name: 'Next step', exact: true })
  const instruction = page.locator('.code-line.active')
  await expect(decisions.locator('.rule-condition')).toHaveText(['== false', '== true'])
  await expect(active).toHaveCount(0)

  await next.click()
  await expect(instruction).toHaveAttribute('data-instruction', 'answer')
  await expect(active).toHaveCount(0)
  await next.click()
  await expect(page.getByTestId('condition-result')).toHaveText('true')
  await expect(active).toHaveCount(0)
  await next.click()
  await expect(instruction).toHaveAttribute('data-instruction', 'midpoint')
  await expect(active).toHaveCount(0)
  await next.click()
  await expect(page.getByTestId('condition-result')).toHaveText('false')
  await expect(active).toHaveText('== false')
  await page.screenshot({
    path: '.artifacts/first-true-solution-false.png',
    fullPage: true,
    animations: 'disabled',
  })
  await next.click()
  await expect(instruction).toHaveAttribute('data-instruction', 'left')
  await expect(active).toHaveText('== false')
  await next.click()
  await expect(instruction).toHaveAttribute('data-instruction', 'loop')
  await expect(active).toHaveCount(0)
  await next.click()
  await expect(active).toHaveCount(0)
  await next.click()
  await expect(page.getByTestId('condition-result')).toHaveText('true')
  await expect(active).toHaveText('== true')
  await next.click()
  await expect(instruction).toHaveAttribute('data-instruction', 'save')
  await expect(active).toHaveText('== true')
  await next.click()
  await expect(instruction).toHaveAttribute('data-instruction', 'right')
  await expect(active).toHaveText('== true')
  await page.screenshot({
    path: '.artifacts/first-true-solution-true.png',
    fullPage: true,
    animations: 'disabled',
  })
  await next.click()
  await expect(active).toHaveCount(0)
  await page.getByRole('button', { name: 'Previous step', exact: true }).click()
  await expect(active).toHaveText('== true')

  const position = page.getByRole('slider', { name: 'Playback position' })
  await position.press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 7')
  await expect(active).toHaveCount(0)
  await page.getByRole('button', { name: 'Reset visualization', exact: true }).click()
  await expect(active).toHaveCount(0)
  await page.getByRole('button', { name: 'Play visualization', exact: true }).click()
  await page.clock.runFor(5200)
  await expect(position).toHaveValue('4')
  await expect(active).toHaveText('== false')
})

test('Solution input editing keeps the array steady and resets the decision for new input', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/binary-search')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.evaluate(() => document.fonts.ready)
  const position = page.getByRole('slider', { name: 'Playback position' })
  for (let index = 0; index < 8; index++) await position.press('ArrowRight')
  const solution = page.getByRole('tabpanel', { name: 'Solution', exact: true })
  const decisions = solution.locator('.search-decisions')
  const array = solution.locator('.array-track')
  const arrayBounds = await array.boundingBox()
  await expect(decisions.locator('[aria-current="true"] .rule-condition')).toHaveText('== true')
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await expect(decisions).toBeHidden()
  expect(await array.boundingBox()).toEqual(arrayBounds)
  await expect(page.getByRole('button', { name: 'Next step', exact: true })).toBeDisabled()

  const length = page.getByRole('spinbutton', { name: 'Array length', exact: true })
  await length.fill('17')
  await length.press('Enter')
  await expect(page.getByRole('alert')).toBeVisible()
  const form = (await page.getByRole('form', { name: 'Search inputs' }).boundingBox())!
  for (const pointer of await array.locator('.array-pointer .pointer-label').all()) {
    const label = (await pointer.boundingBox())!
    expect(form.y + form.height).toBeLessThan(label.y)
  }
  await page.screenshot({
    path: '.artifacts/first-true-solution-editor.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: 'Close input editor' }).click()
  await expect(decisions).toBeVisible()
  await expect(decisions.locator('[aria-current="true"] .rule-condition')).toHaveText('== true')

  await applyPreset(page, 1)
  await expect(decisions.locator('[aria-current="true"]')).toHaveCount(0)
  await expect(position).toHaveValue('0')
  for (let index = 0; index < 4; index++) await position.press('ArrowRight')
  await expect(decisions.locator('[aria-current="true"] .rule-condition')).toHaveText('== false')
  await applyPreset(page, 3)
  await position.press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return -1')
  await expect(decisions.locator('[aria-current="true"]')).toHaveCount(0)
  expect(errors).toEqual([])
})
