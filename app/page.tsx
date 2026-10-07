'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { OverviewTab } from '../components/dashboard/OverviewTab';
import { PropertiesTab } from '../components/properties/PropertiesTab';
import { RentalsTab } from '../components/rentals/RentalsTab';
import { PaymentsTab } from '../components/payments/PaymentsTab';
import { MaintenanceTab } from '../components/maintenance/MaintenanceTab';
import { AuthModal } from '../components/common/AuthModal';
import { AlertBanner } from '../components/common/AlertBanner';
import {
  ViewTab,
  Property,
  Rental,
  Payment,
  MaintenanceRequest,
  User,
  PropertyInput,
  RentalInput,
  PaymentInput,
  MaintenanceRequestInput,
} from '../lib/types';
import {
  propertiesApi,
  rentalsApi,
  paymentsApi,
  maintenanceApi,
  authApi,
  getMockMode,
  setMockMode,
  getToken,
  setToken,
} from '../lib/api';
import { PropertyFormModal } from '../components/properties/PropertyFormModal';
import { PaymentFormModal } from '../components/payments/PaymentFormModal';
import { MaintenanceFormModal } from '../components/maintenance/MaintenanceFormModal';

export default function RentalDashboardPage() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [useMock, setUseMock] = useState(() => getMockMode());
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Core Datasets State
  const [properties, setProperties] = useState<Property[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isSubmitMaintenanceModalOpen, setIsSubmitMaintenanceModalOpen] = useState(false);

  // Primary Data Fetcher
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [propsRes, rentalsRes, paymentsRes, maintenanceRes] = await Promise.all([
        propertiesApi.list(),
        rentalsApi.list(),
        paymentsApi.list(),
        maintenanceApi.list(),
      ]);

      setProperties(propsRes);
      setRentals(rentalsRes);
      setPayments(paymentsRes);
      setMaintenance(maintenanceRes);

      if (getToken() || getMockMode()) {
        try {
          const userRes = await authApi.getMe();
          setUser(userRes);
        } catch {
          // Ignore profile error if unauthenticated
        }
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to sync with backend API endpoints.';
      setApiError(errMsg);
      if (!getMockMode()) {
        setApiError(
          `${errMsg} (Tip: Toggle to Demo Mode or connect API JWT credentials using the top right button.)`
        );
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchInitial = async () => {
      await loadDashboardData();
    };
    if (!ignore) {
      fetchInitial();
    }
    return () => {
      ignore = true;
    };
  }, [loadDashboardData, useMock]);

  // Mode Toggle Handler
  const handleToggleMock = () => {
    const nextMockState = !useMock;
    setMockMode(nextMockState);
    setUseMock(nextMockState);
    setApiSuccess(
      nextMockState
        ? 'Switched to Interactive Demo Mode (Mock API Data).'
        : 'Switched to Live DRF API Mode (https://rent-api-xjs4.onrender.com/).'
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setApiSuccess('Logged out successfully.');
    loadDashboardData();
  };

  // Property Handlers
  const handleCreateProperty = async (data: PropertyInput) => {
    try {
      const newProp = await propertiesApi.create(data);
      setProperties((prev) => [newProp, ...prev]);
      setApiSuccess(`Property "${newProp.title}" created successfully!`);
    } catch (err: any) {
      setApiError(`Failed to create property: ${err.message}`);
    }
  };

  const handleUpdateProperty = async (id: number, data: Partial<PropertyInput>) => {
    try {
      const updated = await propertiesApi.update(id, data);
      setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setApiSuccess(`Property #${id} updated successfully!`);
    } catch (err: any) {
      setApiError(`Failed to update property #${id}: ${err.message}`);
    }
  };

  const handleDeleteProperty = async (id: number) => {
    try {
      await propertiesApi.delete(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setApiSuccess(`Property #${id} deleted.`);
    } catch (err: any) {
      setApiError(`Failed to delete property #${id}: ${err.message}`);
    }
  };

  // Rental Handlers
  const handleCreateRental = async (data: RentalInput) => {
    try {
      const newRental = await rentalsApi.create(data);
      setRentals((prev) => [newRental, ...prev]);
      setApiSuccess(`Lease contract #${newRental.id} created!`);
    } catch (err: any) {
      setApiError(`Failed to create rental contract: ${err.message}`);
    }
  };

  const handleUpdateRental = async (id: number, data: Partial<RentalInput>) => {
    try {
      const updated = await rentalsApi.update(id, data);
      setRentals((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setApiSuccess(`Lease contract #${id} updated!`);
    } catch (err: any) {
      setApiError(`Failed to update lease contract #${id}: ${err.message}`);
    }
  };

  const handleDeleteRental = async (id: number) => {
    try {
      await rentalsApi.delete(id);
      setRentals((prev) => prev.filter((r) => r.id !== id));
      setApiSuccess(`Lease contract #${id} deleted.`);
    } catch (err: any) {
      setApiError(`Failed to delete lease contract #${id}: ${err.message}`);
    }
  };

  // Payment Handlers
  const handleCreatePayment = async (data: PaymentInput) => {
    try {
      const newPay = await paymentsApi.create(data);
      setPayments((prev) => [newPay, ...prev]);
      setApiSuccess(`Payment transaction #${newPay.id} recorded!`);
    } catch (err: any) {
      setApiError(`Failed to record payment: ${err.message}`);
    }
  };

  const handleUpdatePayment = async (id: number, data: Partial<PaymentInput>) => {
    try {
      const updated = await paymentsApi.update(id, data);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setApiSuccess(`Payment record #${id} updated!`);
    } catch (err: any) {
      setApiError(`Failed to update payment #${id}: ${err.message}`);
    }
  };

  const handleDeletePayment = async (id: number) => {
    try {
      await paymentsApi.delete(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      setApiSuccess(`Payment record #${id} deleted.`);
    } catch (err: any) {
      setApiError(`Failed to delete payment #${id}: ${err.message}`);
    }
  };

  // Maintenance Handlers
  const handleCreateMaintenance = async (data: MaintenanceRequestInput) => {
    try {
      const newTicket = await maintenanceApi.create(data);
      setMaintenance((prev) => [newTicket, ...prev]);
      setApiSuccess(`Maintenance ticket #${newTicket.id} submitted!`);
    } catch (err: any) {
      setApiError(`Failed to submit maintenance request: ${err.message}`);
    }
  };

  const handleUpdateMaintenance = async (
    id: number,
    data: Partial<MaintenanceRequestInput>
  ) => {
    try {
      const updated = await maintenanceApi.update(id, data);
      setMaintenance((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setApiSuccess(`Maintenance ticket #${id} updated!`);
    } catch (err: any) {
      setApiError(`Failed to update maintenance ticket #${id}: ${err.message}`);
    }
  };

  const handleDeleteMaintenance = async (id: number) => {
    try {
      await maintenanceApi.delete(id);
      setMaintenance((prev) => prev.filter((m) => m.id !== id));
      setApiSuccess(`Maintenance ticket #${id} deleted.`);
    } catch (err: any) {
      setApiError(`Failed to delete maintenance ticket #${id}: ${err.message}`);
    }
  };

  const openMaintenanceCount = maintenance.filter(
    (m) => m.status === 'pending' || m.status === 'in_progress'
  ).length;

  const pendingRentalsCount = rentals.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setSearchQuery('');
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        stats={{
          openMaintenance: openMaintenanceCount,
          pendingRentals: pendingRentalsCount,
        }}
      />

      {/* Main Right Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          currentTab={currentTab}
          useMock={useMock}
          onToggleMock={handleToggleMock}
          onRefreshData={handleRefresh}
          isRefreshing={isRefreshing}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {apiError && (
            <AlertBanner
              type="error"
              message={apiError}
              onDismiss={() => setApiError(null)}
              className="mb-4"
            />
          )}

          {apiSuccess && (
            <AlertBanner
              type="success"
              message={apiSuccess}
              onDismiss={() => setApiSuccess(null)}
              className="mb-4"
            />
          )}

          {currentTab === 'overview' && (
            <OverviewTab
              properties={properties}
              rentals={rentals}
              payments={payments}
              maintenance={maintenance}
              onNavigate={setCurrentTab}
              onOpenAddProperty={() => setIsAddPropertyModalOpen(true)}
              onOpenRecordPayment={() => setIsRecordPaymentModalOpen(true)}
              onOpenSubmitMaintenance={() => setIsSubmitMaintenanceModalOpen(true)}
            />
          )}

          {currentTab === 'properties' && (
            <PropertiesTab
              properties={properties}
              rentals={rentals}
              maintenance={maintenance}
              loading={loading}
              onCreateProperty={handleCreateProperty}
              onUpdateProperty={handleUpdateProperty}
              onDeleteProperty={handleDeleteProperty}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'rentals' && (
            <RentalsTab
              rentals={rentals}
              properties={properties}
              loading={loading}
              onCreateRental={handleCreateRental}
              onUpdateRental={handleUpdateRental}
              onDeleteRental={handleDeleteRental}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsTab
              payments={payments}
              rentals={rentals}
              loading={loading}
              onCreatePayment={handleCreatePayment}
              onUpdatePayment={handleUpdatePayment}
              onDeletePayment={handleDeletePayment}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'maintenance' && (
            <MaintenanceTab
              maintenance={maintenance}
              rentals={rentals}
              loading={loading}
              onCreateMaintenance={handleCreateMaintenance}
              onUpdateMaintenance={handleUpdateMaintenance}
              onDeleteMaintenance={handleDeleteMaintenance}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {/* Global Quick Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          setApiSuccess(`Authenticated as ${u.username}`);
          loadDashboardData();
        }}
      />

      <PropertyFormModal
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateProperty(data);
        }}
        editingProperty={null}
      />

      <PaymentFormModal
        isOpen={isRecordPaymentModalOpen}
        onClose={() => setIsRecordPaymentModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreatePayment(data);
        }}
        editingPayment={null}
        rentals={rentals}
      />

      <MaintenanceFormModal
        isOpen={isSubmitMaintenanceModalOpen}
        onClose={() => setIsSubmitMaintenanceModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateMaintenance(data);
        }}
        editingTicket={null}
        rentals={rentals}
      />
    </div>
  );
}
