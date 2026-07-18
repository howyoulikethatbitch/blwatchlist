import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import SidebarNav, { type TabId } from '@/components/SidebarNav';
import SearchOverlay from '@/components/SearchOverlay';
import BLWatcherProfile from '@/components/BLWatcherProfile';
import OverviewTab from '@/components/tabs/OverviewTab';
import BLSeriesTab from '@/components/tabs/BLSeriesTab';
import OngoingTab from '@/components/tabs/OngoingTab';
import FavoritesTab from '@/components/tabs/FavoritesTab';
import Top10Tab from '@/components/tabs/Top10Tab';
import StatisticsTab from '@/components/tabs/StatisticsTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import MilestoneModal from '@/components/MilestoneModal';
import './App.css';

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
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'blseries' && <BLSeriesTab />}
            {activeTab === 'ongoing' && <OngoingTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'top10' && <Top10Tab />}
            {activeTab === 'statistics' && <StatisticsTab onViewProfile={() => setProfileOpen(true)} />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* BL Watcher Profile */}
      <AnimatePresence>
        {profileOpen && (
          <BLWatcherProfile onBack={() => setProfileOpen(false)} />
        )}
      </AnimatePresence>

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
    </AppProvider>
  );
}

export default App;
