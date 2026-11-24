import { expect, test, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { applyPreset, closeInputs, liveVariable } from './lessonHelpers'

async function finish(page: Page) {
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
}
async function seekInstruction(page: Page, instruction: string) {
  for (let step = 0; step < 100; step++) {
    if ((await page.locator('.code-line.active').getAttribute('data-instruction')) === instruction)
      return
    await page.getByRole('button', { name: 'Next step' }).click()
  }
  throw new Error('Instruction not reached: ' + instruction)
}

test('both new questions open from the catalog and the binary-search pattern', async ({ page }) => {
  for (const [path, title, source] of [
    ['square-root', 'Find the integer square root', 'sqrt'],
    ['rotated-minimum', 'Find the minimum in a rotated array', 'min_in_rotated_sorted_array'],
  ]) {
    await page.goto('/')
    await page.getByRole('link', { name: 'Open ' + title, exact: true }).click()
    await expect(page).toHaveURL('/' + path)
    await page.reload()
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'AlgoMonster' })).toHaveAttribute(
      'href',
      'https://algo.monster/problems/' + source,
    )
    await expect(page.locator('.lesson-reading')).toHaveCount(0)
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await expect(page.locator('.lesson-meta')).toContainText('Time O(log n)')
    await expect(page.getByRole('tablist')).toHaveCount(1)
    await page.getByRole('link', { name: 'Back to questions' }).click()
    await page.getByRole('link', { name: 'Open Binary search pattern', exact: true }).click()
    await expect(page.getByRole('link', { name: 'Open ' + title, exact: true })).toBeVisible()
  }
})

test('square-root examples run with both approaches and preserve the upper boundary during correction', async ({
  page,
}) => {
  await page.goto('/square-root')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByTestId('example-output')).toHaveText(['4', '2'])
  for (const approach of ['Lower boundary', 'Upper boundary']) {
    await page.getByRole('button', { name: approach, exact: true }).click()
    for (const [n, answer] of [
      [0, 0],
      [1, 1],
      [2, 1],
      [8, 2],
      [9, 3],
      [10, 3],
      [16, 4],
      [1000, 31],
    ]) {
      await applyPreset(page, `n = ${n}`)
      await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
      await finish(page)
      await expect(page.getByTestId('search-result')).toHaveText('return ' + answer)
    }
  }
  await applyPreset(page, 'n = 8')
  await seekInstruction(page, 'adjust')
  await expect(liveVariable(page, 'boundary')).toHaveText('3')
  await expect(liveVariable(page, 'answer')).toHaveText('2')
  await expect(page.getByTestId('assignment-result')).toHaveText('2')
  await expect(page.getByTestId('root-adjustment')).toContainText('3 − 1 = 2')
  await expect(page.locator('.root-visualization [data-pointer=boundary]')).toHaveAttribute(
    'data-index',
    '3',
  )
  await expect(page.locator('.root-visualization [data-pointer=answer]')).toHaveAttribute(
    'data-index',
    '2',
  )
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(page.getByTestId('root-adjustment')).toHaveCount(0)
  await page.getByRole('button', { name: 'Lower boundary', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await finish(page)
  await expect(liveVariable(page, 'answer')).toHaveText('2')
  await expect(page.locator('.lesson-reading')).toHaveCount(0)
})

test('square-root input validation preserves the run and supports exact large-integer comparisons', async ({
  page,
}) => {
  await page.goto('/square-root')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  const input = page.getByRole('textbox', { name: 'Non-negative integer n' })
  for (const invalid of ['-1', '1.5', '1e2', '', '9007199254740992']) {
    await input.fill(invalid)
    await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByTestId('root-input')).toHaveText('n = 16')
  }
  await input.fill('9007199254740991')
  await input.press('Enter')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await closeInputs(page)
  await seekInstruction(page, 'midpoint')
  await expect(page.locator('.root-visualization [data-pointer=mid]')).toHaveAttribute(
    'data-index',
    '4503599627370495',
  )
  await expect(page.locator('.root-candidates [data-candidate="4503599627370495"]')).toBeVisible()
  expect(await page.locator('.root-candidates .candidate-cell').count()).toBeLessThan(17)
  await finish(page)
  await expect(page.getByTestId('search-result')).toHaveText('return 94906265')
})

