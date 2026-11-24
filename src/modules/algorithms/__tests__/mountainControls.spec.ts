import { expect, test } from '@playwright/test'
import { closeInputs } from './lessonHelpers'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/mountain-peak')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
})

test('live variables appear on assignment and disappear when stepping back before initialization', async ({
  page,
}) => {
  const variables = page.getByTestId('live-variables')
  const next = page.getByRole('button', { name: 'Next step', exact: true })
  const previous = page.getByRole('button', { name: 'Previous step', exact: true })
  await expect(variables.locator('dt')).toHaveText(['left', 'right'])
  await expect(variables.locator('dd')).toHaveText(['0', '6'])
  await expect(page.getByTestId('array-length')).toHaveText('n = 7')
  await expect(page.locator('.unassigned-pointers')).toHaveCount(0)
  await next.click()
  await expect(variables.locator('dt')).toHaveText(['left', 'right', 'answer'])
  await expect(variables.locator('[data-variable="answer"] dd')).toHaveText('−1')
  await next.click()
  await next.click()
  await expect(variables.locator('dt')).toHaveText(['left', 'right', 'mid', 'answer'])
  await expect(variables.locator('[data-variable="mid"] dd')).toHaveText('3')
  await previous.click()
  await expect(variables.locator('[data-variable="mid"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Reset visualization' }).click()
  await expect(variables.locator('dt')).toHaveText(['left', 'right'])
  await expect(page.getByTestId('array-length')).toHaveText('n = 7')
})

test('custom typing preserves the layout and run until confirmed, and Escape discards the draft', async ({
  page,
}) => {
  const slider = page.getByRole('slider', { name: 'Playback position' })
  const edit = page.getByRole('button', { name: 'Edit inputs', exact: true })
  const input = page.getByRole('textbox', { name: 'Mountain array', exact: true })
  await slider.press('End')
  const last = await slider.inputValue()
  const graph = await page.locator('.array-track').boundingBox()
  const code = await page.locator('.inspector').boundingBox()
  await edit.click()
  await expect(input).toBeFocused()
  expect(await page.locator('.array-track').boundingBox()).toEqual(graph)
  expect(await page.locator('.inspector').boundingBox()).toEqual(code)
  await expect(page.getByRole('group', { name: 'Visualization playback' })).toHaveAttribute(
    'inert',
    '',
  )
  await input.fill('0, 1, 0')
  await expect(page.getByTestId('array-length')).toHaveText('n = 7')
  await expect(slider).toHaveValue(last)
  await input.press('Escape')
  await expect(input).toHaveCount(0)
  await expect(edit).toBeFocused()
  await expect(slider).toHaveValue(last)
  await edit.click()
  await expect(input).toHaveValue('0, 1, 2, 3, 2, 1, 0')
  await input.fill('0, 1, 0')
  await page.getByRole('button', { name: 'Apply inputs' }).click()
  await expect(input).toBeFocused()
  await expect(page.getByRole('button', { name: 'Apply inputs' })).toHaveCount(0)
  await expect(page.getByTestId('array-length')).toHaveText('n = 3')
  await expect(slider).toHaveValue('0')
  await expect(page.getByTestId('live-variables').locator('dt')).toHaveText(['left', 'right'])
  await expect(
    page.getByRole('list', { name: 'Mountain array', exact: true }).getByRole('listitem'),
  ).toHaveCount(3)
  await closeInputs(page)
  await expect(edit).toBeFocused()
  await expect(page.getByTestId('array-length')).toHaveText('n = 3')
})

