import { useState } from 'react'
import './styles.css'

type Page = 'home' | 'pass' | 'profile'
type Nav = 'prime' | 'secondary'
type Protection = 'available' | 'used' | 'none'

type Params = {
  page: Page
  points: number
  weeks: number
  goal: 0 | 1
  protection: Protection
  active: boolean
  redeemed: boolean
  nav: Nav
}

type RewardTier = {
  threshold: number
  name: string
  reward: string
  lockedCopy: string
  eligibleCopy: string
  inactiveCopy: string
}

const REWARD_TIERS: RewardTier[] = [
  {
    threshold: 250,
    name: 'Cafe item',
    reward: 'Example reward — illustrative only, not a confirmed offer',
    lockedCopy: "At 250 points, you'll unlock a quarterly cafe item reward — as long as you stay active.",
    eligibleCopy: "You're eligible for a cafe item this quarter.",
    inactiveCopy:
      "You've reached 250 points, but you haven't been active in the last 90 days. Complete an activity to stay eligible for this quarter's reward.",
  },
  {
    threshold: 1000,
    name: "$25 Member's Mark product",
    reward: 'Example reward — illustrative only, not a confirmed offer',
    lockedCopy:
      "At 1,000 points, you'll unlock a quarterly $25 Member's Mark product — as long as you stay active.",
    eligibleCopy: "You're eligible for a $25 Member's Mark product this quarter.",
    inactiveCopy:
      "You've reached 1,000 points, but you haven't been active in the last 90 days. Complete an activity to stay eligible for this quarter's reward.",
  },
  {
    threshold: 3000,
    name: '$50 exclusive Member\'s Mark product',
    reward: 'Example reward — illustrative only, not a confirmed offer',
    lockedCopy:
      "At 3,000 points, you'll unlock a quarterly $50 exclusive Member's Mark product — as long as you stay active.",
    eligibleCopy: "You're eligible for an exclusive $50 Member's Mark product this quarter.",
    inactiveCopy:
      "You've reached 3,000 points, but you haven't been active in the last 90 days. Complete an activity to stay eligible for this quarter's reward.",
  },
]

const SCENARIOS = [
  '?page=pass&points=100&weeks=4&goal=1&protection=available',
  '?page=pass&points=500&active=false&weeks=4&goal=1&protection=available',
  '?page=pass&points=500&active=true&redeemed=false&weeks=4&goal=1&protection=available',
  '?page=pass&points=500&active=true&redeemed=true&weeks=4&goal=1&protection=available',
  '?page=pass&points=1500&active=true&redeemed=false&weeks=4&goal=1&protection=available',
  '?page=pass&points=3500&active=true&redeemed=false&weeks=4&goal=1&protection=available',
] as const

const numberParam = (value: string | null, fallback: number, min: number, max: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.floor(parsed)))
}

const parseParams = (search: string): Params => {
  const query = new URLSearchParams(search)
  const pageValue = query.get('page')
  const protectionValue = query.get('protection')
  const navValue = query.get('nav')

  return {
    page: pageValue === 'pass' || pageValue === 'profile' ? pageValue : 'home',
    points: numberParam(query.get('points'), 0, 0, 100000),
    weeks: numberParam(query.get('weeks'), 0, 0, 26),
    goal: query.get('goal') === '1' ? 1 : 0,
    protection:
      protectionValue === 'available' || protectionValue === 'used' ? protectionValue : 'none',
    active: query.get('active') !== 'false',
    redeemed: query.get('redeemed') === 'true',
    nav: navValue === 'secondary' ? 'secondary' : 'prime',
  }
}

const formatPoints = (points: number) => points.toLocaleString('en-US')

const queryFor = (params: Params, page: Page, overrides: Partial<Params> = {}) => {
  const next = { ...params, ...overrides, page }
  const query = new URLSearchParams({
    page: next.page,
    points: String(next.points),
    weeks: String(next.weeks),
    goal: String(next.goal),
    protection: next.protection,
    active: String(next.active),
    redeemed: String(next.redeemed),
    nav: next.nav,
  })
  return `?${query.toString()}`
}

