import { expect, test } from '@playwright/test'
import { closeInputs } from './lessonHelpers'

test('mountain question is linked from the catalog and the binary-search pattern', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Open The peak of a mountain array', exact: true }).click()
  await expect(page).toHaveURL('/mountain-peak')
  await page.reload()
  await expect(page).toHaveTitle('The peak of a mountain array · Algo Lab')
  await expect(page.getByTestId('example-input')).toHaveText('[0, 1, 2, 3, 2, 1, 0]')
  await expect(page.getByTestId('example-output')).toHaveText('3')
  const sources = page
    .locator('.lesson-heading')
    .getByRole('navigation', { name: 'Problem sources' })
  await expect(sources).toBeVisible()
  await expect(sources.getByRole('link', { name: 'AlgoMonster' })).toHaveAttribute(
    'href',
    'https://algo.monster/problems/peak_of_mountain_array',
  )
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  await page.getByRole('tab', { name: 'Step 3: Left-neighbor failure', exact: true }).click()
  await expect(
    page.getByRole('heading', {
      name: 'Why the left-neighbor attempt fails',
      exact: true,
    }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Search variant' })).toHaveCount(0)
  await expect(page.locator('.lesson-reading')).toHaveCount(0)
  await expect(page.locator('[data-chapter="solution"] .chapter-heading')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'AlgoMonster' })).toHaveCount(1)
  const visualization = page.getByRole('region', { name: 'Interactive visualization', exact: true })
  await visualization.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await expect(
    visualization.getByRole('textbox', { name: 'Mountain array', exact: true }),
  ).toBeVisible()
  await visualization.getByRole('button', { name: 'Close input editor', exact: true }).click()
  await page.getByRole('link', { name: 'Back to questions' }).click()
  await page.getByRole('link', { name: 'Open Binary search pattern', exact: true }).click()
  await page
    .getByRole('navigation', { name: 'Related questions' })
    .getByRole('link', { name: 'Open The peak of a mountain array', exact: true })
    .click()
  await expect(page).toHaveURL('/mountain-peak')
})

test('flat array, backdrop, pointers, and code follow the same execution', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1280, height: 1060 })
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  const next = page.getByRole('button', { name: 'Next step' })
  for (let i = 0; i < 4; i++) await next.click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'condition')
  await expect(page.getByTestId('condition-result')).toHaveText('true')
  await expect(page.locator('.mountain-backdrop circle')).toHaveCount(7)
  const alignment = await page.locator('.visualization').evaluate((element) => {
    const cells = Array.from(element.querySelectorAll('.array-cell'), (cell) =>
      cell.getBoundingClientRect(),
    )
    const dots = Array.from(element.querySelectorAll('.mountain-backdrop circle'), (dot) =>
      dot.getBoundingClientRect(),
    )
    return {
      flat: cells.every((cell) => cell.y === cells[0]!.y),
      aligned: dots.every(
        (dot, index) =>
          Math.abs(dot.x + dot.width / 2 - cells[index]!.x - cells[index]!.width / 2) < 1,
      ),
      behind: Math.max(...dots.map((dot) => dot.y)) > cells[0]!.y,
    }
  })
  expect(alignment).toEqual({ flat: true, aligned: true, behind: true })
  await expect(
    page
      .getByRole('tabpanel', { name: 'Solution', exact: true })
      .locator('.approach, .step-detail, .repeat-marker'),
  ).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page
      .locator('.code-line')
      .evaluateAll((lines) => lines.every((line) => line.scrollWidth <= line.clientWidth)),
  ).toBe(true)
  await page.screenshot({
    path: '.artifacts/mountain-peak.png',
    fullPage: true,
    animations: 'disabled',
  })
  await next.click()
  await expect(page.getByTestId('variable-answer')).toHaveText('3')
  await expect(
    page.getByRole('tabpanel', { name: 'Solution', exact: true }).getByTestId('variable-right'),
  ).toHaveText('6')
  await next.click()
  await expect(
    page.getByRole('tabpanel', { name: 'Solution', exact: true }).getByTestId('variable-right'),
  ).toHaveText('2')
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(
    page.getByRole('tabpanel', { name: 'Solution', exact: true }).getByTestId('variable-right'),
  ).toHaveText('6')
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 3')
  await expect(
    page.getByRole('list', { name: 'Algorithm pseudocode' }).getByRole('listitem'),
  ).toHaveCount(10)
  expect(errors).toEqual([])
})

test('all presets find the peak and reject malformed mountains without losing the run', async ({
  page,
}) => {
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  for (const [index, answer] of [3, 1, 4, 1, 1].entries()) {
    await page.getByRole('button', { name: 'Edit inputs' }).click()
    await page.getByRole('combobox', { name: 'Input preset' }).selectOption(String(index))
    await closeInputs(page)
    await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
    await closeInputs(page)
    await page.getByRole('slider', { name: 'Playback position' }).press('End')
    await expect(page.getByTestId('search-result')).toHaveText('return ' + answer)
  }
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  const input = page.getByRole('textbox', { name: 'Mountain array', exact: true })
  for (const invalid of [
    '',
    '0,1',
    '0,1,2',
    '3,2,1',
    '0,2,2,0',
    '0,3,1,2,0',
    '0,1.5,0',
    Array.from({ length: 17 }, (_, i) => (i < 9 ? i : 16 - i)).join(','),
  ]) {
    await input.fill(invalid)
    await input.press('Enter')
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByTestId('search-result')).toHaveText('return 1')
    await expect(
      page.getByRole('list', { name: 'Mountain array', exact: true }).getByRole('listitem'),
    ).toHaveCount(4)
  }
  await input.fill('[2, 5, 8, 12, 9, 5]')
  await input.press('Enter')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 3')
})

test('changing inputs stops playback and leaving the lesson cleans up its timer', async ({
  page,
}) => {
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.clock.install()
  await page.getByRole('button', { name: 'Play visualization', exact: true }).click()
  await page.clock.runFor(2600)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('2')
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await page.getByRole('combobox', { name: 'Input preset' }).selectOption('1')
  await closeInputs(page)
  await page.clock.runFor(2600)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await page.getByRole('button', { name: 'Play visualization', exact: true }).click()
  await page.getByRole('link', { name: 'Back to questions' }).click()
  await page.clock.runFor(5000)
  await page.getByRole('link', { name: 'Open The peak of a mountain array', exact: true }).click()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
})
