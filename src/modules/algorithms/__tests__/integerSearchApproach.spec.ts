import { expect, test } from '@playwright/test'
import { liveVariable } from './lessonHelpers'

const questions = [
  {
    path: 'first-occurrence',
    pointer: 'first match',
    exact: true,
    values: [1, 3, 3, 3, 3, 6, 10, 10, 10, 100],
    target: 3,
  },
  {
    path: 'first-not-smaller',
    pointer: 'first ≥ target',
    exact: false,
    values: [1, 3, 3, 5, 8, 8, 10],
    target: 2,
  },
]

for (const question of questions) {
  test(`${question.path}: approach decisions respect exact matches and examples carry into solution`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/${question.path}`)
    const approach = page.getByRole('tabpanel', { name: 'Approach', exact: true })
    const cells = approach.locator('.approach-cell')
    const activeDecision = approach.locator('.decision-case[aria-current="true"]')
    const saved = approach.locator('.saved-value')
    const answer = approach.locator(`[data-pointer="${question.pointer}"]`)
    await expect(page.getByRole('tab')).toHaveText(['Approach', 'Solution'])
    await expect(approach.getByRole('heading')).toHaveText(['Split', 'Search', 'Return'])
    await expect(approach.getByRole('link', { name: 'Binary search' })).toHaveAttribute(
      'href',
      '/patterns/binary-search',
    )
    await expect(approach.locator('.rule-condition')).toHaveText(['< target', '≥ target'])
    await expect(approach.locator('.rule-action')).toHaveText([
      'Search right',
      `${question.exact ? 'Save if equal' : 'Save mid'} · Search left`,
    ])
    await expect(cells).toHaveText(question.values.map(String))
    await expect(answer).toHaveAttribute('data-index', '1')
    await expect(activeDecision).toHaveCount(0)
    await cells.first().click()
    await expect(activeDecision.locator('.rule-condition')).toHaveText('< target')
    await expect(approach.locator('.range-caption')).toHaveText('Search right')
    await expect(saved).toHaveCount(0)
    await cells.last().click()
    await expect(activeDecision.locator('.rule-condition')).toHaveText('≥ target')
    await expect(approach.locator('.range-caption')).toHaveText('Search left')
    if (question.exact) await expect(saved).toHaveCount(0)
    else await expect(saved).toHaveText(String(question.values.length - 1))
    await cells.nth(1).click()
    await expect(saved).toHaveText('1')

    const preset = page.getByRole('combobox', { name: 'Approach input' })
    await preset.selectOption('1')
    await expect(cells).toHaveText(['2', '3', '5', '7', '11', '13', '17', '19'])
    await expect(page.getByTestId('approach-target')).toHaveText('target = 6')
    await expect(activeDecision).toHaveCount(0)
    if (question.exact) await expect(answer).toHaveCount(0)
    else await expect(answer).toHaveAttribute('data-index', '3')
    await cells.nth(3).click()
    if (question.exact) await expect(saved).toHaveCount(0)
    else await expect(saved).toHaveText('3')
    await preset.selectOption('custom')
    await expect(cells).toHaveText(question.values.map(String))
    await expect(page.getByTestId('approach-target')).toHaveText(`target = ${question.target}`)
    await preset.selectOption('1')
    await cells.nth(3).click()
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `.artifacts/${question.path}-approach.png`, fullPage: true })

    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await expect(page.locator('.array-item .cell-value')).toHaveText([
      '2',
      '3',
      '5',
      '7',
      '11',
      '13',
      '17',
      '19',
    ])
    await expect(page.getByTestId('target-value')).toHaveText('target = 6')
    const solution = page.getByRole('tabpanel', { name: 'Solution', exact: true })
    await expect(solution.locator('.region-condition.before')).toHaveText('< target')
    await expect(solution.locator('.region-condition.after')).toHaveText('≥ target')
    await page.getByRole('slider', { name: 'Playback position' }).press('End')
    await expect(page.getByTestId('search-result')).toHaveText(`return ${question.exact ? -1 : 3}`)
    expect(errors).toEqual([])
  })

  test(`${question.path}: validated custom edits persist between tabs and can be restored after examples`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/${question.path}`)
    const approach = page.getByRole('tabpanel', { name: 'Approach', exact: true })
    const cells = approach.locator('.approach-cell')
    const edit = page.getByRole('button', { name: 'Edit inputs', exact: true })
    const apply = page.getByRole('button', { name: 'Apply inputs', exact: true })
    const array = page.getByRole('textbox', { name: 'Sorted array', exact: true })
    const target = page.getByRole('textbox', { name: 'Target', exact: true })
    await page.evaluate(() => document.fonts.ready)
    const bounds = await approach.locator('.approach-array').boundingBox()
    await edit.click()
    await expect(array).toBeFocused()
    expect(await approach.locator('.approach-array').boundingBox()).toEqual(bounds)
    await array.fill('3, 1')
    await target.fill('0')
    await expect(cells).toHaveText(question.values.map(String))
    await expect(page.getByTestId('approach-target')).toHaveText(`target = ${question.target}`)
    await apply.click()
    await expect(page.getByRole('alert')).toContainText('sorted')
    await expect(cells).toHaveText(question.values.map(String))
    await array.fill('[-4, 0, 0, 5]')
    await target.fill('oops')
    await apply.click()
    await expect(page.getByRole('alert')).toContainText('whole-number target')
    await expect(cells).toHaveText(question.values.map(String))
    await target.fill('0')
    await target.press('Enter')
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(cells).toHaveText(['-4', '0', '0', '5'])
    await expect(page.getByTestId('approach-target')).toHaveText('target = 0')
    await expect(apply).toHaveCount(0)
    await page.screenshot({
      path: `.artifacts/${question.path}-approach-editor.png`,
      fullPage: true,
    })
    await array.press('Escape')
    await edit.click()
    await array.fill('uncommitted')
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await expect(page.getByRole('form', { name: 'Search inputs' })).toHaveCount(0)
    await expect(page.locator('.array-item .cell-value')).toHaveText(['-4', '0', '0', '5'])
    await expect(page.getByTestId('target-value')).toHaveText('target = 0')
    await page.keyboard.press('ArrowRight')
    await expect(liveVariable(page, 'answer')).toHaveText('−1')
    await page.keyboard.press('Shift+ArrowLeft')
    await expect(approach).toBeVisible()
    await expect(page.locator('.lesson-walkthrough :focus-visible')).toHaveCount(0)
    await page.keyboard.press('Shift+ArrowRight')
    const slider = page.getByRole('slider', { name: 'Playback position' })
    await expect(slider).toHaveValue('1')
    await slider.press('End')
    await expect(page.getByTestId('search-result')).toHaveText('return 1')
    await page.getByRole('tab', { name: 'Approach', exact: true }).click()
    const preset = page.getByRole('combobox', { name: 'Approach input' })
    await preset.selectOption('1')
    await preset.selectOption('custom')
    await expect(cells).toHaveText(['-4', '0', '0', '5'])
    await expect(page.getByTestId('approach-target')).toHaveText('target = 0')
    await edit.click()
    await expect(array).toHaveValue('-4, 0, 0, 5')
    await array.fill('[]')
    await apply.click()
    if (question.exact) {
      await expect(approach.getByLabel('Empty array', { exact: true })).toBeVisible()
      await page.getByRole('tab', { name: 'Solution', exact: true }).click()
      await expect(page.locator('.visualization .region-divider')).toHaveCount(0)
      await slider.press('End')
      await expect(page.getByTestId('search-result')).toHaveText('return -1')
    } else {
      await expect(page.getByRole('alert')).toContainText(
        'at least one value greater than or equal',
      )
      await expect(cells).toHaveText(['-4', '0', '0', '5'])
      await array.press('Escape')
    }
  })
}
