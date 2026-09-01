/**
 * Seed users. Passwords are hashed by the User model's pre-save hook.
 * Change these before any real deployment.
 */
const users = [
  {
    name: 'The Outpost Keeper',
    email: 'keeper@zionarmor.dev',
    password: 'keeper123',
    role: 'keeper',
    xp: 2400,
    avatarSigil: 'sword',
  },
  {
    name: 'Arno Mostert',
    email: 'arno@zionarmor.dev',
    password: 'recruit123',
    role: 'customer',
    xp: 820,
    avatarSigil: 'shield',
  },
  {
    name: 'Sam Okonkwo',
    email: 'sam@zionarmor.dev',
    password: 'recruit123',
    role: 'customer',
    xp: 180,
    avatarSigil: 'helmet',
  },
  {
    // The shared account behind the "Try it as a demo visitor" button on the
    // sign-in screen. Starts at Shield Bearer so a visitor immediately sees the
    // rank discount and badge system doing something.
    name: 'Demo Visitor',
    email: 'demo@zionarmor.dev',
    password: 'demo1234',
    role: 'customer',
    xp: 340,
    avatarSigil: 'shield',
  },
];

export default users;
