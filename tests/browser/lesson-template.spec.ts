import { expect, test } from '@playwright/test'
import { closeInputs, liveVariable } from '../../src/modules/algorithms/__tests__/lessonHelpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/binary-search')
  await expect(
    page.getByRole('heading', { name: 'Find the first true', exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
})

test('the fixed problem header leads to full pseudocode without approach controls', async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem(
      'quant-lab.algorithms.lesson.binary-search-first-true.problem.v1',
      JSON.stringify({
        title: 'Old edited title',
        description: 'Old notes',
        exampleInput: '[]',
        exampleOutput: '-1',
      }),
    ),
  )
  await page.reload()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Find the first true', exact: true }),
  ).toBeVisible()
  await expect(page.getByTestId('problem-description')).toContainText('zero-based index')
  await expect(page.getByTestId('example-input')).toHaveText('[false, false, true, true, true]')
  await expect(page.getByTestId('example-output')).toHaveText('2')
  await expect(page.getByRole('button', { name: 'Edit problem', exact: true })).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'The approach', exact: true })).toHaveCount(0)
  const solution = page.getByRole('complementary', { name: 'Solution' })
  const code = solution.getByRole('list', { name: 'Algorithm pseudocode' })
  await expect(code.getByRole('listitem')).toHaveCount(10)
  await expect(code.getByRole('button')).toHaveCount(0)
  await expect(solution.getByRole('button')).toHaveCount(0)
  await expect(solution.locator('.approach, .step-detail, .repeat-marker')).toHaveCount(0)
  await expect(solution.getByRole('heading')).toHaveText(['Solution'])
  for (const line of await code.getByRole('listitem').all()) await expect(line).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit inputs', exact: true })).toBeVisible()
})

test('pseudocode follows assignments, both branches, rewind, and the empty range', async ({
  page,
}) => {
  const active = page.locator('.code-line.active')
  const next = page.getByRole('button', { name: 'Next step' })
  await expect(active).toHaveAttribute('data-instruction', 'bounds')
  await expect(page.getByTestId('assignment-result')).toHaveText('0, 11')
  await next.click()
  await expect(page.getByTestId('assignment-result')).toHaveText('−1')
  await expect(page.getByTestId('assignment-result')).toHaveAttribute('aria-label', 'answer = -1')
  await expect(liveVariable(page, 'answer')).toHaveText('−1')
  await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'loop')
  await expect(liveVariable(page, 'mid')).toHaveCount(0)
  await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'midpoint')
  await expect(liveVariable(page, 'mid')).toHaveText('5')
  await expect(page.getByTestId('assignment-result')).toHaveText('5')
  await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'condition')
  await expect(page.getByTestId('condition-result')).toHaveText('false')
  await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'left')
  await expect(page.getByTestId('assignment-result')).toHaveText('6')
  await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'loop')
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(active).toHaveAttribute('data-instruction', 'left')
  for (let index = 0; index < 3; index++) await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'condition')
  await expect(page.getByTestId('condition-result')).toHaveText('true')
  await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'save')
  await expect(page.getByTestId('assignment-result')).toHaveAttribute('aria-label', 'answer = 8')
  await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'right')
  await expect(page.getByTestId('assignment-result')).toHaveAttribute('aria-label', 'right = 7')
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(active).toHaveAttribute('data-instruction', 'return')
  await expect(page.getByTestId('search-result')).toHaveText('return 7')
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(active).toHaveAttribute('data-instruction', 'loop')
  await expect(page.getByTestId('condition-result')).toHaveText('false')
  await page.getByRole('slider', { name: 'Playback position' }).press('Home')
  await expect(active).toHaveAttribute('data-instruction', 'bounds')

  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await page.getByRole('combobox', { name: 'Input preset' }).selectOption('3')
  await closeInputs(page)
  await next.click()
  await next.click()
  await expect(page.getByTestId('condition-result')).toHaveText('false')
  await expect(liveVariable(page, 'mid')).toHaveCount(0)
  await next.click()
  await expect(active).toHaveAttribute('data-instruction', 'return')
  await expect(page.getByTestId('search-result')).toHaveText('return -1')
})

test('pseudocode fills the desktop panel with consistent indentation and no layout shifts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await page.getByRole('spinbutton', { name: 'Array length' }).fill('16')
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  await closeInputs(page)
  await page.evaluate(() => document.fonts.ready)
  const initial = await page.locator('.lesson-workspace').boundingBox()
  const initialCode = await page.locator('.code-list').boundingBox()
  const layout = await page.locator('.inspector').evaluate((element) => {
    const lines = [...element.querySelectorAll('.code-line')]
    const boxes = lines.map((line) => line.getBoundingClientRect())
    const heading = element.querySelector('.solution-heading')!.getBoundingClientRect()
    const code = element.querySelector('.code-list')!.getBoundingClientRect()
    const codePadding = (id: string) =>
      parseFloat(
        getComputedStyle(element.querySelector(`[data-instruction="${id}"] code`)!).paddingLeft,
      )
    return {
      fullWidth: Math.abs(heading.x - code.x) < 1 && Math.abs(heading.width - code.width) < 1,
      uniform: boxes.every(
        (box, index) =>
          box.height === boxes[0]!.height &&
          (index === 0 || Math.abs(box.y - boxes[index - 1]!.bottom) < 1),
      ),
      codeFits: lines.every((line) => line.scrollWidth <= line.clientWidth),
      indents: ['bounds', 'midpoint', 'condition', 'save', 'right', 'else', 'left', 'return'].map(
        codePadding,
      ),
    }
  })
  expect(layout.fullWidth).toBe(true)
  expect(layout.uniform).toBe(true)
  expect(layout.codeFits).toBe(true)
  const [base, indent] = layout.indents
  expect(base).toBe(0)
  expect(indent).toBeGreaterThanOrEqual(32)
  expect(layout.indents).toEqual([
    0,
    indent,
    indent,
    2 * indent!,
    2 * indent!,
    indent,
    2 * indent!,
    0,
  ])
  for (let index = 0; index < 12; index++) {
    await page.getByRole('button', { name: 'Next step' }).click()
    expect(await page.locator('.code-list').boundingBox()).toEqual(initialCode)
    expect(await page.locator('.lesson-workspace').boundingBox()).toEqual(initial)
    await expect(page.locator('.code-line[aria-current="step"]')).toHaveCount(1)
    const result = page.locator('.statement-result')
    if (await result.count()) {
      const statement = (await page.locator('.code-line.active code').boundingBox())!
      const resultBounds = (await result.boundingBox())!
      const gap = resultBounds.x - statement.x - statement.width
      expect(gap).toBeGreaterThanOrEqual(8)
      expect(gap).toBeLessThanOrEqual(16)
      expect(resultBounds.height).toBeLessThanOrEqual(36)
    }
    await expect(page.locator('.result-arrow')).toHaveCount(0)
  }
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({
    path: '.artifacts/first-true-pseudocode-1280.png',
    fullPage: true,
    animations: 'disabled',
  })
})
