export type ProcessStage = {
  step: string
  title: string
  summary: string
  /** What actually happens during the stage. */
  activity: string
  /** What the client physically receives. */
  deliverable: string
  /** The decision or result the stage unlocks. */
  outcome: string
  duration: string
}

export const growthSystem: ProcessStage[] = [
  {
    step: '01',
    title: 'Audit & Discovery',
    summary: 'Establish what is actually true before proposing anything.',
    activity:
      'We review analytics, ad accounts, CRM data, and the storefront or funnel, then interview the people who own each. Tracking is validated before any number is used as a baseline.',
    deliverable: 'A written audit covering measurement integrity, channel economics, and the constraints we found.',
    outcome: 'An agreed baseline. Every later claim of improvement is measured against it.',
    duration: 'Weeks 1–2',
  },
  {
    step: '02',
    title: 'Strategy & Roadmap',
    summary: 'Turn the diagnosis into a sequenced plan with named owners.',
    activity:
      'We prioritise the audit findings by value at risk against effort, then sequence them into a 90-day roadmap with owners, dependencies, and success measures per item.',
    deliverable: 'A 90-day roadmap, a measurement plan, and the KPI set the engagement will be judged on.',
    outcome: 'A go/no-go decision point. You approve the sequence before any budget moves.',
    duration: 'Weeks 2–3',
  },
  {
    step: '03',
    title: 'Execute & Launch',
    summary: 'Build and ship the first cycle of work.',
    activity:
      'Tracking fixes land first, then campaign structure, systems, and creative. Work ships in cycles so results are attributable to specific changes rather than to everything at once.',
    deliverable: 'Live campaigns, rebuilt systems, and a change log tying each release to the metric it targets.',
    outcome: 'First measurable movement, with a clear record of what caused it.',
    duration: 'Weeks 3–8',
  },
  {
    step: '04',
    title: 'Optimize & Scale',
    summary: 'Reallocate on evidence, on a fixed cadence.',
    activity:
      'Tests run on a standing slate with written hypotheses and kill thresholds. Budget and effort move toward verified contribution rather than toward whichever channel reported best that week.',
    deliverable: 'Test results, reallocation decisions, and an updated backlog each cycle.',
    outcome: 'Compounding improvement, with losing work retired on a defined threshold instead of drifting.',
    duration: 'Ongoing, monthly cycles',
  },
  {
    step: '05',
    title: 'Report & Grow',
    summary: 'Show the working, then plan the next horizon.',
    activity:
      'A live dashboard covers the numbers continuously. A scheduled review explains what changed, what it cost, what did not work, and what we recommend next.',
    deliverable: 'A live dashboard plus a written review on the cadence your plan includes.',
    outcome: 'A decision on the next quarter, made from evidence rather than from a pitch.',
    duration: 'Ongoing',
  },
]