const getRewardTier = (points: number) => {
  return [...REWARD_TIERS].reverse().find((tier) => points >= tier.threshold) ?? null
}

const getProgress = (points: number) => {
  if (points < 250) {
    return {
      percent: (points / 250) * 100,
      label: `${formatPoints(points)} / 250 pts`,
      preview: "You're building toward your first Foundation milestone.",
    }
  }
  if (points < 1000) {
    return {
      percent: ((points - 250) / 750) * 100,
      label: `${formatPoints(points)} / 1,000 pts`,
      preview: 'Your first milestone is unlocked. Keep going toward 1,000 points.',
    }
  }
  if (points < 3000) {
    return {
      percent: ((points - 1000) / 2000) * 100,
      label: `${formatPoints(points)} / 3,000 pts`,
      preview: "You're on your way to more ways to shape what comes next.",
    }
  }
  return {
    percent: 100,
    label: '3,000+ pts · All Foundation milestones reached',
    preview: 'All Foundation milestones are reached. Thank you for shaping what comes next.',
  }
}

const Header = ({ pageLink }: { pageLink: (page: Page) => string }) => (
  <header className="app-header">
    <a className="wordmark" href={pageLink('home')} aria-label="Member's Mark home">
      <span className="wordmark__mark" aria-hidden="true">M</span>
      <span>
        <strong>Member's Mark</strong>
        <small>MEMBER EXPERIENCE</small>
      </span>
    </a>
    <a className="profile-link" href={pageLink('profile')} aria-label="Open profile">
      <span className="profile-glyph" aria-hidden="true">○</span>
    </a>
  </header>
)

const BottomNav = ({ params, pageLink }: { params: Params; pageLink: (page: Page) => string }) => (
  <nav className={`bottom-nav bottom-nav--${params.nav}`} aria-label="Primary navigation">
    <a className={params.page === 'home' ? 'bottom-nav__item is-active' : 'bottom-nav__item'} href={pageLink('home')} aria-current={params.page === 'home' ? 'page' : undefined}>
      <span aria-hidden="true">⌂</span>
      <small>Home</small>
    </a>
    <a className={params.page === 'pass' ? 'bottom-nav__item is-active' : 'bottom-nav__item'} href={pageLink('pass')} aria-current={params.page === 'pass' ? 'page' : undefined}>
      <span aria-hidden="true">✦</span>
      <small>{params.nav === 'secondary' ? 'Explore' : 'My pass'}</small>
    </a>
    <a className={params.page === 'profile' ? 'bottom-nav__item is-active' : 'bottom-nav__item'} href={pageLink('profile')} aria-current={params.page === 'profile' ? 'page' : undefined}>
      <span aria-hidden="true">○</span>
      <small>Profile</small>
    </a>
  </nav>
)

const Toast = ({ message }: { message: string | null }) => (
  <div className={`toast ${message ? 'toast--visible' : ''}`} role="status" aria-live="polite">
    {message}
  </div>
)

const WhatsNew = ({ locked = false }: { locked?: boolean }) => (
  <section className="section-block whats-new" aria-labelledby="whats-new-title">
    <div className="section-heading">
      <span className="eyebrow">Member updates</span>
      <h2 id="whats-new-title">What's new</h2>
    </div>
    <div className="card-grid card-grid--two">
      <article className={`info-card ${locked ? 'info-card--locked' : ''}`}>
        <span className="card-icon" aria-hidden="true">{locked ? '×' : '✦'}</span>
        <h3>{locked ? 'More ways to participate are coming' : 'New ways to participate'}</h3>
        <p>{locked ? 'Reach 250 points to unlock updates about new opportunities.' : 'Your feedback helps shape what comes next for Member\'s Mark.'}</p>
        <span className="card-link">{locked ? 'Locked until 250 points' : 'Available now'}</span>
      </article>
      <article className={`info-card ${locked ? 'info-card--locked' : ''}`}>
        <span className="card-icon" aria-hidden="true">{locked ? '×' : '▣'}</span>
        <h3>{locked ? 'Quarterly rewards' : 'Quarterly activity rewards'}</h3>
        <p>{locked ? 'Stay active after 250 points for an illustrative quarterly reward.' : 'Stay active to keep your highest reached reward tier available each quarter.'}</p>
        <span className="card-link">{locked ? 'Locked until 250 points' : 'Illustrative only'}</span>
      </article>
    </div>
  </section>
)

