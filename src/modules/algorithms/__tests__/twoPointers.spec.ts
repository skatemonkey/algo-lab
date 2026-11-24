import { expect, test, type Page } from '@playwright/test'
import { applyPreset, closeInputs, liveVariable } from './lessonHelpers'

const questions = [
  {
    path: 'remove-duplicates',
    title: 'Remove duplicates',
    input: 'Sorted array',
    preset: [2, 2, 2, 2],
    custom: [-2, -2, 0, 3],
    invalid: '2,1',
    result: 'return 3',
  },
  {
    path: 'linked-list-middle',
    title: 'Middle of a linked list',
    input: 'Node values',
    preset: [0, 1, 2, 3, 4, 5],
    custom: [9, 5, 9, 2],
    invalid: '[]',
    result: 'return 2',
  },
  {
    path: 'move-zeros',
    title: 'Move zeros',
    input: 'Integer array',
    preset: [0, 0, 0, 0],
    custom: [0, -2, 0, 3],
    invalid: '1,,2',
    result: 'A = [1, 2, 7, 0, 0, 0]',
  },
] as const

function values(page: Page) {
  return page.locator('.lesson-workspace .sequence-item:not(.null-node) .sequence-value')
}
async function finish(page: Page) {
  await page.getByRole('slider', { name: 'Playback position' }).press('End')
}

test('remove duplicates approach shows both rule transformations without playback', async ({
  page,
}) => {
  await page.goto('/remove-duplicates')
  const approach = page.getByRole('region', { name: 'Remove duplicates approach', exact: true })
  await expect(approach).toBeVisible()
  await expect(approach.getByRole('button')).toHaveCount(4)
  await expect(approach.getByRole('combobox')).toHaveCount(0)
  await expect(approach.getByRole('slider')).toHaveCount(0)
  const initials = await approach
    .locator('.role-initial')
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x))
  expect(initials[0]).toEqual(initials[1])

  for (const [label, afterValues, left, right, kept] of [
    ['New value', ['1', '2', '2', '3'], '1', '3', 2],
    ['Duplicate', ['1', '1', '2', '3'], '0', '2', 1],
  ] as const) {
    const example = approach.getByRole('figure', { name: `${label}: before and after` })
    const before = example.locator('.rule-snapshot').first()
    const after = example.locator('.rule-snapshot').last()
    await expect(before.locator('.sequence-value')).toHaveText(['1', '1', '2', '3'])
    await expect(after.locator('.sequence-value')).toHaveText([...afterValues])
    await expect(after.locator('[data-pointer="left"]')).toHaveAttribute('data-index', left)
    await expect(after.locator('[data-pointer="right"]')).toHaveAttribute('data-index', right)
    await expect(after.locator('.sequence-item.kept')).toHaveCount(kept)
  }
  await expect(approach.locator('.action-number')).toHaveText(['1', '2', '3', '1'])
  await expect(approach.locator('.sequence-item.written .sequence-value')).toHaveText(['2'])
  await page.getByRole('tab', { name: 'Approach', exact: true }).focus()
  await page.keyboard.press('Shift+ArrowRight')
  await expect(page.getByRole('tab', { name: 'Solution', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await finish(page)
  await expect(page.getByTestId('search-result')).toHaveText('return 3')
})

test('approach pointer labels stay centered when the card has room', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/remove-duplicates')
  const approach = page.getByRole('region', { name: 'Remove duplicates approach', exact: true })
  await expect(approach).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  for (const width of [1440, 1280]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect
      .poll(() =>
        approach.locator('.array-pointer').evaluateAll((pointers) =>
          pointers.every((pointer) => {
            const label = pointer.querySelector('.pointer-label')!.getBoundingClientRect()
            const stem = pointer.querySelector('.pointer-stem')!.getBoundingClientRect()
            const card = pointer.closest('.pointer-rule')!.getBoundingClientRect()
            const cell = pointer
              .closest('.sequence-track')!
              .querySelectorAll('.sequence-cell')
              [Number((pointer as HTMLElement).dataset.index)]!.getBoundingClientRect()
            const center = cell.left + cell.width / 2
            return (
              Math.abs(label.left + label.width / 2 - center) < 1 &&
              Math.abs(stem.left + stem.width / 2 - center) < 1 &&
              getComputedStyle(pointer).getPropertyValue('--pointer-connector-width') === '0px' &&
              label.left >= card.left &&
              label.right <= card.right
            )
          }),
        ),
      )
      .toBe(true)
  }
})

