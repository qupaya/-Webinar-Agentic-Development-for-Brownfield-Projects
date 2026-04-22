import type { TodoEntity } from '@webinar/api-entities';

export const DEMO_DATA: Partial<TodoEntity>[] = [
  {
    title: 'Rename "Boring Street" to literally anything else',
    description:
      'Residents of Boring Street demand a more exciting name. Current suggestions: "Much More Interesting Avenue" or "Street McStreetface"',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    title: 'Install giant rubber duck in town fountain',
    description:
      'A 15-foot inflatable rubber duck would make the fountain 847% more enjoyable. We did the math.',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    title: 'Declare Tuesdays as "Backwards Day"',
    description:
      'All municipal employees must walk backwards and speak in reverse. It would improve morale by at least 3%.',
    status: 'pending',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    title: 'Build time machine for fixing past mistakes',
    description:
      'Petition for city to invest in temporal technology. Would definitely help with that regrettable statue from 1987.',
    status: 'pending',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    title: 'Mandatory nap time for all citizens',
    description:
      '2-3 PM is now legally protected sleep time. Violators will be required to count sheep publicly.',
    status: 'pending',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    title: 'Replace crosswalk signals with motivational quotes',
    description:
      'Instead of "WALK/DON\'T WALK", display inspiring messages like "YOU GOT THIS!" and "BELIEVE IN YOUR CROSSING ABILITIES!"',
    status: 'pending',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    title: 'Establish official town wizard position',
    description:
      'Every respectable municipality needs a wizard. Pointy hat and staff provided by city budget. Must know at least 3 card tricks.',
    status: 'pending',
    createdAt: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    title: 'Ban Mondays (or at least make them optional)',
    description:
      'Scientific petition to eliminate Mondays from the calendar. Proposed alternative: Two Saturdays in a row.',
    status: 'pending',
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    title: 'Install slide next to City Hall stairs',
    description:
      'Why walk down stairs when you can SLIDE? Added benefit: 300% increase in citizen engagement with municipal buildings.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    processedDate: new Date(Date.now() - 43200000).toISOString(),
    processedReason:
      'Approved! Engineering confirms stairs can support parallel slide installation. Mayor tested prototype and gave it two thumbs up (while sliding).',
  },
  {
    title: 'Free mayor high-fives every Friday',
    description:
      'Mayor must be available in town square every Friday 3-4 PM for high-fives, fist bumps, and occasional jazz hands.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    processedDate: new Date(Date.now() - 86400000).toISOString(),
    processedReason:
      'Mayor enthusiastically accepted! Calendar blocked, hand-strengthening exercises scheduled. May add elbow bumps option.',
  },
  {
    title: 'Dog park where humans are on leashes',
    description:
      'Revolutionary concept: Dogs run free, humans must stay on designated paths. Tables have turned.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    processedDate: new Date(Date.now() - 129600000).toISOString(),
    processedReason:
      'Approved as pilot program! Dogs voted 247-0 in favor. Human leashes will be provided in designer colors.',
  },
  {
    title: 'Rename "Potholes" to "Surprise Road Features"',
    description:
      "Rebranding initiative to improve citizen perception of infrastructure challenges. It's not a bug, it's a feature!",
    status: 'accepted',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    processedDate: new Date(Date.now() - 172800000).toISOString(),
    processedReason:
      'Marketing department loves it! All road signs updated. Pothole repair budget reallocated to "Feature Enhancement Fund."',
  },
  {
    title: 'Replace all stop signs with "Please Proceed Cautiously" signs',
    description:
      'Stop signs are too aggressive. We should be nicer to drivers with polite suggestions instead.',
    status: 'rejected',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    processedDate: new Date(Date.now() - 216000000).toISOString(),
    processedReason:
      'Traffic department says no. Also, lawyers said "ABSOLUTELY NOT" in all caps. Insurance company threatened to quit.',
  },
  {
    title: 'Make pigeons wear tiny hats',
    description:
      'Petition to require all municipal pigeons to wear miniature top hats for sophistication. 2,847 signatures collected.',
    status: 'rejected',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    processedDate: new Date(Date.now() - 259200000).toISOString(),
    processedReason:
      "Pigeons refused to cooperate. Also, wildlife committee reminded us we can't actually make laws for birds. Who knew?",
  },
  {
    title: 'Declare war on neighboring town (water balloon division)',
    description:
      'Strategic initiative to settle the Great Bakery Dispute of 2024 through organized water balloon combat. Rules of engagement attached.',
    status: 'rejected',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    processedDate: new Date(Date.now() - 302400000).toISOString(),
    processedReason:
      'Legal department confirmed this still counts as "war" even with balloons. Neighboring mayor called, was not amused. Diplomatic cookies sent instead.',
  },
];
