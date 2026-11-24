export type ExecutionValue = number | bigint | string

export interface ExecutionVariable {
  name: string
  value: ExecutionValue | null
  updated?: boolean
}

export interface LessonFact {
  id: string
  label: string
  value: ExecutionValue
  description?: string
}

export interface LessonSource {
  label: string
  url: string
}

export interface LessonProblem {
  title: string
  description: string
  examples: readonly { input: string; output: string }[]
  source?: LessonSource
  sources?: readonly LessonSource[]
}

export interface LessonApproach {
  pattern: { label: string; routeName?: string }
  variation: string
  steps: readonly { id: string; title: string; detail?: string }[]
}

export interface LessonExecution<Instruction extends string = string> {
  instruction: Instruction
  outcome: boolean | null
  assignments?: readonly { name: string; value: ExecutionValue }[]
}

export interface LessonDefinition<Instruction extends string = string> {
  id: string
  problem: LessonProblem
  steps: readonly {
    id: string
    title: string
    description: string
    instructions: readonly Instruction[]
    explanations?: readonly {
      instruction: Instruction
      outcome?: boolean
      text: string
    }[]
  }[]
  repeat?: {
    from: string
    through: string
    label: string
  }
  complexity?: { time: string; space: string }
  notes?: readonly { title: string; text: string }[]
  solutions?: readonly { title: string; code: string }[]
  pseudocode: readonly {
    id: Instruction
    text: string
    indent: number
  }[]
}
