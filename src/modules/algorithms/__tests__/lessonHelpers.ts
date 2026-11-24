import { expect, type Page } from '@playwright/test'

export function liveVariable(page: Page, name: string) {
  return page
    .locator('[data-testid="live-variables"]:visible')
    .locator(`[data-variable="${name}"] dd`)
}

export async function closeInputs(page: Page) {
  const close = page.getByRole('button', { name: 'Close input editor', exact: true })
  if (await close.isVisible()) await close.click()
  await expect(page.getByRole('form', { name: 'Search inputs' })).toHaveCount(0)
}

export async function applyPreset(page: Page, preset: number | string) {
  const edit = page.getByRole('button', { name: 'Edit inputs', exact: true })
  if ((await edit.getAttribute('aria-expanded')) !== 'true') await edit.click()
  await page
    .getByRole('combobox', { name: 'Input preset' })
    .selectOption(typeof preset === 'number' ? String(preset) : { label: preset })
  await expect(page.getByRole('button', { name: 'Apply inputs', exact: true })).toHaveCount(0)
  await closeInputs(page)
}
