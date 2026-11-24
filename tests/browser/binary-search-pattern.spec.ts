import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/patterns/binary-search')
})

test('array pointers and full pseudocode stay synchronized in both directions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const position = page.getByRole('slider', { name: 'Playback position' })
  await expect(page.getByRole('list', { name: 'Search array' }).getByRole('listitem')).toHaveCount(
    12,
  )
  await expect(page.getByTestId('variable-left')).toHaveText('0')
  await expect(page.getByTestId('variable-right')).toHaveText('11')
  await expect(page.getByTestId('variable-mid')).toHaveText('—')
  await expect(page.getByTestId('variable-answer')).toHaveCount(0)
  await expect(page.locator('.step-count')).toHaveText('Step 1')
  await expect(page.getByRole('button', { name: 'Keep left', exact: true })).toBeDisabled()
  await position.press('End')
  await expect(page.getByTestId('variable-mid')).toHaveText('5')
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'check')
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Keep left', exact: true }).click()
  await expect(page.getByTestId('variable-right')).toHaveText('11')
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.getByTestId('variable-right')).toHaveText('4')
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'right')
  await expect(page.locator('.array-item:not(.excluded)')).toHaveCount(5)
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(page.getByTestId('variable-right')).toHaveText('11')

  await position.press('End')
  await expect(page.getByTestId('variable-mid')).toHaveText('2')
  await page.getByRole('button', { name: 'Keep right', exact: true }).click()
  await position.press('End')
  await expect(page.getByTestId('variable-left')).toHaveText('3')
  await expect(page.getByTestId('variable-right')).toHaveText('4')
  await expect(page.getByTestId('variable-mid')).toHaveText('3')
  await page.evaluate(() => document.fonts.ready)
  const bounds = await page.locator('[data-pointer="right"] .pointer-label').boundingBox()
  const left = await page.locator('[data-pointer="left"] .pointer-label').boundingBox()
  expect(Math.abs(bounds!.y - left!.y)).toBeLessThan(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const workspace = await page.locator('.pattern-workspace').boundingBox()
  expect(workspace!.y + workspace!.height).toBeLessThan(900)
  await page.screenshot({
    path: '.artifacts/binary-search-pattern-array.png',
    fullPage: true,
    animations: 'disabled',
  })

  await page.getByRole('button', { name: 'Keep right', exact: true }).click()
  await position.press('End')
  await expect(page.getByTestId('variable-left')).toHaveText('4')
  await expect(page.getByTestId('variable-right')).toHaveText('4')
  await page.getByRole('button', { name: 'Keep left', exact: true }).click()
  await position.press('End')
  await expect(page.getByText('Range empty', { exact: true })).toBeVisible()
  await expect(page.getByTestId('variable-left')).toHaveText('4')
  await expect(page.getByTestId('variable-right')).toHaveText('3')
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'return')
  await expect(
    page.getByRole('list', { name: 'Algorithm pseudocode' }).getByRole('listitem'),
  ).toHaveCount(12)
  await expect(page.getByTestId('search-result')).toHaveCount(0)
})

test('rewinding can replace a decision, and reset clears the chosen path', async ({ page }) => {
  const position = page.getByRole('slider', { name: 'Playback position' })
  await position.press('End')
  await page.getByRole('button', { name: 'Keep left', exact: true }).click()
  await position.press('End')
  await expect(page.getByTestId('variable-mid')).toHaveText('2')
  await position.press('Home')
  for (let index = 0; index < 3; index++) await position.press('ArrowRight')
  await page.getByRole('button', { name: 'Keep right', exact: true }).click()
  await position.press('End')
  await expect(page.getByTestId('variable-left')).toHaveText('6')
  await expect(page.getByTestId('variable-mid')).toHaveText('8')
  await page.getByRole('button', { name: 'Stop', exact: true }).click()
  await position.press('End')
  await expect(page.getByText('Search stopped', { exact: true })).toBeVisible()
  await expect(page.getByTestId('variable-left')).toHaveText('6')
  await expect(page.getByTestId('variable-right')).toHaveText('11')
  await page.getByRole('button', { name: 'Reset visualization' }).click()
  await expect(position).toHaveValue('0')
  await expect(position).toHaveAttribute('max', '3')
  await expect(page.getByTestId('variable-mid')).toHaveText('—')
  await expect(page.getByTestId('variable-left')).toHaveText('0')
})

test('playback waits for a direction and leaves no running timer after navigation', async ({
  page,
}) => {
  await page.clock.install()
  const position = page.getByRole('slider', { name: 'Playback position' })
  await page.getByRole('button', { name: 'Play visualization', exact: true }).click()
  await page.clock.runFor(3900)
  await expect(position).toHaveValue('3')
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeDisabled()
  await page.clock.runFor(10000)
  await expect(position).toHaveValue('3')
  await page.getByRole('button', { name: 'Keep right', exact: true }).click()
  await page.getByRole('button', { name: 'Play visualization', exact: true }).click()
  await page.clock.runFor(6500)
  await expect(page.getByTestId('variable-mid')).toHaveText('8')
  await expect(page.getByRole('button', { name: 'Play visualization', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Reset visualization' }).click()
  await page.getByRole('button', { name: 'Play visualization', exact: true }).click()
  await page.getByRole('link', { name: 'Back to algorithms' }).click()
  await page.clock.runFor(10000)
  await page.getByRole('link', { name: 'Open Binary search pattern', exact: true }).click()
  await expect(position).toHaveValue('0')
  await page.clock.runFor(6500)
  await expect(position).toHaveValue('0')
})
