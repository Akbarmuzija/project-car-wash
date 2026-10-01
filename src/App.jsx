import React from 'react';
import { CarWashProvider, useCarWash } from './context/CarWashContext';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/CustomerPortal';
import { WelcomerDashboard } from './components/WelcomerDashboard';
import { KasirPOS } from './components/KasirPOS';
import { InventoriDashboard } from './components/InventoriDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';

const MainContent = () => {
  const { activeRole } = useCarWash();
  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', paddingBottom: 60 }}>
      {activeRole === 'pelanggan' && <CustomerPortal />}
      {activeRole === 'welcomer'  && <WelcomerDashboard />}
      {activeRole === 'kasir'     && <KasirPOS />}
      {activeRole === 'inventori' && <InventoriDashboard />}
      {activeRole === 'owner'     && <OwnerDashboard />}
    </main>
  );
};

export function App() {
  return (
    <CarWashProvider>
      <div style={{ minHeight: '100vh', background: '#0D0D0F', color: '#fff' }}>
        <Navbar />
        <MainContent />
      </div>
    </CarWashProvider>
  );
}

export default App;
