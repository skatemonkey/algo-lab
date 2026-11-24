import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
interface PointerAnchor {
  name: string
  index: number
  placement: 'above' | 'below'
  lane?: number
}
/** Keep distinct pointers level; stack only pointers sharing the same cell. */
export function usePointerLabels(
  trackRef: Ref<HTMLElement | null>,
  pointers: Readonly<Ref<readonly PointerAnchor[]>>,
  cellSelector = '.array-cell',
) {
  const labelOffsets = ref<Record<string, number>>({})
  const labelLanes = ref<Record<string, number>>({})
  let labelObserver: ResizeObserver | undefined

  function positionLabels() {
    const track = trackRef.value
    if (!track) return
    const trackBounds = track.getBoundingClientRect()
    const canvas =
      track.closest('[data-pointer-label-boundary]') ?? track.closest('.visualization') ?? track
    const canvasBounds = canvas.getBoundingClientRect()
    const styles = getComputedStyle(track)
    const gap = parseFloat(styles.getPropertyValue('--algo-space-2'))
    const edgeSpace = parseFloat(styles.getPropertyValue('--algo-pointer-edge'))
    const min = canvasBounds.left - trackBounds.left
    const max = canvasBounds.right - trackBounds.left
    const cells = track.querySelectorAll(cellSelector)
    const rows = new Map<
      string,
      {
        name: string
        index: number
        anchor: number
        width: number
        height: number
        start: number
        lane: number
      }[]
    >()

    for (const pointer of pointers.value) {
      const label = track.querySelector(`[data-pointer="${pointer.name}"] .pointer-label`)
      if (!label) continue
      const index = pointer.index
      const cell = cells[index]?.getBoundingClientRect()
      const anchor = cell
        ? cell.left + cell.width / 2 - trackBounds.left
        : index < 0
          ? -edgeSpace
          : trackBounds.width + edgeSpace
      const { width, height } = label.getBoundingClientRect()
      const start = Math.max(min, Math.min(max - width, anchor - width / 2))
      let lane = pointer.lane ?? 0
      if (pointer.lane === undefined) {
        while (rows.get(`${pointer.placement}-${lane}`)?.some((other) => other.index === index))
          lane++
      }
      const row = `${pointer.placement}-${lane}`
      const labels = rows.get(row) ?? []
      labels.push({
        name: pointer.name,
        index,
        anchor,
        width,
        height,
        lane,
        start,
      })
      rows.set(row, labels)
    }

    const offsets: Record<string, number> = {}
    const lanes: Record<string, number> = {}
    for (const labels of rows.values()) {
      for (const label of labels) lanes[label.name] = label.lane
      labels.sort((a, b) => a.anchor - b.anchor)
      // Move only colliding captions, sharing the adjustment across their group.
      const groups: { labels: typeof labels; start: number; width: number }[] = []
      for (const label of labels) {
        groups.push({ labels: [label], start: label.start, width: label.width })
        while (groups.length > 1) {
          const current = groups[groups.length - 1]!
          const previous = groups[groups.length - 2]!
          if (current.start >= previous.start + previous.width) break
          const joined = [...previous.labels, ...current.labels]
          let width = 0
          let preferredStart = 0
          for (const item of joined) {
            preferredStart += item.start - width
            width += item.width + gap
          }
          width -= gap
          const start = Math.max(min, Math.min(max - width, preferredStart / joined.length))
          groups.splice(-2, 2, { labels: joined, start, width })
        }
      }
      for (const group of groups) {
        let start = group.start
        for (const label of group.labels) {
          offsets[label.name] = start + label.width / 2 - label.anchor
          start += label.width + gap
        }
      }
    }
    labelOffsets.value = offsets
    labelLanes.value = lanes

    // Lift the region caption only when a pointer actually occupies its row.
    const conditions = [...track.querySelectorAll('.region-condition')].map((condition) => {
      const bounds = condition.getBoundingClientRect()
      return {
        left: bounds.left - trackBounds.left,
        right: bounds.right - trackBounds.left,
        height: bounds.height,
      }
    })
    if (!conditions.length) return
    const cellTop = cells[0]!.getBoundingClientRect().top - trackBounds.top
    const stem = parseFloat(styles.getPropertyValue('--algo-pointer-stem'))
    const laneHeight = parseFloat(styles.getPropertyValue('--algo-pointer-lane'))
    const obstacles = [...rows.entries()]
      .filter(([row]) => row.startsWith('above-'))
      .flatMap(([, labels]) =>
        labels.flatMap((label) => {
          const bottom = cellTop - gap - stem - label.lane * laneHeight
          const top = bottom - label.height
          const left = label.anchor + offsets[label.name]! - label.width / 2
          return [
            { left, right: left + label.width, top, bottom, captionTop: top },
            {
              left: label.anchor - 4,
              right: label.anchor + 4,
              top: bottom,
              bottom: cellTop - 4,
              captionTop: top,
            },
          ]
        }),
      )
    let captionTop = 0
    for (let attempt = 0; attempt < obstacles.length; attempt++) {
      const collision = obstacles.find((obstacle) =>
        conditions.some(
          (condition) =>
            condition.left < obstacle.right &&
            condition.right > obstacle.left &&
            captionTop < obstacle.bottom &&
            captionTop + condition.height > obstacle.top,
        ),
      )
      if (!collision) break
      captionTop =
        collision.captionTop - gap - Math.max(...conditions.map((condition) => condition.height))
    }
    track.style.setProperty('--algo-region-caption-top', `${captionTop}px`)
  }

  function observeLabels() {
    labelObserver?.disconnect()
    if (trackRef.value) labelObserver?.observe(trackRef.value)
    positionLabels()
  }
  watch([trackRef, pointers], observeLabels, { flush: 'post' })
  onMounted(() => {
    labelObserver = new ResizeObserver(positionLabels)
    observeLabels()
    void document.fonts.ready.then(positionLabels)
  })
  onUnmounted(() => labelObserver?.disconnect())

  return { offsets: labelOffsets, lanes: labelLanes }
}