const ProgressModule = ({ params, pageLink }: { params: Params; pageLink: (page: Page) => string }) => {
  const progress = getProgress(params.points)
  return (
    <a className="progress-module" href={pageLink('pass')}>
      <div className="progress-module__topline">
        <span className="eyebrow">Foundation progress</span>
        <span className="arrow" aria-hidden="true">↗</span>
      </div>
      <div className="progress-module__points">{formatPoints(params.points)} <span>points</span></div>
      <div className="progress-bar" aria-label={`${progress.percent}% complete`}>
        <span style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="progress-module__bottomline">
        <strong>{progress.label}</strong>
        <span>{Math.round(progress.percent)}%</span>
      </div>
      <p>{progress.preview}</p>
    </a>
  )
}

const DevPanel = () => (
  <details className="dev-panel">
    <summary>Prototype scenarios</summary>
    <div className="dev-panel__content">
      <p>Six focused reward scenarios</p>
      <div className="scenario-list">
        {SCENARIOS.map((scenario, index) => (
          <a href={scenario} key={scenario}>Scenario {index + 1}</a>
        ))}
      </div>
    </div>
  </details>
)

const CommunityPassPreview = ({ params, pageLink }: { params: Params; pageLink: (page: Page) => string }) => {
  const tier = getRewardTier(params.points)
  const snapshot = params.points >= 3000
    ? {
        current: 'Premium IHUT opportunities',
        currentDetail: 'Your highest Foundation milestone is unlocked.',
        next: 'All Foundation milestones reached',
        nextDetail: 'Keep your activity going each quarter.',
        note: 'Your pass is fully unlocked for the current Foundation journey.',
      }
    : params.points >= 1000
      ? {
          current: 'Basic IHUT opportunities',
          currentDetail: 'You can explore illustrative feedback opportunities.',
          next: 'Premium IHUT opportunities',
          nextDetail: 'Unlocks at 3,000 points.',
          note: 'Your pass is opening new ways to shape what comes next.',
        }
      : params.points >= 250
        ? {
            current: 'Member updates',
            currentDetail: 'Your first Foundation milestone is unlocked.',
            next: 'Basic IHUT opportunities',
            nextDetail: 'Unlocks at 1,000 points.',
            note: 'Your pass is active. Keep participating to see more opportunities.',
          }
        : {
            current: 'Getting started',
            currentDetail: 'Your first pass benefit is ahead.',
            next: 'Member updates',
            nextDetail: 'Unlocks at 250 points.',
            note: 'Your community pass is building with every activity.',
          }

  return (
    <section className="community-pass-preview" aria-labelledby="community-pass-preview-title">
      <div className="community-pass-preview__header">
        <div>
          <span className="eyebrow">Community pass</span>
          <h2 id="community-pass-preview-title">Your pass, at a glance</h2>
        </div>
        <span className="community-pass-preview__icon" aria-hidden="true">✦</span>
      </div>
      <div className="community-pass-preview__grid">
        <div>
          <span className="preview-label">Where you are</span>
          <strong>{snapshot.current}</strong>
          <small>{snapshot.currentDetail}</small>
        </div>
        <div>
          <span className="preview-label">What comes next</span>
          <strong>{snapshot.next}</strong>
          <small>{snapshot.nextDetail}</small>
        </div>
      </div>
      <div className="community-pass-preview__note">
        <span aria-hidden="true">✓</span>
        <p>{snapshot.note}</p>
      </div>
      <span className="illustrative-label">
        {tier ? `Example reward tier reached: ${tier.name} — illustrative only, not a confirmed offer` : 'Example reward begins at 250 points — illustrative only, not a confirmed offer'}
      </span>
      <a className="text-button community-pass-preview__link" href={pageLink('pass')}>See your community pass <span aria-hidden="true">↗</span></a>
    </section>
  )
}

