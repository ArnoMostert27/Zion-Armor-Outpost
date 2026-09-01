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
];

export default users;
