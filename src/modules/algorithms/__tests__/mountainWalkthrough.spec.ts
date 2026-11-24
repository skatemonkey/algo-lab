import { expect, test } from '@playwright/test'
import { closeInputs } from './lessonHelpers'

const midpointStep = 'Step 1: Midpoint rule'
const endpointsStep = 'Step 2: Mountain endpoints'
const failureStep = 'Step 3: Left-neighbor failure'
const solutionStep = 'Step 4: Right-neighbor solution'
const resultStep = 'Solution'

test('numbered tabs follow the source reasoning and the midpoint uses one worked calculation', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  const sections = page.getByRole('tablist', { name: 'Lesson sections', exact: true })
  await expect(sections.getByRole('tab')).toHaveText(['Approach', 'Reasoning', 'Solution'])
  await expect(
    page.getByRole('tablist', { name: 'Reasoning', exact: true }).getByRole('tab'),
  ).toHaveCount(4)
  await expect(page.getByRole('tab')).toHaveCount(7)
  for (const name of [midpointStep, endpointsStep, failureStep, solutionStep, resultStep]) {
    await expect(page.getByRole('tab', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('tab', { name: midpointStep, exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByRole('button', { name: 'Previous', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Next:/ })).toHaveCount(0)
  const pair = page.getByRole('slider', { name: 'Move the pair', exact: true })
  await expect(pair).toBeVisible()
  await expect(page.getByTestId('midpoint-calculation').locator('span:nth-child(even)')).toHaveText(
    ['= floor((left + right) / 2)', '= floor((0 + 1) / 2)', '= 0'],
  )
  await pair.focus()
  for (let i = 0; i < 4; i++) await pair.press('ArrowRight')
  await expect(pair).toHaveValue('4')
  await expect(page.getByTestId('midpoint-calculation').locator('span:nth-child(even)')).toHaveText(
    ['= floor((left + right) / 2)', '= floor((4 + 5) / 2)', '= 4'],
  )
  const array = page.getByRole('list', { name: 'Midpoint indices' })
  await expect(array.locator('[data-pointer="left"]')).toHaveAttribute(
    'aria-label',
    'left pointer: 4',
  )
  await expect(array.locator('[data-pointer="right"]')).toHaveAttribute(
    'aria-label',
    'right pointer: 5',
  )
  await expect(array.locator('[data-pointer="mid"]')).toHaveAttribute(
    'aria-label',
    'mid pointer: 4',
  )
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: '.artifacts/mountain-midpoint-rule.png', animations: 'disabled' })
  expect(errors).toEqual([])
})

test('endpoint exploration connects each pair to the mountain profile and peak', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  await page.getByRole('tab', { name: endpointsStep, exact: true }).click()
  const panel = page.getByRole('tabpanel', { name: endpointsStep, exact: true })
  const comparison = panel.getByTestId('endpoint-comparison')
  const slope = panel.getByTestId('mountain-connection')
  await expect(comparison).toContainText('A[0] < A[1]')
  await expect(comparison).toContainText('0 < 1')
  await expect(comparison).toContainText('Rising')
  await expect(panel.getByRole('img')).toHaveAccessibleName(
    'Mountain peak at index 3, value 3. First pair rises.',
  )
  await expect(slope).toHaveAttribute('data-from-index', '0')
  await expect(slope).toHaveAttribute('data-to-index', '1')
  const array = panel.getByRole('list', { name: 'Mountain endpoint array' })
  await expect(array.locator('.array-value')).toHaveText(['0', '1', '2', '3', '2', '1', '0'])
  await expect(array.locator('[data-index="3"] .array-marker')).toHaveText('peak')
  await expect(array.locator('[data-pointer="left"]')).toHaveAttribute(
    'aria-label',
    'left pointer: 0',
  )
  await expect(array.locator('[data-pointer="right"]')).toHaveAttribute(
    'aria-label',
    'right pointer: 1',
  )
  await expect(array.locator('[data-pointer="left"] .pointer-stem')).toBeVisible()
  await expect(array.locator('[data-pointer="right"] .pointer-stem')).toBeVisible()
  const alignment = await panel.locator('.mountain-array').evaluate((element) => {
    const svg = element.querySelector('svg')!
    const peak = element.querySelector('[data-index="3"] .array-value')!.getBoundingClientRect()
    const first = element.querySelector('[data-index="0"] .array-value')!.getBoundingClientRect()
    const origin = svg.getBoundingClientRect()
    const point = svg.querySelector('polyline')!.points.getItem(3)
    return {
      dx: Math.abs(point.x + origin.left - peak.left - peak.width / 2),
      dy: Math.abs(point.y + origin.top - peak.top - peak.height / 2),
      peakAboveFirst: peak.top < first.top,
    }
  })
  expect(alignment.dx).toBeLessThan(1)
  expect(alignment.dy).toBeLessThan(1)
  expect(alignment.peakAboveFirst).toBe(true)
  const comparisonBounds = await comparison.boundingBox()
  const arrayBounds = await array.boundingBox()
  await page.screenshot({ path: '.artifacts/mountain-endpoints-first.png', animations: 'disabled' })

  const lastPair = panel.getByRole('button', { name: 'Last pair', exact: true })
  await lastPair.focus()
  await lastPair.press('Enter')
  await expect(lastPair).toHaveAttribute('aria-pressed', 'true')
  expect(await comparison.boundingBox()).toEqual(comparisonBounds)
  expect(await array.boundingBox()).toEqual(arrayBounds)
  await expect(comparison).toContainText('A[n − 2] > A[n − 1]')
  await expect(comparison).toContainText('1 > 0')
  await expect(comparison).toContainText('Falling')
  await expect(slope).toHaveAttribute('data-from-index', '5')
  await expect(slope).toHaveAttribute('data-to-index', '6')
  await expect(array.locator('[data-pointer="left"]')).toHaveAttribute(
    'aria-label',
    'left pointer: 5',
  )
  await expect(array.locator('[data-pointer="right"]')).toHaveAttribute(
    'aria-label',
    'right pointer: 6',
  )
  await expect(panel.getByRole('img')).toHaveAccessibleName(
    'Mountain peak at index 3, value 3. Last pair falls.',
  )
  await page.screenshot({ path: '.artifacts/mountain-endpoints.png', animations: 'disabled' })
})