export const HomePage = ({ params, pageLink }: { params: Params; pageLink: (page: Page) => string }) => {
  const rewardAvailable = Boolean(getRewardTier(params.points) && params.active && !params.redeemed)
  return (
    <>
      <main className="page-content">
        <section className="intro-block">
          <span className="eyebrow">Your Member's Mark journey</span>
          <h1>Help shape what comes next</h1>
          <p>Share your perspective, explore opportunities, and see how your participation adds up.</p>
        </section>
        <ProgressModule params={params} pageLink={pageLink} />
        <CommunityPassPreview params={params} pageLink={pageLink} />
        <div className="plain-status-lines" aria-label="Activity status">
          <p><strong>{params.weeks}-week streak</strong></p>
          {rewardAvailable && <p>Reward available this quarter</p>}
        </div>
        <WhatsNew locked={params.points < 250} />
        <section className="feed-placeholder" aria-label="Activity feed placeholder">
          <span className="eyebrow">Your feed</span>
          <h2>More opportunities will appear here</h2>
          <p>Check back as new Member's Mark activities become available.</p>
        </section>
        <DevPanel />
      </main>
    </>
  )
}

const MilestoneTimeline = ({ points }: { points: number }) => {
  const nodes = [
    { threshold: 0, label: 'Start', detail: 'Journey started' },
    { threshold: 250, label: '250', detail: 'First milestone' },
    { threshold: 1000, label: '1,000', detail: 'Basic IHUT' },
    { threshold: 3000, label: '3,000', detail: 'Premium IHUT' },
  ]
  return (
    <div className="timeline timeline--milestones">
      {nodes.map((node, index) => {
        const reached = points >= node.threshold
        return (
          <div className={`timeline-node ${reached ? 'is-reached' : 'is-locked'}`} key={node.label}>
            <span className="timeline-node__dot" aria-hidden="true">{reached ? '✓' : '×'}</span>
            {index < nodes.length - 1 && <span className="timeline-node__line" aria-hidden="true" />}
            <strong>{node.label}{node.threshold > 0 ? ' pts' : ''}</strong>
            <small>{reached ? node.detail : `Reach ${formatPoints(node.threshold)} points`}</small>
          </div>
        )
      })}
    </div>
  )
}

