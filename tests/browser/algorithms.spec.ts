import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import {
  applyPreset,
  closeInputs,
  liveVariable,
} from '../../src/modules/algorithms/__tests__/lessonHelpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/binary-search')
  await expect(
    page.getByRole('heading', { name: 'Find the first true', exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
})

test('the minimal desktop lesson shows pseudocode without global navigation or open settings', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text())
  })
  await page.reload()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Learning modules' })).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Array settings' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Solution', exact: true })).toBeVisible()
  await expect(page.getByRole('tab')).toHaveText(['Approach', 'Solution'])
  await expect(
    page.getByRole('region', { name: 'Binary search array' }).getByRole('listitem'),
  ).toHaveCount(12)
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'bounds')
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await mkdir('.artifacts', { recursive: true })
  await page.screenshot({
    path: '.artifacts/binary-search.png',
    fullPage: true,
    animations: 'disabled',
  })
  for (let step = 0; step < 3; step++) await page.getByRole('button', { name: 'Next step' }).click()
  await expect(liveVariable(page, 'mid')).toHaveText('5')
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'midpoint')
  await page.screenshot({
    path: '.artifacts/binary-search-step.png',
    fullPage: true,
    animations: 'disabled',
  })
  expect(errors).toEqual([])
})

test('one step executes one statement and saving an answer is separate from moving a bound', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await page.getByRole('combobox', { name: 'Input preset' }).selectOption('0')
  await closeInputs(page)
  await expect(liveVariable(page, 'answer')).toHaveCount(0)
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'answer')
  await expect(liveVariable(page, 'answer')).toHaveText('−1')
  await expect(liveVariable(page, 'mid')).toHaveCount(0)
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'loop')
  await expect(page.getByTestId('condition-result')).toHaveText('true')
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(liveVariable(page, 'mid')).toHaveText('2')
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'condition')
  await expect(page.getByTestId('condition-result')).toHaveText('true')
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'save')
  await expect(liveVariable(page, 'answer')).toHaveText('2')
  await expect(liveVariable(page, 'right')).toHaveText('4')
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'right')
  await expect(liveVariable(page, 'right')).toHaveText('1')
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(liveVariable(page, 'right')).toHaveText('4')
  await expect(liveVariable(page, 'answer')).toHaveText('2')
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 2')
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'return')
  await expect(page.getByRole('button', { name: 'Next step' })).toBeDisabled()
  await page.screenshot({
    path: '.artifacts/binary-search-result.png',
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(page.getByTestId('condition-result')).toHaveText('false')
  await expect(page.getByTestId('search-result')).toHaveCount(0)
  await page.getByRole('button', { name: 'Reset visualization' }).click()
  await expect(liveVariable(page, 'answer')).toHaveCount(0)
})

test('edge-case presets finish with the correct result', async ({ page }) => {
  for (const [preset, result] of [
    [1, -1],
    [2, 0],
    [3, -1],
  ] as const) {
    await applyPreset(page, preset)
    await closeInputs(page)
    await page.getByRole('slider', { name: 'Playback position' }).press('End')
    await expect(page.getByTestId('search-result')).toHaveText(`return ${result}`)
  }
  await expect(page.getByText('Empty array', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await expect(page.getByRole('slider', { name: /First true/ })).toBeDisabled()
})

test('custom inputs stay sorted, apply together, and reset playback while opening the editor pauses', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Play visualization' }).click()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeDisabled()
  const size = page.getByRole('spinbutton', { name: 'Array length' })
  const boundary = page.getByRole('slider', { name: /First true/ })
  for (const invalid of ['-1', '17', '1.5', '']) {
    await size.fill(invalid)
    await page.getByRole('button', { name: 'Apply inputs' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByTestId('array-length')).toHaveText('n = 12')
  }
  await size.fill('16')
  await boundary.press('Home')
  for (let index = 0; index < 3; index++) await boundary.press('ArrowRight')
  await expect(page.getByTestId('array-length')).toHaveText('n = 12')
  await page.getByRole('button', { name: 'Apply inputs' }).click()
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 3')
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await size.fill('1')
  await boundary.press('Home')
  await page.getByRole('button', { name: 'Apply inputs' }).click()
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 0')
  await page.getByRole('button', { name: 'Replay visualization' }).click()
  await applyPreset(page, 0)
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await expect(liveVariable(page, 'right')).toHaveText('4')
})

test('playback, pause, and keyboard navigation keep pseudocode synchronized', async ({ page }) => {
  await page.clock.install()
  await page.getByRole('button', { name: 'Play visualization' }).click()
  await page.clock.runFor(1300)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('1')
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'answer')
  await page.getByRole('button', { name: 'Pause visualization' }).click()
  await page.clock.runFor(5000)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('1')
  await page.getByRole('heading', { name: 'Find the first true', exact: true }).click()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'loop')
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'answer')
  await page.keyboard.press('Space')
  await page.clock.runFor(40000)
  await expect(page.getByRole('button', { name: 'Replay visualization' })).toBeVisible()
  await expect(page.getByTestId('search-result')).toHaveText('return 7')
})

