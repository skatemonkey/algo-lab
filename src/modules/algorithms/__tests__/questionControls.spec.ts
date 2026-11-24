import { expect, test } from '@playwright/test'
import { closeInputs, liveVariable } from './lessonHelpers'

const questions = [
  {
    path: 'binary-search',
    input: 'Array length',
    role: 'spinbutton',
    fact: 'array-length',
    before: 'n = 12',
    after: 'n = 12',
    mid: '5',
    preset: '12',
    invalid: '-1',
    custom: '8',
    normalized: '8',
    count: 8,
  },
  {
    path: 'first-occurrence',
    input: 'Sorted array',
    role: 'textbox',
    fact: 'target-value',
    before: 'target = 3',
    after: 'target = 6',
    mid: '4',
    preset: '2, 3, 5, 7, 11, 13, 17, 19',
    invalid: '3,1',
    custom: '[1,2,3]',
    normalized: '1, 2, 3',
    count: 3,
  },
  {
    path: 'first-not-smaller',
    input: 'Sorted array',
    role: 'textbox',
    fact: 'target-value',
    before: 'target = 2',
    after: 'target = 6',
    mid: '3',
    preset: '2, 3, 5, 7, 11, 13, 17, 19',
    invalid: '3,1',
    custom: '[1,4,8]',
    normalized: '1, 4, 8',
    count: 3,
  },
  {
    path: 'rotated-minimum',
    input: 'Rotated array',
    role: 'textbox',
    fact: 'fixed-last',
    before: 'A[−1] = 20',
    after: 'A[−1] = 2',
    mid: '2',
    preset: '3, 5, 7, 11, 13, 17, 19, 2',
    invalid: '1,1',
    custom: '[3,4,1,2]',
    normalized: '3, 4, 1, 2',
    count: 4,
  },
  {
    path: 'square-root',
    input: 'Non-negative integer n',
    role: 'textbox',
    fact: 'root-input',
    before: 'n = 16',
    after: 'n = 8',
    mid: '8',
    preset: '8',
    invalid: '-1',
    custom: '25',
    normalized: '25',
    count: 0,
  },
  {
    path: 'mountain-peak',
    input: 'Mountain array',
    role: 'textbox',
    fact: 'array-length',
    before: 'n = 7',
    after: 'n = 6',
    mid: '3',
    preset: '0, 9, 7, 5, 3, 1',
    invalid: '1,2,3',
    custom: '[0,5,0]',
    normalized: '0, 5, 0',
    count: 3,
  },
] as const