test('rotated minimum returns the correct index for every preset', async ({ page }) => {
  await page.goto('/rotated-minimum')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByTestId('example-output')).toHaveText(['3', '7'])
  await seekInstruction(page, 'save')
  await expect(liveVariable(page, 'answer')).toHaveText('3')
  await expect(liveVariable(page, 'right')).toHaveText('4')
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(liveVariable(page, 'right')).toHaveText('2')
  await expect(page.getByTestId('fixed-last')).toHaveText('A[−1] = 20')
  for (const [index, answer] of [
    [0, 3],
    [1, 7],
    [2, 0],
    [3, 0],
    [4, 1],
    [5, 0],
    [6, 2],
  ]) {
    await applyPreset(page, index!)
    await finish(page)
    await expect(page.getByTestId('search-result')).toHaveText('return ' + answer)
    await expect(page.locator('.array-item.candidate .array-index')).toHaveText(String(answer))
  }
  await expect(page.locator('[data-instruction="condition"] code')).toHaveText('if A[mid] ≤ A[−1]')
  await expect(page.locator('.lesson-reading')).toHaveCount(0)
})

test('rotated custom inputs reject duplicates, empty arrays, and invalid rotations without losing state', async ({
  page,
}) => {
  await page.goto('/rotated-minimum')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  const input = page.getByRole('textbox', { name: 'Rotated array' })
  for (const invalid of [
    '[]',
    '1,1',
    '1,2,1',
    '2,1,3',
    '1.5,3',
    Array.from({ length: 17 }, (_, index) => index).join(','),
  ]) {
    await input.fill(invalid)
    await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByTestId('fixed-last')).toHaveText('A[−1] = 20')
  }
  await input.fill('[3, 7, -5, -1]')
  await input.press('Enter')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await finish(page)
  await expect(page.getByTestId('search-result')).toHaveText('return 2')
})

test('new lessons fit the desktop layout and reset playback when switching approaches or inputs', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.clock.install()
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.goto('/square-root')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Play visualization' }).click()
  await page.clock.runFor(2600)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('2')
  await page.getByRole('button', { name: 'Upper boundary', exact: true }).click()
  await page.clock.runFor(2600)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  for (const path of ['square-root', 'rotated-minimum']) {
    await page.goto('/' + path)
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    if (path === 'square-root') {
      await page.getByRole('button', { name: 'Upper boundary', exact: true }).click()
    }
    await finish(page)
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(
      await page
        .locator('.code-line')
        .evaluateAll((lines) => lines.every((line) => line.scrollWidth <= line.clientWidth)),
    ).toBe(true)
    await mkdir('.artifacts', { recursive: true })
    await page.screenshot({
      path: '.artifacts/' + path + '.png',
      fullPage: true,
      animations: 'disabled',
    })
  }
  expect(errors).toEqual([])
})

test('square-root approach keeps both boundary directions and live inputs in sync with the solution', async ({
  page,
}) => {
  await page.goto('/square-root')
  const approach = page.getByRole('tabpanel', { name: 'Approach', exact: true })
  const preset = approach.getByRole('combobox', { name: 'Approach input' })
  await preset.selectOption({ label: 'n = 8' })
  await expect(approach.locator('.split-card.is-target')).toContainText('candidate² ≤ n')
  await approach.getByRole('button', { name: 'Try candidate 2 as mid', exact: true }).click()
  await expect(approach.locator('.decision-case.is-active')).toContainText(
    'Save mid · Search right',
  )
  await approach.getByRole('button', { name: 'Try candidate 3 as mid', exact: true }).click()
  await expect(approach.locator('.decision-case.is-active')).toContainText('Search left')
  await expect(approach.locator('.saved-candidate')).toHaveCount(0)
  await page.getByRole('button', { name: 'Upper boundary', exact: true }).click()
  await expect(approach.locator('.split-card.is-target')).toContainText('candidate² ≥ n')
  await approach.getByRole('button', { name: 'Try candidate 3 as mid', exact: true }).click()
  await expect(approach.locator('.decision-case.is-active')).toContainText('Save mid · Search left')
  await expect(approach.locator('.boundary-correction')).toContainText('3 − 1 = 2')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await finish(page)
  await expect(page.getByTestId('search-result')).toHaveText('return 2')
  await page.getByRole('tab', { name: 'Approach', exact: true }).click()
  await preset.selectOption({ label: 'n = 0' })
  await expect(approach.locator('.candidate-cell')).toHaveText(['0'])
  await preset.selectOption('custom')
  await expect(page.getByTestId('approach-root-input')).toHaveText('n = 16')
})