test('new pointer approaches explain swapping, different speeds, and odd/even endings', async ({
  page,
}) => {
  await page.goto('/move-zeros')
  const swaps = page.getByRole('region', { name: 'Move zeros approach', exact: true })
  const nonzero = swaps.getByRole('figure', { name: 'Nonzero value: before and after' })
  const zero = swaps.getByRole('figure', { name: 'Zero: before and after' })
  await expect(nonzero.locator('.rule-snapshot').first().locator('.sequence-value')).toHaveText([
    '0',
    '0',
    '2',
    '3',
  ])
  const afterSwap = nonzero.locator('.rule-snapshot').last()
  await expect(afterSwap.locator('.sequence-value')).toHaveText(['2', '0', '0', '3'])
  await expect(afterSwap.locator('.sequence-item.written')).toHaveCount(2)
  await expect(afterSwap.locator('[data-pointer="left"]')).toHaveAttribute('data-index', '1')
  await expect(afterSwap.locator('[data-pointer="right"]')).toHaveAttribute('data-index', '3')
  const afterZero = zero.locator('.rule-snapshot').last()
  await expect(afterZero.locator('.sequence-value')).toHaveText(['0', '0', '2', '3'])
  await expect(afterZero.locator('[data-pointer="left"]')).toHaveAttribute('data-index', '0')
  await expect(afterZero.locator('[data-pointer="right"]')).toHaveAttribute('data-index', '2')
  await expect(swaps.getByRole('button')).toHaveCount(4)
  await expect(swaps.locator('.action-number')).toHaveText(['1', '2', '3', '1'])
  await expect(afterSwap.locator('.sequence-cell .rule-action-marker')).toHaveText(['1', '1'])
  await swaps.getByRole('button', { name: 'Swap values', exact: false }).hover()
  await expect(nonzero.locator('.sequence-item.is-highlighted')).toHaveCount(4)
  await expect(afterSwap.locator('.sequence-cell .rule-action-marker.active')).toHaveCount(2)
  await swaps.getByRole('button', { name: 'Advance left', exact: false }).hover()
  await expect(afterSwap.locator('[data-pointer="left"] .rule-action-marker.active')).toHaveText(
    '2',
  )

  await page.goto('/linked-list-middle')
  const linked = page.getByRole('region', { name: 'Middle of a linked list approach', exact: true })
  const movement = linked.getByRole('figure', { name: 'Advance slow and fast: before and after' })
  const before = movement.locator('.rule-snapshot').first()
  const after = movement.locator('.rule-snapshot').last()
  await expect(before.locator('[data-pointer="slow"]')).toHaveAttribute('data-index', '0')
  await expect(before.locator('[data-pointer="fast"]')).toHaveAttribute('data-index', '0')
  await expect(after.locator('[data-pointer="slow"]')).toHaveAttribute('data-index', '1')
  await expect(after.locator('[data-pointer="fast"]')).toHaveAttribute('data-index', '2')
  const endings = linked.getByRole('figure', { name: 'Middle nodes for odd and even lengths' })
  await expect(
    endings.locator('.rule-snapshot').first().locator('[data-pointer="fast"]'),
  ).toHaveAttribute('data-index', '2')
  await expect(
    endings.locator('.rule-snapshot').last().locator('[data-pointer="fast"]'),
  ).toHaveAttribute('data-index', 'null')
  await expect(endings.locator('.sequence-item.result .sequence-value')).toHaveText(['1', '2'])
  await expect(linked.getByRole('button')).toHaveCount(3)
  await expect(after.locator('.rule-action-marker')).toHaveText(['1', '2'])
  await linked.getByRole('button', { name: 'Advance fast 2 nodes' }).hover()
  await expect(before.locator('.next-link.is-traversed')).toHaveCount(2)
  await expect(after.locator('[data-pointer="fast"] .rule-action-marker.active')).toHaveText('2')
  await expect
    .poll(() =>
      before
        .locator('.next-link.is-traversed')
        .first()
        .evaluate((link) => {
          const action = link.closest('.pointer-rule')!.querySelector('.rule-action.is-inspected')!
          return getComputedStyle(link).color === getComputedStyle(action).color
        }),
    )
    .toBe(true)
  await linked.getByRole('button', { name: 'Advance slow 1 node' }).hover()
  await expect(before.locator('.next-link.is-traversed')).toHaveCount(1)
  await expect(after.locator('[data-pointer="slow"] .rule-action-marker.active')).toHaveText('1')
  await linked.getByRole('button', { name: 'Return slow' }).hover()
  await expect(endings.locator('.sequence-item.result.is-highlighted')).toHaveCount(2)
})