test('catalog and lesson navigation keep the algorithm theme consistent', async ({ page }) => {
  const appearance = () =>
    page.locator('.algorithms-module').evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        background: style.backgroundColor,
        font: style.fontFamily,
        accent: style.getPropertyValue('--algo-accent'),
      }
    })
  const initial = await appearance()
  await page.getByRole('link', { name: 'Back to questions' }).click()
  await expect(page.getByRole('heading', { name: 'Algo Lab', exact: true })).toBeVisible()
  expect(await appearance()).toEqual(initial)
  await page.getByRole('link', { name: 'Open Find the first true', exact: true }).click()
  expect(await appearance()).toEqual(initial)
  await page.reload()
  expect(await appearance()).toEqual(initial)
})

test('the 1280px desktop layout keeps the array and pseudocode readable without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await page.getByRole('spinbutton', { name: 'Array length' }).fill('16')
  await page.getByRole('spinbutton', { name: 'Array length' }).press('Tab')
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page
      .locator('.array-cell')
      .evaluateAll((cells) => cells.every((cell) => cell.scrollWidth <= cell.clientWidth)),
  ).toBe(true)
  expect(
    await page
      .locator('.code-list')
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true)
  await page.screenshot({
    path: '.artifacts/binary-search-1280.png',
    fullPage: true,
    animations: 'disabled',
  })
})

