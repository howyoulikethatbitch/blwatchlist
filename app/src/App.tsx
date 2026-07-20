import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import SidebarNav, { type TabId } from '@/components/SidebarNav';
import MilestoneModal from '@/components/MilestoneModal';
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt';
// Overview is the landing tab — keep it eager so first paint is instant
import OverviewTab from '@/components/tabs/OverviewTab';
import './App.css';

// ── Lazy-loaded routes ────────────────────────────────────────────────────────
// Each lazy() call produces a separate JS chunk that is only downloaded
// when the user first navigates to that tab.
const BLSeriesTab      = lazy(() => import('@/components/tabs/BLSeriesTab'));
const OngoingTab       = lazy(() => import('@/components/tabs/OngoingTab'));
const FavoritesTab     = lazy(() => import('@/components/tabs/FavoritesTab'));
const Top10Tab         = lazy(() => import('@/components/tabs/Top10Tab'));
const StatisticsTab    = lazy(() => import('@/components/tabs/StatisticsTab'));
const SettingsTab      = lazy(() => import('@/components/tabs/SettingsTab'));
const SearchOverlay    = lazy(() => import('@/components/SearchOverlay'));
const BLWatcherProfile = lazy(() => import('@/components/BLWatcherProfile'));

// ── Minimal tab-loading skeleton ──────────────────────────────────────────────
function TabFallback() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        className="w-6 h-6 rounded-full bg-[#E50914]"
      />
    </div>
  );
}

function AppContent() {
  const { isLoaded, currentMilestone, dismissMilestone } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Handle import events from SettingsTab
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<unknown>;
      if (customEvent.detail) {
        window.location.reload();
      }
    };
    window.addEventListener('bl-import', handler);
    return () => window.removeEventListener('bl-import', handler);
  }, []);

  // Handle profile open events from SettingsTab post-import prompt
  useEffect(() => {
    const handler = () => {
      setActiveTab('statistics');
      setProfileOpen(true);
    };
    window.addEventListener('bl-open-profile', handler);
    return () => window.removeEventListener('bl-open-profile', handler);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[#E50914] font-black text-2xl"
        >
          BL WATCHLIST
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar Navigation */}
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Header */}
      <Header onSearchOpen={() => setSearchOpen(true)} />

      {/* Main Content */}
      <main className="pt-16 px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <Suspense fallback={<TabFallback />}>
              {activeTab === 'overview'    && <OverviewTab />}
              {activeTab === 'blseries'   && <BLSeriesTab />}
              {activeTab === 'ongoing'    && <OngoingTab />}
              {activeTab === 'favorites'  && <FavoritesTab />}
              {activeTab === 'top10'      && <Top10Tab />}
              {activeTab === 'statistics' && <StatisticsTab onViewProfile={() => setProfileOpen(true)} />}
              {activeTab === 'settings'   && <SettingsTab />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Search Overlay — lazy, only loaded when first opened */}
      <Suspense fallback={null}>
        {searchOpen && (
          <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </Suspense>

      {/* BL Watcher Profile — lazy, only loaded from Statistics tab */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {profileOpen && (
            <BLWatcherProfile onBack={() => setProfileOpen(false)} />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Milestone Celebration Modal */}
      <MilestoneModal
        isOpen={!!currentMilestone}
        milestone={currentMilestone}
        onClose={dismissMilestone}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
      <PWAUpdatePrompt />
    </AppProvider>
  );
}

export default App;