for (const question of questions) {
  test(`${question.path}: compact lesson, immediate presets, validated custom input`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await page.getByRole('link', { name: `Open ${question.title}`, exact: true }).click()
    await expect(page).toHaveURL(`/${question.path}`)
    await page.reload()
    await expect(page.getByRole('heading', { name: question.title, exact: true })).toBeVisible()
    await expect(
      page.locator('.lesson-heading').getByRole('link', { name: 'AlgoMonster' }),
    ).toBeVisible()
    await expect(
      page.getByRole('tablist', { name: 'Lesson sections' }).getByRole('tab'),
    ).toHaveText(['Approach', 'Solution'])
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await expect(
      page.locator('.lesson-workspace').locator('.lesson-reading, .step-detail, .repeat-marker'),
    ).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Pseudocode', exact: true })).toBeVisible()
    await finish(page)
    await expect(page.getByTestId('search-result')).toHaveText(question.result)
    await page.evaluate(() => document.fonts.ready)
    const before = await page.locator('.lesson-workspace .sequence-track').boundingBox()
    const edit = page.getByRole('button', { name: 'Edit inputs', exact: true })
    await edit.click()
    const input = page.getByRole('textbox', { name: question.input, exact: true })
    const apply = page.getByRole('button', { name: 'Apply inputs', exact: true })
    await expect(input).toBeFocused()
    expect(await page.locator('.lesson-workspace .sequence-track').boundingBox()).toEqual(before)
    await expect(apply).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Next step' })).toBeDisabled()
    await page.getByRole('combobox', { name: 'Input preset' }).selectOption('1')
    await expect(values(page)).toHaveText(question.preset.map(String))
    await expect(page.locator('.lesson-workspace').getByTestId('array-length')).toHaveText(
      `n = ${question.preset.length}`,
    )
    await expect(page.getByRole('slider', { name: 'Playback position' })).toHaveValue('0')
    await expect(page.getByTestId('search-result')).toHaveCount(0)
    await expect(apply).toHaveCount(0)
    await expect(edit).toHaveAttribute('aria-expanded', 'true')
    await input.fill(question.invalid)
    await expect(values(page)).toHaveText(question.preset.map(String))
    await apply.click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(values(page)).toHaveText(question.preset.map(String))
    await input.press('Escape')
    await expect(edit).toBeFocused()
    await edit.click()
    await expect(input).toHaveValue(question.preset.join(', '))
    await expect(page.getByRole('alert')).toHaveCount(0)
    await input.fill(`[${question.custom.join(',')}]`)
    await input.press('Enter')
    await expect(input).toHaveValue(question.custom.join(', '))
    await expect(values(page)).toHaveText(question.custom.map(String))
    await expect(apply).toHaveCount(0)
    await expect(edit).toHaveAttribute('aria-expanded', 'true')
    await input.fill(question.invalid)
    await closeInputs(page)
    await edit.click()
    await expect(input).toHaveValue(question.custom.join(', '))
    await input.fill(Array.from({ length: 17 }, (_, i) => i).join(','))
    await input.press('Enter')
    await expect(page.getByRole('alert')).toContainText('Use up to')
    await expect(values(page)).toHaveText(question.custom.map(String))
    await closeInputs(page)
    expect(errors).toEqual([])
  })
}