for (const question of [
  {
    path: 'rotated-minimum',
    field: 'Rotated array',
    reference: 'last',
    initial: ['30', '40', '50', '10', '20'],
    invalid: '2, 1, 3',
    custom: '3, 7, -5, -1',
    changed: ['3', '7', '-5', '-1'],
    preset: '1 item',
    presetValues: ['7'],
  },
  {
    path: 'mountain-peak',
    field: 'Mountain array',
    reference: 'mid + 1',
    initial: ['0', '1', '2', '3', '2', '1', '0'],
    invalid: '0, 2, 2, 0',
    custom: '1, 4, 9, 3',
    changed: ['1', '4', '9', '3'],
    preset: '3 items',
    presetValues: ['0', '1', '0'],
  },
]) {
  test(`${question.path}: approach comparisons and live inputs stay in sync with the solution`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/' + question.path)
    const approach = page.getByRole('tabpanel', { name: 'Approach', exact: true })
    const cells = approach.locator('.approach-cell')
    const preset = approach.getByRole('combobox', { name: 'Approach input' })
    await expect(cells).toHaveText(question.initial)
    await cells.nth(2).click()
    await expect(approach.locator('.decision-case.is-active')).toContainText('Search right')
    await expect(
      approach.locator(`[data-pointer="${question.reference}"] .pointer-label`),
    ).toBeVisible()
    await cells.nth(3).click()
    await expect(approach.locator('.decision-case.is-active')).toContainText('Save mid')
    await expect(approach.getByLabel('Saved index', { exact: true })).toHaveText('3')
    if (question.path === 'mountain-peak') {
      await expect(cells.last()).toBeDisabled()
      await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
      await expect(
        page.getByRole('tablist', { name: 'Reasoning', exact: true }).getByRole('tab'),
      ).toHaveCount(4)
      await page.getByRole('tab', { name: 'Approach', exact: true }).click()
    }
    await preset.selectOption({ label: question.preset })
    await expect(cells).toHaveText(question.presetValues)
    await preset.selectOption('custom')
    await expect(cells).toHaveText(question.initial)
    await approach.getByRole('button', { name: 'Edit inputs', exact: true }).click()
    const input = approach.getByRole('textbox', { name: question.field, exact: true })
    await input.fill(question.invalid)
    await input.press('Enter')
    await expect(approach.getByRole('alert')).toBeVisible()
    await expect(cells).toHaveText(question.initial)
    await input.fill(question.custom)
    await input.press('Enter')
    await expect(approach.getByRole('alert')).toHaveCount(0)
    await expect(cells).toHaveText(question.changed)
    await approach.getByRole('button', { name: 'Close input editor', exact: true }).click()
    await preset.selectOption({ label: question.preset })
    await preset.selectOption('custom')
    await expect(cells).toHaveText(question.changed)
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await expect(page.locator('.array-cell .cell-value')).toHaveText(question.changed)
    await seekInstruction(page, 'condition')
    await expect(page.locator('.solution-decisions .decision-case.is-active')).toContainText(
      'Search right',
    )
    await finish(page)
    await expect(page.getByTestId('search-result')).toHaveText('return 2')
  })
}

