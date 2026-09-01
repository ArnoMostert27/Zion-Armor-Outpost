import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import Satchel from './components/layout/Satchel.jsx';
import CustomCursor from './components/ui/CustomCursor.jsx';
import Preloader from './components/ui/Preloader.jsx';
import PanelWipe from './components/ui/PanelWipe.jsx';
import Toasts from './components/ui/Toasts.jsx';
import BadgeUnlock from './components/ui/BadgeUnlock.jsx';

import Home from './pages/Home.jsx';
import Racks from './pages/Racks.jsx';
import Dossier from './pages/Dossier.jsx';
import Forge from './pages/Forge.jsx';
import Requisition from './pages/Requisition.jsx';
import Gate from './pages/Gate.jsx';
import Rank from './pages/Rank.jsx';
import Ledger from './pages/Ledger.jsx';
import Plans from './pages/Plans.jsx';
import Scroll from './pages/Scroll.jsx';
import NotFound from './pages/NotFound.jsx';

import useAuth from './store/authStore.js';
import useUI from './store/uiStore.js';
import useScroll from './store/scrollStore.js';
import useSmoothScroll from './hooks/useSmoothScroll.js';

/** Scrolls to the top on every route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  const user = useAuth((s) => s.user);
  const setTheme = useUI((s) => s.setTheme);
  const theme = useUI((s) => s.theme);
  const loadScroll = useScroll((s) => s.load);
  const clearScroll = useScroll((s) => s.clear);

  useSmoothScroll();

  useEffect(() => {
    hydrate();
    setTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep The Scroll in step with who is signed in.
  useEffect(() => {
    if (user) loadScroll();
    else clearScroll();
  }, [user, loadScroll, clearScroll]);

  return (
    <>
      <Preloader />
      <CustomCursor />
      <PanelWipe />
      <ScrollToTop />

      <Header />
      <Satchel />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/racks" element={<Racks />} />
          <Route path="/rack/:slug" element={<Dossier />} />
          <Route path="/forge" element={<Forge />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/scroll" element={<Scroll />} />
          <Route path="/requisition" element={<Requisition />} />
          <Route path="/gate" element={<Gate />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <Toasts />
      <BadgeUnlock />
    </>
  );
}