for (const question of questions) {
  test(`${question.path}: presets update immediately; custom values validate before applying`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/${question.path}`)
    if (
      [
        'mountain-peak',
        'binary-search',
        'first-occurrence',
        'first-not-smaller',
        'square-root',
        'rotated-minimum',
      ].includes(question.path)
    ) {
      await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    } else {
      await expect(page.getByRole('tablist')).toHaveCount(0)
      await expect(page.locator('.reasoning-label')).toHaveCount(0)
    }
    await expect(
      page
        .locator('.lesson-workspace:visible')
        .locator(
          '.lesson-reading, .unassigned-pointers, .canvas-caption, .approach, .step-detail, .repeat-marker',
        ),
    ).toHaveCount(0)
    const variables = page.locator('[data-testid="live-variables"]:visible')
    await expect(variables.locator('dt')).toHaveText(['left', 'right'])
    await expect(page.getByTestId(question.fact)).toHaveText(question.before)
    const edit = page.getByRole('button', { name: 'Edit inputs', exact: true })
    const apply = page.getByRole('button', { name: 'Apply inputs', exact: true })
    await expect(edit).toHaveText('')
    if (question.path !== 'binary-search')
      await expect(
        page.locator('.lesson-heading').getByRole('link', { name: 'AlgoMonster' }),
      ).toBeVisible()
    for (let index = 0; index < 3; index++)
      await page.getByRole('button', { name: 'Next step' }).click()
    await expect(liveVariable(page, 'mid')).toHaveText(question.mid)
    await expect(page.getByTestId('assignment-result')).toHaveText(question.mid)
    await page.getByRole('button', { name: 'Previous step' }).click()
    await expect(liveVariable(page, 'mid')).toHaveCount(0)
    await expect(page.getByTestId('condition-result')).toHaveText('true')

    const slider = page.getByRole('slider', { name: 'Playback position' })
    await slider.press('End')
    const position = await slider.inputValue()
    await expect(page.getByTestId('current-step')).toHaveText(String(Number(position) + 1))
    await expect(page.getByTestId('total-steps')).toHaveText(String(Number(position) + 1))
    await page.evaluate(() => document.fonts.ready)
    const graph = page.locator('.array-track, .root-visualization .range-stage')
    const graphBounds = await graph.boundingBox()
    const codeBounds = await page.locator('.inspector').boundingBox()
    await edit.click()
    const input = page.getByRole(question.role, { name: question.input, exact: true })
    await expect(input).toBeFocused()
    expect(await graph.boundingBox()).toEqual(graphBounds)
    expect(await page.locator('.inspector').boundingBox()).toEqual(codeBounds)
    await expect(apply).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Next step' })).toBeDisabled()
    const select = page.getByRole('combobox', { name: 'Input preset' })
    await select.selectOption(question.path === 'square-root' ? { label: 'n = 8' } : '1')
    await expect(page.getByTestId(question.fact)).toHaveText(question.after)
    await expect(input).toHaveValue(question.preset)
    await expect(slider).toHaveValue('0')
    await expect(variables.locator('dt')).toHaveText(['left', 'right'])
    await expect(page.getByTestId('search-result')).toHaveCount(0)
    await expect(edit).toHaveAttribute('aria-expanded', 'true')
    await expect(apply).toHaveCount(0)

    const inputBounds = await input.boundingBox()
    const cells = await page.locator('.array-item .cell-value').allTextContents()
    await input.fill(question.invalid)
    await expect(apply).toBeVisible()
    expect(await input.boundingBox()).toEqual(inputBounds)
    await expect(page.getByRole('alert')).toHaveCount(0)
    expect(await page.locator('.array-item .cell-value').allTextContents()).toEqual(cells)
    await apply.click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByTestId(question.fact)).toHaveText(question.after)
    expect(await page.locator('.array-item .cell-value').allTextContents()).toEqual(cells)
    await expect(input).toBeFocused()
    await input.press('Escape')
    await expect(edit).toBeFocused()
    await edit.click()
    await expect(input).toHaveValue(question.preset)
    await expect(apply).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)

    await input.fill(question.custom)
    await expect(apply).toBeVisible()
    await input.press('Enter')
    await expect(input).toHaveValue(question.normalized)
    await expect(input).toBeFocused()
    await expect(apply).toHaveCount(0)
    await expect(edit).toHaveAttribute('aria-expanded', 'true')
    if (question.path === 'square-root')
      await expect(page.getByTestId('root-input')).toHaveText('n = 25')
    else await expect(page.locator('.array-item')).toHaveCount(question.count)
    await input.fill(question.invalid)
    await closeInputs(page)
    await expect(edit).toBeFocused()
    await edit.click()
    await expect(input).toHaveValue(question.normalized)
    await closeInputs(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(errors).toEqual([])
  })
}

test('first-true slider updates while dragging, independently of an unfinished length', async ({
  page,
}) => {
  await page.goto('/binary-search')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  const preset = page.getByRole('combobox', { name: 'Input preset' })
  const boundary = page.getByRole('slider', { name: /First true/ })
  const values = page.locator('.array-item .cell-value')
  const apply = page.getByRole('button', { name: 'Apply inputs' })
  await preset.selectOption('0')
  await expect(values).toHaveText(['false', 'false', 'true', 'true', 'true'])
  const track = (await boundary.boundingBox())!
  await page.mouse.move(track.x + track.width * 0.4, track.y + track.height / 2)
  await page.mouse.down()
  await page.mouse.move(track.x + track.width * 0.8, track.y + track.height / 2, { steps: 5 })
  await expect(values).toHaveText(['false', 'false', 'false', 'false', 'true'])
  await page.mouse.up()
  await expect(apply).toHaveCount(0)
  await boundary.press('Home')
  await expect(values).toHaveText(Array(5).fill('true'))
  await boundary.press('End')
  await expect(values).toHaveText(Array(5).fill('false'))
  await preset.selectOption('1')
  await expect(values).toHaveText(Array(12).fill('false'))
  await preset.selectOption('2')
  await expect(values).toHaveText(Array(12).fill('true'))
  const length = page.getByRole('spinbutton', { name: 'Array length' })
  await length.fill('16')
  await expect(boundary).toHaveAttribute('max', '12')
  await boundary.press('ArrowRight')
  await expect(values).toHaveText(['false', ...Array(11).fill('true')])
  await expect(length).toHaveValue('16')
  await expect(apply).toBeVisible()
  await length.press('Enter')
  await expect(boundary).toHaveAttribute('max', '16')
  await expect(values).toHaveText(['false', ...Array(15).fill('true')])
  await expect(apply).toHaveCount(0)
  await length.fill('-1')
  await length.press('Enter')
  await expect(page.getByRole('alert')).toBeVisible()
  await preset.selectOption('3')
  await expect(values).toHaveCount(0)
  await expect(boundary).toBeDisabled()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(apply).toHaveCount(0)
})

test('large calculated values remain exact and fit beside pseudocode', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/square-root')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await page.getByRole('textbox', { name: 'Non-negative integer n' }).fill('9007199254740991')
  await page.getByRole('button', { name: 'Apply inputs' }).click()
  await closeInputs(page)
  const next = page.getByRole('button', { name: 'Next step' })
  for (let i = 0; i < 3; i++) await next.click()
  for (const [name, value] of [
    ['mid', '4503599627370495'],
    ['square', '20282409603651661416747996545025'],
  ]) {
    await expect(liveVariable(page, name!)).toHaveText(value!)
    await expect(page.getByTestId('assignment-result')).toHaveText(value!)
    const row = (await page.locator('.code-line.active').boundingBox())!
    const code = (await page.locator('.code-line.active code').boundingBox())!
    const result = (await page.getByTestId('assignment-result').boundingBox())!
    expect(result.x - code.x - code.width).toBeGreaterThanOrEqual(4)
    expect(result.x + result.width).toBeLessThanOrEqual(row.x + row.width)
    expect(code.height).toBeLessThanOrEqual(row.height)
    expect(result.height).toBeLessThanOrEqual(row.height)
    await next.click()
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
