import { expect, test, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import {
  applyPreset,
  closeInputs,
  liveVariable,
} from '../../src/modules/algorithms/__tests__/lessonHelpers'

const questions = [
  {
    path: 'first-occurrence',
    title: 'Find the first occurrence',
    answers: [1, -1],
    target: 3,
    lines: 12,
  },
  {
    path: 'first-not-smaller',
    title: 'Find the first element ≥ target',
    answers: [1, 3],
    target: 2,
    lines: 10,
  },
]

async function seekInstruction(page: Page, instruction: string) {
  for (let count = 0; count < 60; count++) {
    if ((await page.locator('.code-line.active').getAttribute('data-instruction')) === instruction)
      return
    await page.getByRole('button', { name: 'Next step' }).click()
  }
  throw new Error(`Instruction not reached: ${instruction}`)
}

for (const question of questions) {
  test(`${question.title}: catalog, both examples, playback, and desktop layout`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.goto('/')
    await page.getByRole('link', { name: `Open ${question.title}`, exact: true }).click()
    await expect(page).toHaveURL(`/${question.path}`)
    await expect(page).toHaveTitle(`${question.title} · Algo Lab`)
    await page.reload()
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await expect(page.getByRole('heading', { name: question.title, exact: true })).toBeVisible()
    await expect(page.getByTestId('example-output')).toHaveText(question.answers.map(String))
    await expect(
      page.getByRole('list', { name: 'Algorithm pseudocode' }).getByRole('listitem'),
    ).toHaveCount(question.lines)
    await expect(page.getByRole('list', { name: 'Solution steps' })).toHaveCount(0)
    await expect(page.getByTestId('target-value')).toHaveText(`target = ${question.target}`)
    await expect(page.getByRole('link', { name: 'AlgoMonster' })).toHaveAttribute(
      'href',
      /algo.monster\/problems\//,
    )
    await closeInputs(page)
    await page.getByRole('slider', { name: 'Playback position' }).press('End')
    await expect(page.getByTestId('search-result')).toHaveText(`return ${question.answers[0]}`)
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const layout = await page.locator('.code-list').evaluate((code) => ({
      allFit: [...code.querySelectorAll('.code-line')].every(
        (line) => line.scrollWidth <= line.clientWidth,
      ),
      uniform:
        new Set([...code.children].map((line) => line.getBoundingClientRect().height)).size === 1,
    }))
    expect(layout).toEqual({ allFit: true, uniform: true })
    await mkdir('.artifacts', { recursive: true })
    await page.screenshot({
      path: `.artifacts/${question.path}.png`,
      fullPage: true,
      animations: 'disabled',
    })

    await applyPreset(page, 1)
    await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
    await expect(page.getByTestId('target-value')).toHaveText('target = 6')
    await closeInputs(page)
    await page.getByRole('slider', { name: 'Playback position' }).press('End')
    await expect(page.getByTestId('search-result')).toHaveText(`return ${question.answers[1]}`)
    await page.getByRole('link', { name: 'Back to questions' }).click()
    await expect(page).toHaveURL('/')
    expect(errors).toEqual([])
  })
}

test('an exact match is saved before the bound moves and the search continues to the first duplicate', async ({
  page,
}) => {
  await page.goto('/first-occurrence')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await seekInstruction(page, 'save')
  await expect(liveVariable(page, 'answer')).toHaveText('4')
  await expect(liveVariable(page, 'right')).toHaveText('9')
  await expect(page.getByTestId('assignment-result')).toHaveAttribute('aria-label', 'answer = 4')
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'right-match')
  await expect(liveVariable(page, 'right')).toHaveText('3')
  await expect(page.locator('[data-pointer="right"]')).toHaveClass(/updated/)
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(liveVariable(page, 'right')).toHaveText('9')
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 1')
})

test('a larger value is skipped for exact search but saved for the lower boundary', async ({
  page,
}) => {
  await page.goto('/first-occurrence')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await applyPreset(page, 1)
  const activeDecision = page.locator('.solution-decisions .decision-case[aria-current="true"]')
  await seekInstruction(page, 'condition')
  await expect(activeDecision).toHaveCount(0)
  await seekInstruction(page, 'smaller')
  await expect(activeDecision.locator('.rule-condition')).toHaveText('≥ target')
  await expect(page.getByTestId('condition-result')).toHaveText('false')
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(liveVariable(page, 'answer')).toHaveText('−1')
  await expect(liveVariable(page, 'right')).toHaveText('2')
  await expect(activeDecision.locator('.rule-condition')).toHaveText('≥ target')
  await page.goto('/first-not-smaller')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await applyPreset(page, 1)
  await seekInstruction(page, 'save')
  await expect(liveVariable(page, 'answer')).toHaveText('3')
  await expect(activeDecision.locator('.rule-condition')).toHaveText('≥ target')
  await expect(liveVariable(page, 'right')).toHaveText('7')
  await expect(page.locator('.array-item.candidate .cell-value')).toHaveText('7')
})

test('custom inputs validate, preserve the current run on errors, and respect the guaranteed answer', async ({
  page,
}) => {
  await page.goto('/first-occurrence')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  const array = page.getByRole('textbox', { name: 'Sorted array', exact: true })
  const target = page.getByRole('textbox', { name: 'Target', exact: true })
  for (const invalid of ['3, 1', '1,,3', '1.5, 3', Array(17).fill('3').join(', ')]) {
    await array.fill(invalid)
    await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(
      page.getByRole('list', { name: 'Integer array' }).getByRole('listitem'),
    ).toHaveCount(10)
  }
  await array.fill('[-5, -1, -1, 2]')
  await target.fill('-1')
  await target.press('Enter')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByTestId('target-value')).toHaveText('target = -1')
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 1')
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await array.fill('[]')
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  await expect(page.getByText('Empty array', { exact: true })).toBeVisible()
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return -1')

  await page.goto('/first-not-smaller')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await array.fill('1, 3, 3')
  await target.fill('4')
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('at least one value greater than or equal')
  await expect(page.getByTestId('target-value')).toHaveText('target = 2')
  await target.fill('3')
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await closeInputs(page)
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
  await expect(page.getByTestId('search-result')).toHaveText('return 1')
})

test('playback pauses explicitly and for input changes, and resets between numeric lessons', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/first-occurrence')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Play visualization' }).click()
  await page.clock.runFor(3900)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('3')
  await page.getByRole('button', { name: 'Pause visualization' }).click()
  await page.clock.runFor(2600)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('3')
  await page.getByRole('button', { name: 'Play visualization' }).click()
  await page.getByRole('button', { name: 'Edit inputs' }).click()
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: 'Target', exact: true }).fill('10')
  await page.getByRole('button', { name: 'Apply inputs', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await closeInputs(page)
  await page.getByRole('button', { name: 'Play visualization' }).click()
  await page.getByRole('link', { name: 'Back to questions' }).click()
  await page.getByRole('link', { name: 'Open Find the first element ≥ target' }).click()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.clock.runFor(5200)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await expect(page.getByTestId('target-value')).toHaveText('target = 2')
})