test('a copy updates only its destination and rewinding restores the duplicate', async ({
  page,
}) => {
  await page.goto('/remove-duplicates')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  const rules = page.getByRole('list', { name: 'Pointer rules', exact: true })
  const activeRule = rules.locator('[aria-current="true"]')
  const activeAction = rules.locator('[aria-current="step"]')
  await expect(rules.locator('.action-number')).toHaveText(['1', '2', '3', '1'])
  await expect(activeRule).toHaveCount(0)
  await expect(activeAction).toHaveCount(0)
  const next = page.getByRole('button', { name: 'Next step' })
  await next.click()
  await expect(activeRule).toHaveCount(0)
  await next.click()
  await expect(activeRule).toContainText('A[right] = A[left]')
  await expect(activeAction).toHaveCount(0)
  await next.click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'right')
  await expect(activeRule).toContainText('A[right] = A[left]')
  await expect(activeAction).toHaveText(/1\s*Advance right/)
  await next.click()
  await expect(activeRule).toHaveCount(0)
  await expect(activeAction).toHaveCount(0)
  for (let i = 0; i < 30; i++) {
    if ((await page.locator('.code-line.active').getAttribute('data-instruction')) === 'write')
      break
    await next.click()
  }
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'write')
  await expect(activeRule).toContainText('A[right] ≠ A[left]')
  await expect(activeAction).toHaveText(/2\s*Copy value/)
  await next.click()
  await expect(activeRule).toContainText('A[right] ≠ A[left]')
  await expect(activeAction).toHaveText(/3\s*Advance right/)
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(activeAction).toHaveText(/2\s*Copy value/)
  await expect(values(page)).toHaveText(['0', '1', '1', '1', '1', '2', '2'])
  await expect(liveVariable(page, 'left')).toHaveText('1')
  await expect(liveVariable(page, 'right')).toHaveText('2')
  await expect(page.getByTestId('assignment-result')).toHaveAttribute('aria-label', 'A[1] = 1')
  await expect(page.locator('.lesson-workspace .sequence-item.written')).toHaveCount(1)
  await expect(page.locator('.lesson-workspace .sequence-item.kept')).toHaveCount(2)
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'left')
  await expect(activeRule).toContainText('A[right] ≠ A[left]')
  await expect(activeAction).toHaveText(/1\s*Advance left/)
  await expect(values(page)).toHaveText(['0', '0', '1', '1', '1', '2', '2'])
  await expect(page.locator('.lesson-workspace .sequence-item.kept')).toHaveCount(1)
  await expect(page.getByTestId('assignment-result')).toHaveAttribute('aria-label', 'left = 1')
  await finish(page)
  await expect(activeRule).toHaveCount(0)
  await expect(activeAction).toHaveCount(0)
  await expect(page.locator('.lesson-workspace .sequence-item.kept .sequence-value')).toHaveText([
    '0',
    '1',
    '2',
  ])
  await expect(page.locator('.lesson-workspace .sequence-item.discarded')).toHaveCount(4)
  for (const [preset, length] of [
    [1, 1],
    [2, 4],
    [3, 1],
  ]) {
    await applyPreset(page, preset!)
    await finish(page)
    await expect(page.getByTestId('search-result')).toHaveText(`return ${length}`)
  }
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`copy visibly travels and replays with motion preference: ${reducedMotion}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('/remove-duplicates')
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    const timeline = page.getByRole('slider', { name: 'Playback position' })
    const packet = page.locator('.copy-packet')
    const route = page.locator('.copy-route')
    const replay = page.getByRole('button', { name: 'Replay copy', exact: true })

    // Direct seeking must show the same copy as stepping through the preceding statement.
    await timeline.fill('10')
    await expect(packet).toBeVisible()
    await expect(values(page).nth(1)).toHaveText('0')
    await expect(values(page).nth(2)).toHaveText('1')
    // A mounted packet can still be invisible if the global reset shortens it to 0.01ms.
    expect(
      await packet.evaluate((element) =>
        Number(element.getAnimations()[0]?.effect?.getComputedTiming().duration ?? 0),
      ),
    ).toBeGreaterThan(500)
    const start = (await packet.boundingBox())!
    await expect
      .poll(async () => (await packet.boundingBox())?.x ?? Infinity, { intervals: [50] })
      .toBeLessThan(start.x - 20)
    await expect(packet).toHaveCount(0)
    await expect(values(page)).toHaveText(['0', '1', '1', '1', '1', '2', '2'])
    await expect(route).toBeVisible()

    await replay.click()
    await expect(packet).toBeVisible()
    await expect(values(page).nth(1)).toHaveText('0')
    const replayStart = (await packet.boundingBox())!
    await expect
      .poll(async () => (await packet.boundingBox())?.x ?? Infinity, { intervals: [50] })
      .toBeLessThan(replayStart.x - 20)
    await page.getByRole('button', { name: 'Previous step', exact: true }).click()
    await expect(route).toHaveCount(0)
    await expect(packet).toHaveCount(0)
    await expect(values(page).nth(1)).toHaveText('0')

    // Navigating away cancels the animation; returning replays the selected copy step.
    await timeline.fill('10')
    await expect(packet).toBeVisible()
    await page.getByRole('tab', { name: 'Approach', exact: true }).click()
    await expect(packet).toHaveCount(0)
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await expect(packet).toBeVisible()
    await expect(values(page).nth(1)).toHaveText('1')
  })
}

test('swaps show both changed values, rewind correctly, and handle empty or all-zero arrays', async ({
  page,
}) => {
  await page.goto('/move-zeros')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await page.getByRole('slider', { name: 'Playback position' }).fill('11')
  await expect(page.locator('.lesson-workspace .sequence-item.written')).toHaveCount(2)
  await expect(page.locator('.code-line.active')).toHaveAttribute('data-instruction', 'swap')
  await expect(values(page)).toHaveText(['1', '2', '0', '0', '0', '7'])
  await expect(page.getByTestId('assignment-result')).toHaveAttribute(
    'aria-label',
    'A[1] = 2, A[2] = 0',
  )
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(values(page)).toHaveText(['1', '0', '2', '0', '0', '7'])
  await expect(page.getByTestId('condition-result')).toHaveText('true')
  await page.getByRole('button', { name: 'Reset visualization' }).click()
  await expect(values(page)).toHaveText(['1', '0', '2', '0', '0', '7'])
  for (const [preset, result] of [
    [1, '0, 0, 0, 0'],
    [2, '1, 2, 3, 4'],
    [3, '3, 1, 2, 0, 0'],
    [4, ''],
  ] as const) {
    await applyPreset(page, preset)
    await finish(page)
    await expect(page.getByTestId('search-result')).toHaveText(`A = [${result}]`)
  }
  await expect(page.getByText('Empty array', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-workspace .array-pointer')).toHaveCount(0)
})

test('move zeros shows both swap directions and numbered actions through seeking and replay', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/move-zeros')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  const solution = page.locator('.lesson-workspace')
  const timeline = page.getByRole('slider', { name: 'Playback position' })
  const rules = solution.getByRole('list', { name: 'Pointer rules', exact: true })
  const activeAction = rules.locator('[aria-current="step"]')
  const packets = solution.locator('.swap-packet')
  const nonzero = packets.filter({ hasText: '2' })
  const zero = packets.filter({ hasText: '0' })

  // Swapping a value with itself is still step 1, but has no travel path.
  await timeline.fill('3')
  await expect(activeAction).toHaveText(/1\s*Swap values/)
  await expect(solution.locator('.sequence-cell .rule-action-marker.active')).toHaveText('1')
  await expect(solution.locator('.array-swap-motion')).toHaveCount(0)
  await timeline.fill('8')
  await expect(activeAction).toHaveText(/1\s*Advance right/)
  await expect(rules.locator('[aria-current="true"]')).toContainText('A[right] = 0')

  await timeline.fill('11')
  await expect(activeAction).toHaveText(/1\s*Swap values/)
  await expect(packets).toHaveCount(2)
  await expect(solution.locator('.sequence-value.is-moving')).toHaveText(['0', '2'])
  expect(
    await nonzero.evaluate((element) =>
      Number(element.getAnimations()[0]?.effect?.getComputedTiming().duration ?? 0),
    ),
  ).toBeGreaterThan(500)
  const startNonzero = (await nonzero.boundingBox())!.x
  const startZero = (await zero.boundingBox())!.x
  await expect
    .poll(async () => (await nonzero.boundingBox())?.x ?? Infinity, { intervals: [50] })
    .toBeLessThan(startNonzero - 20)
  await expect
    .poll(async () => (await zero.boundingBox())?.x ?? -Infinity, { intervals: [50] })
    .toBeGreaterThan(startZero + 20)
  await expect(packets).toHaveCount(0)
  await expect(values(page)).toHaveText(['1', '2', '0', '0', '0', '7'])
  await page.getByRole('button', { name: 'Replay swap', exact: true }).click()
  await expect(packets).toHaveCount(2)
  await page.getByRole('button', { name: 'Previous step', exact: true }).click()
  await expect(packets).toHaveCount(0)
  await expect(solution.locator('.swap-route')).toHaveCount(0)
  await expect(values(page)).toHaveText(['1', '0', '2', '0', '0', '7'])

  await timeline.fill('11')
  await page.getByRole('tab', { name: 'Approach', exact: true }).click()
  await expect(packets).toHaveCount(0)
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await expect(packets).toHaveCount(2)
  await page.getByRole('button', { name: 'Edit inputs', exact: true }).click()
  await expect(packets).toHaveCount(0)
  await expect(values(page)).toHaveText(['1', '2', '0', '0', '0', '7'])
  await closeInputs(page)
  await timeline.fill('12')
  await expect(activeAction).toHaveText(/2\s*Advance left/)
  await expect(solution.locator('[data-pointer="left"] .rule-action-marker.active')).toHaveText('2')
  await timeline.fill('13')
  await expect(activeAction).toHaveText(/3\s*Advance right/)
  await expect(solution.locator('[data-pointer="right"] .rule-action-marker.active')).toHaveText(
    '3',
  )
  await timeline.fill('14')
  await expect(rules.locator('[aria-current="true"]')).toHaveCount(0)
})

test('slow and fast follow links; even lists end at null and select the second middle', async ({
  page,
}) => {
  await page.goto('/linked-list-middle')
  await page.getByRole('tab', { name: 'Solution', exact: true }).click()
  await applyPreset(page, 1)
  const solution = page.locator('.lesson-workspace')
  const rules = solution.getByRole('list', { name: 'Pointer rules', exact: true })
  const activeAction = rules.locator('[aria-current="step"]')
  const links = solution.locator('.next-link.is-traversed')
  await expect(rules.locator('[aria-current="true"]')).toHaveCount(0)
  const next = page.getByRole('button', { name: 'Next step' })
  await next.click()
  await expect(page.getByTestId('condition-result')).toHaveText('true')
  await expect(rules.locator('[aria-current="true"]')).toContainText(
    'fast ≠ null and fast.next ≠ null',
  )
  await expect(activeAction).toHaveCount(0)
  await next.click()
  await expect(liveVariable(page, 'slow')).toHaveText('node 1')
  await expect(liveVariable(page, 'fast')).toHaveText('node 0')
  await expect(activeAction).toHaveText(/1\s*Advance slow 1 node/)
  await expect(links).toHaveCount(1)
  await expect(links).toHaveAttribute('data-link-from', '0')
  await expect(solution.locator('[data-pointer="slow"] .rule-action-marker.active')).toHaveText('1')
  await next.click()
  await expect(liveVariable(page, 'fast')).toHaveText('node 2')
  await expect(page.getByTestId('assignment-result')).toHaveAttribute('aria-label', 'fast = node 2')
  await expect(activeAction).toHaveText(/2\s*Advance fast 2 nodes/)
  await expect(links).toHaveCount(2)
  await expect(solution.locator('[data-pointer="fast"] .rule-action-marker.active')).toHaveText('2')
  // Seeking and rewinding use the selected instruction's origin, not the last viewed position.
  await page.getByRole('slider', { name: 'Playback position' }).fill('9')
  await expect(liveVariable(page, 'fast')).toHaveText('null')
  await expect(links).toHaveCount(2)
  await expect(links.first()).toHaveAttribute('data-link-from', '4')
  await expect(links.last()).toHaveAttribute('data-link-from', '5')
  await page.getByRole('button', { name: 'Previous step' }).click()
  await expect(activeAction).toHaveText(/1\s*Advance slow 1 node/)
  await expect(links).toHaveCount(1)
  await expect(links).toHaveAttribute('data-link-from', '2')
  await finish(page)
  await expect(activeAction).toHaveText(/1\s*Return slow/)
  await expect(links).toHaveCount(0)
  await expect(page.getByTestId('search-result')).toHaveText('return 3')
  await expect(liveVariable(page, 'fast')).toHaveText('null')
  await expect(page.locator('.lesson-workspace .sequence-item.result')).toHaveAttribute(
    'aria-label',
    'Node 3: 3, middle node',
  )
  const nullNode = (await page
    .locator('.lesson-workspace .null-node .sequence-cell')
    .boundingBox())!
  await expect
    .poll(async () => {
      const stem = (await page
        .locator('.lesson-workspace [data-pointer="fast"] .pointer-stem')
        .boundingBox())!
      return Math.abs(stem.x + stem.width / 2 - nullNode.x - nullNode.width / 2)
    })
    .toBeLessThan(1)
  for (const [preset, index, value] of [
    [2, 0, 7],
    [3, 1, 20],
    [4, 2, 5],
  ]) {
    await applyPreset(page, preset!)
    await finish(page)
    await expect(page.locator('.lesson-workspace .sequence-item.result')).toHaveAttribute(
      'aria-label',
      `Node ${index}: ${value}, middle node`,
    )
    await expect(page.getByTestId('search-result')).toHaveText(`return ${value}`)
  }
})

test('desktop layout keeps pointer captions, assignments, and the null node readable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const path of ['remove-duplicates', 'move-zeros', 'linked-list-middle']) {
    await page.goto(`/${path}`)
    await page.getByRole('tab', { name: 'Solution', exact: true }).click()
    await page.getByRole('button', { name: 'Edit inputs' }).click()
    const length = path === 'linked-list-middle' ? 10 : 16
    await page.getByRole('textbox').fill(Array.from({ length }, (_, index) => index).join(','))
    await page.getByRole('button', { name: 'Apply inputs' }).click()
    await closeInputs(page)
    await page.evaluate(() => document.fonts.ready)
    for (const command of ['Home', 'ArrowRight', 'End']) {
      await page.getByRole('slider', { name: 'Playback position' }).press(command)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const visualization = (await page
        .locator('.lesson-workspace .pointer-visualization')
        .boundingBox())!
      for (const label of await page.locator('.lesson-workspace .pointer-label').all()) {
        const bounds = (await label.boundingBox())!
        expect(bounds.x).toBeGreaterThanOrEqual(visualization.x)
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(visualization.x + visualization.width)
      }
      const code = (await page.locator('.code-line.active code').boundingBox())!
      const row = (await page.locator('.code-line.active').boundingBox())!
      expect(code.height).toBeLessThanOrEqual(row.height)
      const result = page.locator('.statement-result')
      if (await result.count()) {
        const bounds = (await result.boundingBox())!
        expect(bounds.x - code.x - code.width).toBeGreaterThanOrEqual(4)
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(row.x + row.width)
        expect(bounds.height).toBeLessThanOrEqual(row.height)
      }
    }
    if (path === 'linked-list-middle') {
      expect(
        await page
          .locator('.lesson-workspace .null-node .sequence-value')
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
      ).toBe(true)
      await expect(page.locator('.lesson-workspace .next-link')).toHaveCount(10)
    }
  }
})
