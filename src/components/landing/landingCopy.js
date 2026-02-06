// Landing page copy - all text content centralized
export const landingCopy = {
  nav: {
    brand: 'WeManageAll',
    links: [
      { label: 'System', href: '#system' },
      { label: 'Modules', href: '#modules' },
      { label: 'Pricing', href: '#pricing' }
    ]
  },
  
  hero: {
    title: 'Run your startup from one operating system.',
    subtitle: 'Projects, execution, calendar, and knowledge in one calm command center—designed for founders and fast teams.',
    primaryCta: 'Start free',
    secondaryCta: 'View pricing'
  },
  
  modules: {
    pills: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'projects', label: 'Projects' },
      { id: 'workspace', label: 'Workspace' },
      { id: 'calendar', label: 'Calendar' },
      { id: 'resources', label: 'Resources' },
      { id: 'lists', label: 'Lists' }
    ],
    descriptions: {
      dashboard: 'Your command center: tasks, intentions, and today\'s focus in one view.',
      projects: 'Portfolio that stays readable: status, owners, and progress in one table.',
      workspace: 'One-click context: board, list, timeline, and notes together.',
      calendar: 'Time that protects deep work: blocks live beside tasks.',
      resources: 'Knowledge that links back to work: resources connect to projects.',
      lists: 'Simple lists that stay organized and accessible.'
    }
  },
  
  story: {
    steps: [
      {
        title: 'Portfolio that stays readable',
        description: 'See status, owners, and progress in one table. Saved views keep everyone aligned.'
      },
      {
        title: 'One-click context',
        description: 'Open a project and keep board, list, timeline, and notes together.'
      },
      {
        title: 'Time that protects deep work',
        description: 'Schedule blocks live beside tasks so plans and execution stay in sync.'
      },
      {
        title: 'Knowledge that links back to work',
        description: 'Resources and lists connect to projects so information becomes usable.'
      }
    ]
  },
  
  trust: {
    items: [
      {
        label: 'Role-based access',
        description: 'Control who sees what with granular permissions.'
      },
      {
        label: 'Audit-ready logs',
        description: 'Complete activity history for compliance and transparency.'
      },
      {
        label: 'Privacy by design',
        description: 'Your data stays yours with enterprise-grade security.'
      },
      {
        label: 'Fast at scale',
        description: 'Built to handle growing teams without slowing down.'
      }
    ]
  },
  
  pricingTeaser: {
    title: 'Simple plans that scale with your team.',
    plans: [
      {
        name: 'Free',
        bullets: ['Up to 3 projects', 'Basic calendar', 'Personal lists']
      },
      {
        name: 'Team',
        bullets: ['Unlimited projects', 'Team collaboration', 'Advanced features']
      }
    ],
    cta: 'View full pricing',
    secondaryCta: 'Start free'
  },
  
  finalCta: {
    title: 'Ready to unify your workflow?',
    subtitle: 'Start free. No credit card required.',
    cta: 'Start free',
    secondaryCta: 'Book a demo'
  },
  
  footer: {
    tagline: 'Your startup operating system.',
    links: {
      product: [
        { label: 'Home', href: '/home' },
        { label: 'Projects', href: '/projects' },
        { label: 'Work', href: '/work' },
        { label: 'Docs', href: '/docs' },
        { label: 'Calendar', href: '/work?view=calendar' }
      ],
      company: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' }
      ],
      contact: {
        email: 'hello@wemanageall.in'
      }
    },
    copyright: '© 2024 WeManageAll. All rights reserved.'
  }
};