test('the left-neighbor failure shows its cause and result at a glance without playback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  await page.getByRole('tab', { name: failureStep, exact: true }).click()
  const panel = page.getByRole('tabpanel', { name: failureStep, exact: true })
  const comparison = panel.getByTestId('left-neighbor-comparison')
  await expect(comparison.locator('code')).toHaveText(['A[mid] > A[mid − 1]', '0 > 1'])
  await expect(comparison.locator('.comparison-result')).toHaveText('false · wrong neighbor')
  await expect(comparison).toHaveClass(/error/)
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText(
    'Why the left-neighbor attempt fails',
  )
  await expect(panel).toContainText('mid can reach index 0, which has no left neighbor.')
  await expect(panel.getByRole('button')).toHaveCount(0)
  await expect(panel.getByRole('slider')).toHaveCount(0)

  const skipped = panel.getByTestId('mountain-connection')
  await expect(skipped).toHaveAttribute('data-from-index', '0')
  await expect(skipped).toHaveAttribute('data-to-index', '5')
  await expect(skipped).toHaveClass(/skips-neighbor/)
  await expect(skipped).toHaveClass(/error/)
  const array = panel.getByRole('list', { name: 'Left-neighbor counterexample' })
  await expect(array.locator('[data-pointer="left"]')).toHaveAttribute(
    'aria-label',
    'left pointer: 0',
  )
  await expect(array.locator('[data-pointer="right"]')).toHaveAttribute(
    'aria-label',
    'right pointer: 1',
  )
  await expect(array.locator('[data-pointer="mid"]')).toHaveAttribute(
    'aria-label',
    'mid pointer: 0',
  )
  for (const name of ['left', 'right', 'mid']) {
    await expect(array.locator(`[data-pointer="${name}"] .pointer-stem`)).toBeVisible()
  }
  const leftLabel = (await array.locator('[data-pointer="left"] .pointer-label').boundingBox())!
  const midLabel = (await array.locator('[data-pointer="mid"] .pointer-label').boundingBox())!
  expect(midLabel.y + midLabel.height).toBeLessThan(leftLabel.y)
  expect(
    Math.abs(midLabel.x + midLabel.width / 2 - leftLabel.x - leftLabel.width / 2),
  ).toBeLessThan(1)
  await expect(array.locator('[data-index="1"] .array-marker')).toHaveText('peak')
  await expect(array.locator('[data-index="5"] .array-marker')).toHaveText('A[−1]')

  const explanation = panel.getByRole('list', { name: 'Why the peak is skipped' })
  const steps = explanation.getByRole('listitem')
  await expect(steps).toHaveCount(4)
  await expect(explanation.getByRole('heading')).toHaveText([
    'Reach the left edge',
    'Compute the midpoint',
    'Read the left neighbor',
    'Update the range',
  ])
  await expect(steps.nth(0).locator('code')).toHaveText('left = 0, right = 1')
  await expect(steps.nth(1).locator('code')).toHaveText(['mid = floor((0 + 1) / 2)', '= 0'])
  await expect(steps.nth(1)).toContainText('Round down: mid is left.')
  await expect(steps.nth(2).locator('code')).toHaveText(['mid − 1 = 0 − 1', '= −1'])
  await expect(steps.nth(2)).toContainText('Python: A[−1] reads the last value.')
  await expect(steps.nth(3).locator('code')).toHaveText(['0 > 1 → false', 'right ← -1'])
  await expect(steps.nth(3)).toContainText('Return -1; peak at index 1 is skipped.')
  await page.evaluate(() => document.fonts.ready)
  const bounds = (await explanation.boundingBox())!
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(900)
  await page.screenshot({
    path: '.artifacts/mountain-left-neighbor-failure.png',
    animations: 'disabled',
  })
})

