/**
 * Seed reading plans. Each plan is a short track a reader can complete for XP.
 */
const plans = [
  {
    title: 'Six Days of Armor',
    slug: 'six-days-of-armor',
    summary: 'One piece of the armor a day, straight out of Ephesians 6.',
    armorSlot: 'belt',
    steps: [
      { day: 1, title: 'Belt of Truth', passage: 'Ephesians 6:14', prompt: 'What is one thing you are pretending about?' },
      { day: 2, title: 'Breastplate of Righteousness', passage: 'Ephesians 6:14', prompt: 'What guards your heart today?' },
      { day: 3, title: 'Boots of the Gospel', passage: 'Ephesians 6:15', prompt: 'Where are you being sent this week?' },
      { day: 4, title: 'Shield of Faith', passage: 'Ephesians 6:16', prompt: 'What arrow keeps landing?' },
      { day: 5, title: 'Helmet of Salvation', passage: 'Ephesians 6:17', prompt: 'What lie do you keep believing?' },
      { day: 6, title: 'Sword of the Spirit', passage: 'Ephesians 6:17', prompt: 'Memorise one verse today.' },
    ],
  },
  {
    title: 'The Shepherd and the Giant',
    slug: 'shepherd-and-the-giant',
    summary: 'Five days through 1 Samuel 16-17, the story behind the motion comic.',
    armorSlot: 'sword',
    steps: [
      { day: 1, title: 'The Overlooked Son', passage: '1 Samuel 16:1-13', prompt: 'Who does God see that you do not?' },
      { day: 2, title: 'The Errand', passage: '1 Samuel 17:12-24', prompt: 'What ordinary task put you in the right place?' },
      { day: 3, title: 'The Challenge', passage: '1 Samuel 17:25-37', prompt: 'What have you already survived?' },
      { day: 4, title: 'The Armor That Did Not Fit', passage: '1 Samuel 17:38-40', prompt: 'What are you carrying that is not yours?' },
      { day: 5, title: 'The Stone', passage: '1 Samuel 17:41-51', prompt: 'What are you afraid to throw?' },
    ],
  },
  {
    title: 'Night Watch',
    slug: 'night-watch-plan',
    summary: 'Seven short readings for hard weeks.',
    armorSlot: 'shield',
    steps: [
      { day: 1, title: 'Tired', passage: 'Psalm 6', prompt: '' },
      { day: 2, title: 'Angry', passage: 'Psalm 13', prompt: '' },
      { day: 3, title: 'Alone', passage: 'Psalm 22:1-11', prompt: '' },
      { day: 4, title: 'Afraid', passage: 'Psalm 27', prompt: '' },
      { day: 5, title: 'Guilty', passage: 'Psalm 51', prompt: '' },
      { day: 6, title: 'Waiting', passage: 'Psalm 130', prompt: '' },
      { day: 7, title: 'Morning', passage: 'Psalm 30', prompt: '' },
    ],
  },
];

export default plans;
