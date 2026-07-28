import type { ReactNode } from 'react'
import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'

type FeatureItem = {
  title: string
  // Svg: React.ComponentType<React.ComponentProps<'svg'>>
  description: ReactNode
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Engineering notes',
    description: (
      <>
        Reference cards and summaries on architecture, data, APIs and delivery —
        written down once so they can be looked up instead of rediscovered.
      </>
    ),
  },
  {
    title: 'AI-assisted workflows',
    description: (
      <>
        Conventions for working with Claude Code and Cursor: specs, guardrail
        hooks, review subagents and worktrees that hold up on a real squad.
      </>
    ),
  },
  {
    title: 'Searchable and linkable',
    description: (
      <>
        Every note is a markdown file under <code>docs/</code>, indexed for
        full-text search and reachable by a stable URL.
      </>
    ),
  },
]

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
