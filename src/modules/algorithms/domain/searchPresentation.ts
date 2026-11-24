import type { SearchFrame } from './binarySearch'
import type { ExecutionVariable } from './lesson'

export interface SearchDivision {
  index: number
  before: string
  after: string
}

export interface SearchDecisionCase {
  value: boolean
  condition: string
  action: string
  direction: 'left' | 'right'
  save?: string
}

export interface BoundarySearchApproach {
  pattern: { label: string; routeName: string }
  variation: string
  target: string
  answerLabel: string
  regions: readonly [string, string]
  targetRegion?: 0 | 1
  steps: readonly { id: 'split' | 'search' | 'return'; title: string; detail: string }[]
  cases: readonly [SearchDecisionCase, SearchDecisionCase]
}

/** Highlight a decision only once the corresponding comparison has been evaluated. */
export function searchDecisionOutcome(frame: SearchFrame<string>, exact = false): boolean | null {
  switch (frame.instruction) {
    case 'condition':
      return exact && frame.outcome !== true ? null : frame.outcome
    case 'smaller':
      return frame.outcome === null ? null : !frame.outcome
    case 'save':
    case 'right':
    case 'right-match':
      return true
    case 'left':
      return false
    default:
      return null
  }
}

export function searchVariables(
  frame: SearchFrame<string>,
  answerName = 'answer',
): ExecutionVariable[] {
  return [
    { name: 'left', value: frame.left, updated: ['bounds', 'left'].includes(frame.instruction) },
    {
      name: 'right',
      value: frame.right,
      updated: ['bounds', 'right', 'right-match'].includes(frame.instruction),
    },
    { name: 'mid', value: frame.mid, updated: frame.instruction === 'midpoint' },
    {
      name: answerName,
      value: frame.answer,
      updated: ['answer', 'save'].includes(frame.instruction),
    },
  ]
}
