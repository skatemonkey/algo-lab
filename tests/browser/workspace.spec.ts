import { expect, test } from '@playwright/test'
import { liveVariable } from '../../src/modules/algorithms/__tests__/lessonHelpers'

test('Algo Lab opens its catalog and lessons as an independent application', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await expect(page).toHaveTitle('Algorithms · Algo Lab')
  await expect(page.getByRole('heading', { name: 'Algo Lab', exact: true })).toBeVisible()
  await expect(
    page.getByRole('list', { name: 'Algorithm questions' }).getByRole('listitem'),
  ).toHaveCount(9)
  await expect(
    page.getByRole('list', { name: 'Algorithm patterns' }).getByRole('listitem'),
  ).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Back to workspace' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Open Trading' })).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({
    path: '.artifacts/algo-lab-home.png',
    fullPage: true,
    animations: 'disabled',
  })
  const question = page.getByRole('link', { name: 'Open Find the first true', exact: true })
  await question.focus()
  await question.press('Enter')
  await expect(page).toHaveURL('/binary-search')
  await expect(
    page.getByRole('heading', { name: 'Find the first true', exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(liveVariable(page, 'answer')).toHaveText('−1')
  await page.getByRole('link', { name: 'Back to questions' }).click()
  await expect(page.getByRole('heading', { name: 'Questions', exact: true })).toBeVisible()
  await page.goto('/quant')
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Algo Lab', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('question routes support direct loading, refresh, history, and fresh playback after leaving', async ({
  page,
}) => {
  await page.goto('/')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Algo Lab', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Open Find the first true', exact: true }).click()
  await expect(page).toHaveTitle('Find the first true · Algo Lab')
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Find the first true', exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.clock.install()
  await page.getByRole('button', { name: 'Play visualization' }).click()
  await page.clock.runFor(2600)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('2')
  await page.getByRole('link', { name: 'Back to questions' }).click()
  await page.clock.runFor(10000)
  await expect(page.getByRole('heading', { name: 'Algo Lab', exact: true })).toBeVisible()
  await page.goBack()
  await expect(
    page.getByRole('heading', { name: 'Find the first true', exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeVisible()
  await page.clock.runFor(5000)
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
  await page.goForward()
  await expect(page.getByRole('heading', { name: 'Algo Lab', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Open Find the first true', exact: true }).click()
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
})

test('patterns have their own page and connect back to all related questions', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Questions', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Patterns', exact: true })).toBeVisible()
  const patternLink = page.getByRole('link', { name: 'Open Binary search pattern', exact: true })
  await expect(patternLink).toHaveAttribute('href', '/patterns/binary-search')
  await expect(
    page.getByRole('link', { name: 'Open Find the first true', exact: true }),
  ).toHaveAttribute('href', '/binary-search')
  await patternLink.focus()
  await patternLink.press('Enter')
  await expect(page).toHaveURL('/patterns/binary-search')
  await expect(page).toHaveTitle('Binary search · Algo Lab')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Binary search', exact: true })).toBeVisible()
  const code = page.getByRole('list', { name: 'Algorithm pseudocode' })
  await expect(code).toContainText('check A[mid]')
  await expect(page.getByRole('heading', { name: 'General steps', exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Find a boundary', exact: true })).toHaveCount(0)
  await expect(page.locator('.boundary-example')).toHaveCount(0)
  await expect(code.getByRole('listitem')).toHaveCount(12)
  await expect(page.locator('.approach, .step-detail, .repeat-marker')).toHaveCount(0)
  await expect(
    page.getByRole('navigation', { name: 'Related questions' }).getByRole('link'),
  ).toHaveCount(6)
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page
      .locator('.code-list li')
      .evaluateAll((lines) => lines.every((line) => line.scrollWidth <= line.clientWidth)),
  ).toBe(true)
  await page.screenshot({
    path: '.artifacts/binary-search-pattern.png',
    fullPage: true,
    animations: 'disabled',
  })

  for (const [title, path] of [
    ['Find the first true', '/binary-search'],
    ['Find the first occurrence', '/first-occurrence'],
    ['Find the first element ≥ target', '/first-not-smaller'],
  ]) {
    await page.getByRole('link', { name: `Open ${title}`, exact: true }).click()
    await expect(page).toHaveURL(path!)
    await expect(page.getByRole('heading', { name: title!, exact: true })).toBeVisible()
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(liveVariable(page, 'answer')).toHaveText('−1')
    await page.goBack()
    await expect(page.getByRole('heading', { name: 'Binary search', exact: true })).toBeVisible()
  }
  await page.getByRole('link', { name: 'Back to algorithms', exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('region', { name: 'Patterns', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})