for (const { route, separateStep, sharedStep } of [
  { route: 'binary-search', separateStep: 10, sharedStep: 16 },
  { route: 'first-occurrence', separateStep: 6, sharedStep: 13 },
  { route: 'square-root', separateStep: 3, sharedStep: 19 },
]) {
  test(`${route} keeps free search pointers level and stacks only when needed`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/${route}`)
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await page.evaluate(() => document.fonts.ready)
    const visual = page.locator('.visualization:visible')
    const slider = page.getByRole('slider', { name: 'Playback position' })
    const label = (name: string) => visual.locator(`[data-pointer="${name}"] .pointer-label`)

    // Repeat the separated frame after stacking to catch labels that stay unnecessarily high.
    for (const step of [separateStep, sharedStep, separateStep]) {
      await slider.fill(String(step))
      await expect(async () => {
        const left = (await label('left').boundingBox())!
        const right = (await label('right').boundingBox())!
        const mid = (await label('mid').boundingBox())!
        const answer = (await label('answer').boundingBox())!
        if (step === sharedStep) {
          expect(mid.y + mid.height).toBeLessThan(right.y)
          expect(right.y + right.height).toBeLessThan(left.y)
        } else {
          expect(Math.abs(mid.y - left.y)).toBeLessThan(1)
          expect(Math.abs(mid.y - right.y)).toBeLessThan(1)
          const labels = [left, right, mid].sort((a, b) => a.x - b.x)
          for (let index = 1; index < labels.length; index++)
            expect(labels[index]!.x).toBeGreaterThanOrEqual(
              labels[index - 1]!.x + labels[index - 1]!.width,
            )
        }
        expect(answer.y).toBeGreaterThan(left.y + left.height)
      }).toPass()
    }
  })
}

test('variable pointers follow cells, stack at shared indices, and leave the array at terminal bounds', async ({
  page,
}) => {
  const array = page.getByRole('region', { name: 'Binary search array' })
  for (const name of ['left', 'right']) {
    await expect(array.getByTestId(`variable-${name}`)).toBeVisible()
    await expect(
      page.getByRole('complementary', { name: 'Solution' }).getByTestId(`variable-${name}`),
    ).toHaveCount(0)
  }
  for (const name of ['mid', 'answer'])
    await expect(array.getByTestId(`variable-${name}`)).toHaveCount(0)
  for (let index = 0; index < 3; index++)
    await page.getByRole('button', { name: 'Next step' }).click()
  const stemCenter = async (name: string) => {
    const box = await array.locator(`[data-pointer="${name}"] .pointer-stem`).boundingBox()
    return box!.x + box!.width / 2
  }
  const midpointCell = await array.locator('.array-cell').nth(5).boundingBox()
  await expect
    .poll(async () =>
      Math.abs((await stemCenter('mid')) - (midpointCell!.x + midpointCell!.width / 2)),
    )
    .toBeLessThan(1)
  for (let index = 0; index < 6; index++)
    await page.getByRole('button', { name: 'Next step' }).click()
  await expect(array.getByTestId('variable-mid')).toHaveText('8')
  await expect(array.getByTestId('variable-answer')).toHaveText('8')
  const candidateCell = await array.locator('.array-cell').nth(8).boundingBox()
  for (const name of ['mid', 'answer'])
    await expect
      .poll(async () =>
        Math.abs((await stemCenter(name)) - (candidateCell!.x + candidateCell!.width / 2)),
      )
      .toBeLessThan(1)
  const midLabel = await array.locator('[data-pointer="mid"] .pointer-label').boundingBox()
  const answerLabel = await array.locator('[data-pointer="answer"] .pointer-label').boundingBox()
  expect(answerLabel!.y).toBeGreaterThan(midLabel!.y + midLabel!.height)
  await page.screenshot({
    path: '.artifacts/binary-search-pointers.png',
    fullPage: true,
    animations: 'disabled',
  })
  await applyPreset(page, 1)
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  const lastCell = await array.locator('.array-cell').last().boundingBox()
  await expect(array.locator('[data-pointer="left"]')).toHaveAttribute('data-edge', 'after')
  await expect(array.getByTestId('variable-left')).toHaveText('12')
  await expect
    .poll(async () => await stemCenter('left'))
    .toBeGreaterThan(lastCell!.x + lastCell!.width)
  await applyPreset(page, 2)
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  const firstCell = await array.locator('.array-cell').first().boundingBox()
  await expect(array.locator('[data-pointer="right"]')).toHaveAttribute('data-edge', 'before')
  await expect(array.getByTestId('variable-right')).toHaveText('-1')
  await expect.poll(async () => await stemCenter('right')).toBeLessThan(firstCell!.x)
  await page.screenshot({
    path: '.artifacts/binary-search-edge-pointers.png',
    fullPage: true,
    animations: 'disabled',
  })
  const visualBounds = await array.boundingBox()
  for (const label of await array.locator('.pointer-label').all()) {
    const bounds = await label.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(visualBounds!.x)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(visualBounds!.x + visualBounds!.width)
  }
  await applyPreset(page, 3)
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(array.locator('.array-pointer')).toHaveCount(0)
  for (const name of ['left', 'right', 'answer'])
    await expect(liveVariable(page, name)).toBeVisible()
  await expect(liveVariable(page, 'mid')).toHaveCount(0)
})