test('the right-neighbor solution explains why the right edge is safe without pair controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  await page.getByRole('tab', { name: failureStep, exact: true }).click()
  await page.evaluate(() => document.fonts.ready)
  const leftComparisonBounds = await page.getByTestId('left-neighbor-comparison').boundingBox()
  await page.getByRole('tab', { name: solutionStep, exact: true }).click()
  const panel = page.getByRole('tabpanel', { name: solutionStep, exact: true })
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText('Why the right neighbor works')
  await expect(panel).toContainText(
    'mid never reaches the last index, so mid + 1 stays inside the array.',
  )
  await expect(panel.getByRole('button')).toHaveCount(0)
  await expect(panel.getByRole('slider')).toHaveCount(0)
  const comparison = panel.getByTestId('right-neighbor-comparison')
  expect(await comparison.boundingBox()).toEqual(leftComparisonBounds)
  const array = panel.getByRole('list', { name: 'Right-neighbor array' })
  const flow = panel.getByRole('list', { name: 'Right-neighbor search steps' })
  const steps = flow.getByRole('listitem')
  const slope = panel.getByTestId('mountain-connection')
  await expect(array.locator('.array-value')).toHaveText(['0', '1', '2', '3', '4', '5', '6', '0'])
  await expect(array.locator('[data-index="6"] .array-marker')).toHaveText('peak')
  for (const [name, index] of [
    ['left', 6],
    ['right', 7],
    ['mid', 6],
    ['mid + 1', 7],
  ] as const) {
    await expect(array.locator(`[data-pointer="${name}"]`)).toHaveAttribute(
      'data-index',
      String(index),
    )
    await expect(array.locator(`[data-pointer="${name}"] .pointer-stem`)).toBeVisible()
  }
  await expect(
    array.locator('[data-pointer="mid + 1"] .pointer-label').locator('span, strong'),
  ).toHaveText(['mid + 1', '→', '7'])
  await expect(slope).toHaveAttribute('data-from-index', '6')
  await expect(slope).toHaveAttribute('data-to-index', '7')
  await expect(comparison).toContainText('A[mid] > A[mid + 1]')
  await expect(comparison).toContainText('6 > 0')
  await expect(comparison).toContainText('Falling')
  await expect(steps).toHaveCount(4)
  await expect(flow.getByRole('heading')).toHaveText([
    'Reach the right edge',
    'Compute the midpoint',
    'Read the right neighbor',
    'Update the range',
  ])
  await expect(steps.nth(0).locator('code')).toHaveText('left = 6, right = 7')
  await expect(steps.nth(1).locator('code')).toHaveText(['mid = floor((6 + 7) / 2)', '= 6'])
  await expect(steps.nth(1)).toContainText('Round down: mid is left.')
  await expect(steps.nth(2).locator('code')).toHaveText(['mid + 1 = 6 + 1', '= 7'])
  await expect(steps.nth(2)).toContainText('Still inside the array.')
  await expect(steps.nth(3).locator('code')).toHaveText(['answer ← 6', 'right ← 5'])
  await expect(steps.nth(3)).toContainText('The last pair falls, so search left.')
  await page.evaluate(() => document.fonts.ready)
  for (const [upper, lower] of [
    ['mid', 'left'],
    ['mid + 1', 'right'],
  ]) {
    const top = (await array.locator(`[data-pointer="${upper}"] .pointer-label`).boundingBox())!
    const bottom = (await array.locator(`[data-pointer="${lower}"] .pointer-label`).boundingBox())!
    expect(top.y + top.height).toBeLessThan(bottom.y)
    expect(Math.abs(top.x + top.width / 2 - bottom.x - bottom.width / 2)).toBeLessThan(1)
  }
  const bounds = (await flow.boundingBox())!
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(900)
  await page.screenshot({
    path: '.artifacts/mountain-right-neighbor-solution.png',
    animations: 'disabled',
    fullPage: true,
  })
  await page.getByRole('tab', { name: resultStep, exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await expect(
    page.getByRole('list', { name: 'Algorithm pseudocode' }).getByRole('listitem'),
  ).toHaveCount(10)
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 3')
})

test('section and step navigation preserve experiments and pause solution playback', async ({
  page,
}) => {
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  const reasoning = page.getByRole('tab', { name: 'Reasoning', exact: true })
  const midpoint = page.getByRole('tab', { name: midpointStep, exact: true })
  const endpoints = page.getByRole('tab', { name: endpointsStep, exact: true })
  const rightNeighbor = page.getByRole('tab', { name: solutionStep, exact: true })
  const result = page.getByRole('tab', { name: resultStep, exact: true })
  await page.getByRole('slider', { name: 'Move the pair' }).press('End')
  await midpoint.focus()
  await midpoint.press('Shift+]')
  await expect(endpoints).toHaveAttribute('aria-selected', 'true')
  await expect(endpoints).not.toBeFocused()
  await page.getByRole('button', { name: 'Last pair', exact: true }).click()
  await endpoints.press('End')
  await expect(rightNeighbor).toBeFocused()
  await expect(reasoning).toHaveAttribute('aria-selected', 'true')

  await reasoning.focus()
  await reasoning.press('Shift+ArrowRight')
  await expect(result).not.toBeFocused()
  await expect(result).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tab')).toHaveCount(3)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await result.press('Home')
  await expect(page.getByRole('tab', { name: 'Approach', exact: true })).toBeFocused()
  await reasoning.click()
  await expect(rightNeighbor).toHaveAttribute('aria-selected', 'true')
  await endpoints.click()
  await expect(page.getByRole('button', { name: 'Last pair', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await midpoint.click()
  await expect(page.getByRole('slider', { name: 'Move the pair' })).toHaveValue('5')
  await page.getByRole('tabpanel', { name: midpointStep, exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await result.click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')

  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await page.getByRole('textbox', { name: 'Mountain array', exact: true }).fill('1, 5, 9, 4, 2')
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  await closeInputs(page)
  await page.clock.install()
  await page.getByRole('button', { name: 'Play visualization', exact: true }).click()
  await page.clock.runFor(2600)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('2')
  await reasoning.click()
  await endpoints.click()
  await page.clock.runFor(5200)
  await expect(
    page.getByRole('list', { name: 'Mountain endpoint array' }).locator('.array-value'),
  ).toHaveText(['1', '5', '9', '4', '2'])
  await expect(
    page.getByRole('tabpanel', { name: endpointsStep, exact: true }).getByRole('img'),
  ).toHaveAccessibleName('Mountain peak at index 2, value 9. First pair rises.')
  await rightNeighbor.click()
  await expect(
    page
      .getByRole('list', { name: 'Right-neighbor search steps' })
      .getByRole('listitem')
      .nth(3)
      .locator('code'),
  ).toHaveText(['answer ← 6', 'right ← 5'])
  await midpoint.click()
  await page.getByRole('slider', { name: 'Move the pair', exact: true }).press('End')
  await expect(page.getByTestId('midpoint-calculation').locator('.midpoint-result')).toHaveText(
    '= 3',
  )
  await page.getByRole('tabpanel', { name: midpointStep, exact: true }).focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowRight')
  await page.clock.runFor(5200)
  await result.click()
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('2')
  await page.getByRole('button', { name: 'Next step', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('3')

  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await page.getByRole('textbox', { name: 'Mountain array', exact: true }).fill('unfinished')
  await reasoning.click()
  await expect(midpoint).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('midpoint-calculation').locator('.midpoint-result')).toHaveText(
    '= 3',
  )
  await result.click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('3')
  await expect(page.getByRole('textbox', { name: 'Mountain array', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Mountain array', exact: true })).toHaveValue(
    '1, 5, 9, 4, 2',
  )
})

test('long integer values and a 16-element mountain fit every step', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  await page.getByRole('tab', { name: resultStep, exact: true }).click()
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  const values = Array.from(
    { length: 16 },
    (_, index) => Number.MAX_SAFE_INTEGER - Math.abs(index - 8),
  )
  await page.getByRole('textbox', { name: 'Mountain array', exact: true }).fill(values.join(','))
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  await page.getByRole('tab', { name: solutionStep, exact: true }).click()
  const array = page.getByRole('list', { name: 'Right-neighbor array' })
  await expect(
    array.locator('[data-pointer="mid + 1"] .pointer-label').locator('span, strong'),
  ).toHaveText(['mid + 1', '→', '7'])
  const midLabel = (await array.locator('[data-pointer="mid"] .pointer-label').boundingBox())!
  const neighborLabel = (await array
    .locator('[data-pointer="mid + 1"] .pointer-label')
    .boundingBox())!
  expect(midLabel.x + midLabel.width).toBeLessThanOrEqual(neighborLabel.x)
  for (const name of [midpointStep, endpointsStep, failureStep, solutionStep, resultStep]) {
    await page.getByRole('tab', { name, exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 8')
})