const IhutPanel = ({ threshold, points, onAction }: { threshold: 1000 | 3000; points: number; onAction: (message: string) => void }) => {
  const premium = threshold === 3000
  const unlocked = points >= threshold
  const title = `${premium ? 'Premium' : 'Basic'} IHUT opportunities`
  const summary = (
    <>
      <span className="summary-icon" aria-hidden="true">{unlocked ? '✦' : '×'}</span>
      <span>
        <strong>{title}</strong>
        <small>{unlocked ? `Unlocked at ${formatPoints(threshold)} points` : `Locked until ${formatPoints(threshold)} points`}</small>
      </span>
      <span className="summary-chevron" aria-hidden="true">{unlocked ? '⌄' : '×'}</span>
    </>
  )
  const body = (
    <div className="ihut-panel__body">
      <p>{premium ? 'At 3,000 points, explore exclusive opportunities to help shape Member\'s Mark products.' : 'At 1,000 points, explore opportunities to try products and share your perspective.'}</p>
      <span className="illustrative-label">Example opportunity — illustrative only, not a confirmed offer</span>
      <div className="opportunity-grid">
        <article className="opportunity-card">
          <span className="opportunity-card__image" aria-hidden="true">◒</span>
          <strong>{premium ? 'Seasonal hosting collection' : 'Everyday essentials'} </strong>
          <small>Share feedback after trying</small>
        </article>
        <article className="opportunity-card">
          <span className="opportunity-card__image" aria-hidden="true">◌</span>
          <strong>{premium ? 'New Member\'s Mark favorite' : 'Home organization set'}</strong>
          <small>Tell us what you think</small>
        </article>
      </div>
      <span className="illustrative-label">Example opportunity — illustrative only, not a confirmed offer</span>
      <p className="selection-note"><strong>Selection note:</strong> Opportunities are illustrative examples. Actual availability and selection may vary.</p>
      <button className="text-button" onClick={() => onAction('Browse opportunities is a prototype stub.')}>Browse opportunities <span aria-hidden="true">↗</span></button>
    </div>
  )
  if (!unlocked) {
    return <div className="ihut-panel ihut-panel--locked"><div className="ihut-panel__summary">{summary}</div></div>
  }
  return <details className="ihut-panel"><summary>{summary}</summary>{body}</details>
}

const WeeklyActivity = ({ params }: { params: Params }) => {
  const [selectedGoal, setSelectedGoal] = useState<0 | 1 | 2>(params.goal)
  const streaks = [4, 8, 12, 26]
  const goalOptions = [
    { value: 0 as const, label: 'One activity', detail: 'A simple way to start' },
    { value: 1 as const, label: 'Two activities', detail: 'Keep your momentum going' },
    { value: 2 as const, label: 'Three activities', detail: 'Build a steady rhythm' },
  ]
  return (
    <section className="section-block weekly-section" aria-labelledby="weekly-title">
      <div className="section-heading">
        <span className="eyebrow">Keep your momentum</span>
        <h2 id="weekly-title">Weekly activity</h2>
      </div>
      <div className="streak-timeline" aria-label="Weekly streak milestones">
        {streaks.map((streak) => {
          const earned = params.weeks >= streak
          return (
            <div className={`streak-node ${earned ? 'is-earned' : 'is-locked'}`} key={streak}>
              <span className="streak-node__dot" aria-hidden="true">{earned ? '✓' : '×'}</span>
              <strong>{streak}</strong>
              <small>weeks</small>
            </div>
          )
        })}
      </div>
      <article className="goal-card">
        <div className="goal-card__header">
          <div>
            <span className="eyebrow">Illustrative weekly goal</span>
            <h3>Choose a goal that feels right</h3>
          </div>
          <span className="goal-card__badge" aria-hidden="true">◎</span>
        </div>
        <div className="goal-options">
          {goalOptions.map((option) => (
            <button className={`goal-option ${selectedGoal === option.value ? 'is-selected' : ''}`} onClick={() => setSelectedGoal(option.value)} type="button" key={option.label}>
              <span className="goal-option__radio" aria-hidden="true">{selectedGoal === option.value ? '●' : '○'}</span>
              <span><strong>{option.label}</strong><small>{option.detail}</small></span>
            </button>
          ))}
        </div>
      </article>
      <p className="protection-line"><span className="status-dot" aria-hidden="true" />
        {params.protection === 'available' && 'Streak Protection is available if you need it.'}
        {params.protection === 'used' && 'Streak Protection was used recently. Your progress is still here.'}
        {params.protection === 'none' && 'Streak Protection becomes available as you build your streak.'}
      </p>
    </section>
  )
}