test('rotated reasoning follows the source steps and explains the two comparison pitfalls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 960 })
  await page.goto('/rotated-minimum')
  await page.getByRole('tab', { name: 'Reasoning', exact: true }).click()
  const reasoning = page.getByRole('tabpanel', { name: 'Reasoning', exact: true })
  await expect(reasoning.getByRole('tablist').getByRole('tab')).toHaveText([
    '1Overall shape',
    '2Why not neighbors?',
    '3Fixed last element',
    '4Why include =?',
  ])
  const shape = reasoning.getByRole('tabpanel', { name: 'Step 1: Overall shape', exact: true })
  await expect(shape.locator('[data-pointer="target"]')).toHaveAttribute('data-index', '3')
  await expect
    .poll(() =>
      shape.locator('.profile-track').evaluate((element) => {
        const cells = Array.from(element.querySelectorAll('.array-value'), (cell) =>
          cell.getBoundingClientRect(),
        )
        const dots = Array.from(element.querySelectorAll('circle'), (dot) =>
          dot.getBoundingClientRect(),
        )
        return (
          dots.length === cells.length &&
          cells.every(
            (cell, index) =>
              cell.top === cells[0]!.top &&
              Math.abs(cell.left + cell.width / 2 - dots[index]!.left - dots[index]!.width / 2) < 1,
          )
        )
      }),
    )
    .toBe(true)
  await reasoning.getByRole('tab', { name: 'Step 2: Why not neighbors?', exact: true }).click()
  const neighbors = reasoning.getByRole('tabpanel', {
    name: 'Step 2: Why not neighbors?',
    exact: true,
  })
  await expect(neighbors.locator('.comparison-result')).toHaveText([
    'Target is to the right',
    'Target is to the left',
  ])
  await expect(neighbors.locator('.lesson-comparison > code:nth-child(2)')).toHaveText([
    '30 < 40 → true',
    '10 < 20 → true',
  ])
  await reasoning.getByRole('tab', { name: 'Step 3: Fixed last element', exact: true }).click()
  const reference = reasoning.getByRole('tabpanel', {
    name: 'Step 3: Fixed last element',
    exact: true,
  })
  await reference.getByRole('button', { name: 'Inspect index 0: 30', exact: true }).click()
  await expect(reference.getByTestId('rotated-fixed-last-comparison')).toContainText('30 ≤ 20')
  await expect(reference.locator('.decision-case.is-active')).toContainText('left ← mid + 1')
  await reference.getByRole('button', { name: 'Inspect index 3: 5', exact: true }).click()
  await expect(reference.locator('.decision-case.is-active')).toContainText('answer ← mid')
  await expect(reference.locator('.decision-case.is-active')).toContainText('right ← mid − 1')
  await reference.getByRole('button', { name: 'Inspect index 5: 20', exact: true }).click()
  await expect(reference.getByTestId('rotated-fixed-last-comparison')).toContainText('20 ≤ 20')
  await expect(
    reference.getByTestId('rotated-fixed-last-comparison').locator('.comparison-result'),
  ).toHaveText('true')
  await reasoning.getByRole('tab', { name: 'Step 4: Why include =?', exact: true }).click()
  const equality = reasoning.getByRole('tabpanel', { name: 'Step 4: Why include =?', exact: true })
  await expect(equality.locator('[data-pointer="mid"]')).toHaveAttribute('data-index', '7')
  await expect(equality.locator('[data-pointer="last"]')).toHaveAttribute('data-index', '7')
  await expect(equality.locator('.comparison-result')).toHaveText([
    'Rejects the target',
    'Saves target index 7',
  ])
  await page.keyboard.press('Shift+BracketLeft')
  await expect(reference).toBeVisible()
  await page.keyboard.press('Shift+ArrowRight')
  await expect(page.getByRole('tab', { name: 'Solution', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.locator('.array-cell .cell-value')).toHaveText(['30', '40', '50', '10', '20'])
})

test('rotated array profiles follow live inputs in approach and solution, including a singleton', async ({
  page,
}) => {
  await page.goto('/rotated-minimum')
  const approach = page.getByRole('tabpanel', { name: 'Approach', exact: true })
  await expect(approach.locator('.array-profile-backdrop circle')).toHaveCount(5)
  await approach.getByRole('combobox', { name: 'Approach input' }).selectOption({ label: '1 item' })
  await expect(approach.locator('.array-profile-backdrop circle')).toHaveCount(1)
  expect(
    await approach
      .locator('.array-profile-backdrop circle')
      .evaluate(
        (circle) =>
          Number.isFinite(Number(circle.getAttribute('cx'))) &&
          Number.isFinite(Number(circle.getAttribute('cy'))),
      ),
  ).toBe(true)
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  const solution = page.getByRole('tabpanel', { name: 'Solution', exact: true })
  await expect(solution.locator('.array-profile-backdrop circle')).toHaveCount(1)
  await applyPreset(page, 'Negative values')
  await expect(solution.locator('.array-profile-backdrop circle')).toHaveCount(5)
  await finish(page)
  await expect(page.getByTestId('search-result')).toHaveText('return 2')
})