test('current step follows the thumb, range shrinks, and distinct bounds stay level', async ({
  page,
}) => {
  const slider = page.getByRole('slider', { name: 'Playback position' })
  const total = Number(await slider.getAttribute('max')) + 1
  await expect(page.getByTestId('total-steps')).toHaveText(String(total))
  const originalRange = (await page.locator('.range-band').boundingBox())!.width
  let shrank = false
  for (let index = 0; index < total; index++) {
    await slider.evaluate((element, value) => {
      const input = element as HTMLInputElement
      input.value = String(value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }, index)
    await expect(page.getByTestId('current-step')).toHaveText(String(index + 1))
    await expect(page.getByTestId('array-length')).toHaveText('n = 7')
    await expect
      .poll(async () => {
        const track = (await slider.boundingBox())!
        const marker = (await page.getByTestId('current-step').boundingBox())!
        return Math.abs(
          marker.x +
            marker.width / 2 -
            (track.x + 5.5 + ((track.width - 11) * index) / (total - 1)),
        )
      })
      .toBeLessThan(1)
    const pointers = page.locator('.array-track .array-pointer')
    const bounds = await pointers.evaluateAll((elements) =>
      elements.map((element) => ({
        name: element.getAttribute('data-pointer'),
        index: element.getAttribute('data-index'),
        y: element.querySelector('.pointer-label')!.getBoundingClientRect().y,
      })),
    )
    const l = bounds.find((bound) => bound.name === 'left')!
    const r = bounds.find((bound) => bound.name === 'right')!
    if (l.index !== r.index) expect(Math.abs(l.y - r.y)).toBeLessThan(1)
    const mid = bounds.find((bound) => bound.name === 'mid')
    if (mid?.index === l.index) expect(mid.y).toBeLessThan(l.y)
    if (await page.locator('.range-band').count()) {
      const width = (await page.locator('.range-band').boundingBox())!.width
      if (width < originalRange) shrank = true
    }
  }
  expect(shrank).toBe(true)
  await expect(page.locator('.range-band')).toHaveCount(0)
  await expect(page.getByTestId('search-result')).toHaveText('return 3')
})

test('active assignments show their evaluated values beside the matching statement', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1060 })
  await page.evaluate(() => document.fonts.ready)
  const next = page.getByRole('button', { name: 'Next step', exact: true })
  const badge = page.locator('.statement-result')
  const sequence = [
    ['bounds', '0, 6'],
    ['answer', '−1'],
    ['loop', 'true'],
    ['midpoint', '3'],
    ['condition', 'true'],
    ['save', '3'],
    ['right', '2'],
    ['loop', 'true'],
    ['midpoint', '1'],
    ['condition', 'false'],
    ['left', '2'],
    ['loop', 'true'],
    ['midpoint', '2'],
    ['condition', 'false'],
    ['left', '3'],
    ['loop', 'false'],
    ['return', null],
  ] as const
  async function checkSpacing() {
    const code = (await page.locator('.code-line.active code').boundingBox())!
    const result = (await badge.boundingBox())!
    const row = (await page.locator('.code-line.active').boundingBox())!
    expect(result.x - code.x - code.width).toBeGreaterThanOrEqual(4)
    expect(result.x + result.width).toBeLessThanOrEqual(row.x + row.width)
  }
  for (let index = 0; index < sequence.length; index++) {
    if (index) await next.click()
    const [instruction, value] = sequence[index]!
    await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', instruction)
    await expect(page.locator('.code-line:not(.active) .statement-result')).toHaveCount(0)
    if (value === null) {
      await expect(badge).toHaveCount(0)
    } else {
      await expect(badge).toHaveText(value)
      await expect(badge).toHaveAttribute(
        'data-testid',
        ['loop', 'condition'].includes(instruction) ? 'condition-result' : 'assignment-result',
      )
      await checkSpacing()
    }
  }
  await page.getByRole('button', { name: 'Previous step', exact: true }).click()
  await expect(badge).toHaveText('false')
  await page.getByRole('button', { name: 'Reset visualization' }).click()
  await expect(badge).toHaveText('0, 6')
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await page.getByRole('combobox', { name: 'Input preset' }).selectOption('3')
  await closeInputs(page)
  await expect(badge).toHaveText('0, 2')
  for (let index = 0; index < 8; index++) await next.click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'midpoint')
  await expect(badge).toHaveText('0')
  await checkSpacing()
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Mountain array', exact: true })
    .fill('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,0')
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  await expect(badge).toHaveText('0, 15')
  await closeInputs(page)
  for (let index = 0; index < 7; index++) await next.click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'midpoint')
  await expect(badge).toHaveText('11')
  await checkSpacing()
  await page.screenshot({
    path: '.artifacts/mountain-assignment-result.png',
    animations: 'disabled',
    fullPage: true,
  })
})