const Voucher = ({ tier, redeemed, onAction }: { tier: RewardTier; redeemed: boolean; onAction: (message: string) => void }) => (
  <div className={`voucher ${redeemed ? 'voucher--redeemed' : ''}`}>
    <div className="voucher__topline">
      <span className="eyebrow">{redeemed ? 'Reward redeemed' : 'Your illustrative reward'}</span>
      {redeemed ? <span className="redeemed-check">✓ Redeemed</span> : <span className="voucher__ticket">QUARTERLY</span>}
    </div>
    <div className="voucher__main">
      <div>
        <h3>{tier.name}</h3>
        <span className="illustrative-label">{tier.reward}</span>
      </div>
      <div className="qr-placeholder" aria-label="Illustrative QR placeholder">QR</div>
    </div>
    {redeemed ? (
      <p className="voucher__date">Next reward available <strong>[illustrative next-quarter date]</strong></p>
    ) : (
      <>
        <p className="voucher__instruction">{tier.name === 'Cafe item' ? 'Show this at the cafe counter' : 'Show this to redeem'}</p>
        <p className="voucher__date">Valid through <strong>[illustrative end-of-quarter date]</strong></p>
        <button className="button button--primary button--full" onClick={() => onAction('Redeem is a prototype stub — no real redemption occurred.')}>Redeem</button>
      </>
    )}
  </div>
)

const QuarterlyReward = ({ params, onAction }: { params: Params; onAction: (message: string) => void }) => {
  const tier = getRewardTier(params.points)
  return (
    <section className="section-block quarterly-section" aria-labelledby="quarterly-title">
      <div className="section-heading">
        <span className="eyebrow">New · quarterly benefit</span>
        <h2 id="quarterly-title">Quarterly activity reward</h2>
        <p>Your highest reached tier is available one quarter at a time. Tiers do not stack.</p>
      </div>
      {!tier ? (
        <article className="reward-status-card reward-status-card--locked">
          <span className="reward-status-card__icon" aria-hidden="true">×</span>
          <div>
            <h3>No reward tier yet</h3>
            <p>{REWARD_TIERS[0].lockedCopy}</p>
            <span className="illustrative-label">{REWARD_TIERS[0].name} · {REWARD_TIERS[0].reward}</span>
          </div>
        </article>
      ) : !params.active ? (
        <article className="reward-status-card reward-status-card--inactive">
          <span className="reward-status-card__icon" aria-hidden="true">○</span>
          <div>
            <span className="eyebrow">Highest tier reached · {formatPoints(tier.threshold)} points</span>
            <h3>{tier.name}</h3>
            <p>{tier.inactiveCopy}</p>
            <span className="illustrative-label">{tier.reward}</span>
          </div>
        </article>
      ) : (
        <Voucher tier={tier} redeemed={params.redeemed} onAction={onAction} />
      )}
      {/* The 90-day activity rule is a separate illustrative concept from the weekly streak above; Phase 2's real activity model is not settled. */}
      <p className="section-note">Quarterly reward eligibility is illustrative and separate from weekly streak progress.</p>
    </section>
  )
}

export const PassPage = ({ params, onAction }: { params: Params; onAction: (message: string) => void }) => (
  <main className="page-content">
    <section className="pass-hero">
      <span className="eyebrow">Your cumulative pass</span>
      <h1>{formatPoints(params.points)} <span>points</span></h1>
      <p>Every point contributes to your lifetime Member's Mark journey.</p>
    </section>
    <section className="section-block milestone-section" aria-labelledby="milestones-title">
      <div className="section-heading">
        <span className="eyebrow">Lifetime progress</span>
        <h2 id="milestones-title">Foundation milestones</h2>
      </div>
      <MilestoneTimeline points={params.points} />
      <WhatsNew locked={params.points < 250} />
    </section>
    <section className="section-block ihut-section" aria-labelledby="ihut-title">
      <div className="section-heading">
        <span className="eyebrow">Member testing</span>
        <h2 id="ihut-title">Help shape products</h2>
        <p>Tap an unlocked milestone to learn about illustrative opportunities.</p>
      </div>
      <IhutPanel threshold={1000} points={params.points} onAction={onAction} />
      <IhutPanel threshold={3000} points={params.points} onAction={onAction} />
    </section>
    <WeeklyActivity params={params} />
    <QuarterlyReward params={params} onAction={onAction} />
    <DevPanel />
  </main>
)

