import { motion } from 'framer-motion';
import { StainedGlass } from '../ui/Sigils.jsx';
import { verseOfTheDay } from '../../data/armor.js';

export default function VerseBeacon() {
  const verse = verseOfTheDay();

  return (
    <motion.div
      className="beacon"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <StainedGlass className="beacon__glass flicker" />
      <div className="stack">
        <span className="section-head__eyebrow">Verse of the day</span>
        <p className="beacon__verse">&ldquo;{verse.text}&rdquo;</p>
        <span className="beacon__ref">{verse.ref}</span>
      </div>
    </motion.div>
  );
}