export const ProfilePage = ({ params, pageLink }: { params: Params; pageLink: (page: Page) => string }) => {
  const benefits = [
    { threshold: 250, label: 'Member updates', copy: 'See new ways to participate.' },
    { threshold: 1000, label: 'Basic IHUT opportunities', copy: 'Explore illustrative product feedback opportunities.' },
    { threshold: 3000, label: 'Premium IHUT opportunities', copy: 'Explore illustrative exclusive opportunities.' },
  ]
  const streakBadges = [4, 8, 12, 26].filter((streak) => params.weeks >= streak)
  return (
    <main className="page-content">
      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">M</div>
        <span className="eyebrow">Member profile</span>
        <h1>Your Member's Mark journey</h1>
        <p><strong>{formatPoints(params.points)} lifetime points</strong> · {params.weeks}-week streak</p>
      </section>
      <section className="section-block" aria-labelledby="benefits-title">
        <div className="section-heading"><span className="eyebrow">Unlocked as you go</span><h2 id="benefits-title">Benefits unlocked</h2></div>
        <div className="list-card">
          {benefits.map((benefit) => {
            const unlocked = params.points >= benefit.threshold
            return <div className={`list-row ${unlocked ? 'is-unlocked' : 'is-locked'}`} key={benefit.label}>
              <span className="list-row__icon" aria-hidden="true">{unlocked ? '✓' : '×'}</span>
              <span><strong>{benefit.label}</strong><small>{unlocked ? benefit.copy : `Reach ${formatPoints(benefit.threshold)} points to unlock`}</small></span>
            </div>
          })}
        </div>
      </section>
      <section className="section-block" aria-labelledby="badges-title">
        <div className="section-heading"><span className="eyebrow">Keep showing up</span><h2 id="badges-title">Streak badges</h2></div>
        <div className="badge-list">
          {streakBadges.length ? streakBadges.map((streak) => <div className="badge-row" key={streak}><span className="badge-row__icon" aria-hidden="true">✦</span><strong>{streak}-Week Streak — Earned</strong></div>) : <p className="empty-state">Complete four consecutive weeks to earn your first badge.</p>}
        </div>
      </section>
      <section className="section-block" aria-labelledby="history-title">
        <div className="section-heading"><span className="eyebrow">Illustrative examples</span><h2 id="history-title">Reward history</h2></div>
        <div className="list-card">
          <div className="list-row is-unlocked"><span className="list-row__icon" aria-hidden="true">✓</span><span><strong>Q3 2026 — Cafe item — Redeemed</strong><small>Example history — illustrative only</small></span></div>
          <div className="list-row is-unlocked"><span className="list-row__icon" aria-hidden="true">•</span><span><strong>Q4 2026 — Cafe item — Available</strong><small>Example history — illustrative only</small></span></div>
          <div className="list-row is-locked"><span className="list-row__icon" aria-hidden="true">×</span><span><strong>Q1 2027 — $25 product — Upcoming</strong><small>Example history — illustrative only</small></span></div>
        </div>
      </section>
      <a className="button button--secondary button--full back-to-pass" href={pageLink('pass')}>Back to my pass <span aria-hidden="true">↗</span></a>
      <DevPanel />
    </main>
  )
}

export default function App() {
  const params = parseParams(window.location.search)
  const [toast, setToast] = useState<string | null>(null)
  const pageLink = (page: Page) => queryFor(params, page)
  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="app-shell">
      <Header pageLink={pageLink} />
      {params.page === 'home' && <HomePage params={params} pageLink={pageLink} />}
      {params.page === 'pass' && <PassPage params={params} onAction={showToast} />}
      {params.page === 'profile' && <ProfilePage params={params} pageLink={pageLink} />}
      <BottomNav params={params} pageLink={pageLink} />
      <Toast message={toast} />
    </div>
  )
}
