import React, { useState, useEffect } from 'react';
import { Home, Settings as SettingsIcon, Car, ChevronLeft, Edit } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useCars } from './hooks/useCars';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { CarList } from './components/CarList';
import { CarDetail } from './components/CarDetail';
import { Settings } from './components/Settings';
import {
  CarModal,
  MaintenanceModal,
  UpdateKMModal,
  DeleteConfirmModal,
  AlertModal,
} from './components/Modals';
import { calculateDashboardStats, formatCurrency } from './lib/utils';
import { firebaseService } from './lib/firebase';
import { getDefaultLanguage, t } from './lib/i18n';
import { Car as CarType } from './types';

type AppPage = 'home' | 'cars' | 'detail' | 'alerts' | 'settings';
type ModalType = 'car' | 'maintenance' | 'updateKM' | 'deleteCarConfirm' | 'deleteMaintenanceConfirm' | 'alert';

function App() {
  const { user, loading: authLoading, register, login, logout, resetPassword } = useAuth();
  const { cars, loading: carsLoading, addCar, updateCar, deleteCar } = useCars(user?.email || null, user?.uid || null);

  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [openModals, setOpenModals] = useState<Record<ModalType, boolean>>({
    car: false,
    maintenance: false,
    updateKM: false,
    deleteCarConfirm: false,
    deleteMaintenanceConfirm: false,
    alert: false,
  });

  const [currency, setCurrency] = useState(() => localStorage.getItem('minicar_currency') || '₺');
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('minicar_language');
    return saved || getDefaultLanguage();
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => (localStorage.getItem('minicar_theme') as any) || 'auto');

  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  const [editingMaintenanceIdx, setEditingMaintenanceIdx] = useState<number | null>(null);
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const [deleteConfirmData, setDeleteConfirmData] = useState<{ type: 'car' | 'maintenance'; id?: string } | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedCar = selectedCarId ? cars.find((c) => c.id === selectedCarId) : null;
  const stats = calculateDashboardStats(cars);

  useEffect(() => {
    localStorage.setItem('minicar_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('minicar_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('minicar_theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      const actualTheme = theme === 'auto' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
      document.documentElement.classList.toggle('dark', actualTheme === 'dark');
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  const lang = language as any;

  const showToastMessage = (messageKey: string, type: 'success' | 'error' = 'success') => {
    const message = t(messageKey as any, lang);
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleAddCar = async (formData: any) => {
    try {
      await addCar({
        ...formData,
        km: parseInt(formData.km),
        ownerEmail: user?.email || '',
      });
      showToastMessage('carAdded');
      closeModal('car');
    } catch (err: any) {
      showToastMessage('carDeleteFailed', 'error');
    }
  };

  const handleEditCar = async (formData: any) => {
    if (!editingCar) return;
    try {
      await updateCar(editingCar.id, {
        ...formData,
        km: parseInt(formData.km),
      });
      showToastMessage('carUpdated');
      closeModal('car');
      setEditingCar(null);
    } catch (err: any) {
      showToastMessage('carDeleteFailed', 'error');
    }
  };

  const handleAddMaintenance = async (formData: any) => {
    if (!selectedCar) return;
    try {
      const maintenance: any = {
        id: Date.now().toString(),
        tarih: formData.tarih,
        islem: formData.islem,
        km: parseInt(formData.km),
        maliyet: formData.maliyet,
        not: formData.not || '',
      };

      if (formData.sonraki) {
        maintenance.sonraki = parseInt(formData.sonraki);
      }

      if (editingMaintenanceIdx !== null) {
        const updatedBakimlar = [...(selectedCar.bakimlar || [])];
        updatedBakimlar[editingMaintenanceIdx] = maintenance;
        await updateCar(selectedCar.id, { bakimlar: updatedBakimlar });
        showToastMessage('maintenanceUpdated');
      } else {
        await firebaseService.addMaintenance(user?.email || '', selectedCar.id, maintenance);
        showToastMessage('maintenanceAdded');
      }

      closeModal('maintenance');
      setEditingMaintenanceIdx(null);
    } catch (err: any) {
      console.error('Bakım ekleme hatası:', err);
      showToastMessage('maintenanceDeleteFailed', 'error');
    }
  };

  const handleUpdateKM = async (newKM: number) => {
    if (!selectedCar) return;
    try {
      await updateCar(selectedCar.id, { km: newKM });
      showToastMessage('kmUpdated');
      closeModal('updateKM');
    } catch (err: any) {
      showToastMessage('kmUpdateFailed', 'error');
    }
  };

  const handleDeleteCar = async () => {
    if (!selectedCar) return;
    try {
      await deleteCar(selectedCar.id);
      showToastMessage('carDeleted');
      // Go back to cars list instead of home
      setCurrentPage('cars');
      setSelectedCarId(null);
      closeModal('deleteCarConfirm');
    } catch (err: any) {
      showToastMessage('carDeleteFailed', 'error');
    }
  };

  const handleDeleteMaintenance = async () => {
    if (!selectedCar || editingMaintenanceIdx === null) return;
    try {
      const updatedBakimlar = (selectedCar.bakimlar || []).filter((_, i) => i !== editingMaintenanceIdx);
      await updateCar(selectedCar.id, { bakimlar: updatedBakimlar });
      showToastMessage('maintenanceDeleted');
      closeModal('deleteMaintenanceConfirm');
      setEditingMaintenanceIdx(null);
    } catch (err: any) {
      showToastMessage('maintenanceDeleteFailed', 'error');
    }
  };

  const handleAddAlert = async (formData: any) => {
    if (!selectedCar) return;
    try {
      const alert: any = {
        id: Date.now().toString(),
        carId: selectedCar.id,
        plaka: selectedCar.plaka,
        baslik: formData.baslik,
        not: formData.not,
        tip: formData.tip,
      };

      // Sadece ilgili alanları ekle - undefined değerleri hariç tut
      if (formData.tip === 'tarih') {
        alert.bitiseTarihi = formData.bitiseTarihi;
        alert.oncesindanGun = formData.oncesindanGun;
      } else {
        alert.bitisKm = formData.bitisKm;
        alert.oncesindanKm = formData.oncesindanKm;
      }

      const updatedAlerts = [...(selectedCar.alerts || []), alert];
      await updateCar(selectedCar.id, { alerts: updatedAlerts });
      showToastMessage('alertAdded');
      closeModal('alert');
    } catch (err: any) {
      showToastMessage('error', 'error');
    }
  };

  const handleDeleteAlert = async (carId: string, alertId: string) => {
    const car = cars.find((c) => c.id === carId);
    if (!car) return;
    try {
      const updatedAlerts = (car.alerts || []).filter((a) => a.id !== alertId);
      await updateCar(carId, { alerts: updatedAlerts });
      showToastMessage('alertDeleted');
    } catch (err: any) {
      showToastMessage('error', 'error');
    }
  };

  const handleDeleteAlertInCar = async (alertId: string) => {
    if (!selectedCar) return;
    try {
      const updatedAlerts = (selectedCar.alerts || []).filter((a) => a.id !== alertId);
      await updateCar(selectedCar.id, { alerts: updatedAlerts });
      showToastMessage('alertDeleted');
    } catch (err: any) {
      showToastMessage('error', 'error');
    }
  };

  const handleSaveAlert = async (formData: any) => {
    if (!selectedCar) return;
    try {
      if (editingAlert) {
        // Düzenleme: mevcut uyarıyı güncelle
        const updatedAlerts = (selectedCar.alerts || []).map((a) =>
          a.id === editingAlert.id
            ? { ...editingAlert, ...formData, id: editingAlert.id }
            : a
        );
        await updateCar(selectedCar.id, { alerts: updatedAlerts });
        showToastMessage('alertAdded');
      } else {
        // Yeni uyarı ekle
        const alert: any = {
          id: Date.now().toString(),
          carId: selectedCar.id,
          plaka: selectedCar.plaka,
          baslik: formData.baslik,
          not: formData.not,
          tip: formData.tip,
        };
        if (formData.tip === 'tarih') {
          alert.bitiseTarihi = formData.bitiseTarihi;
          alert.oncesindanGun = formData.oncesindanGun;
        } else {
          alert.bitisKm = formData.bitisKm;
          alert.oncesindanKm = formData.oncesindanKm;
        }
        const updatedAlerts = [...(selectedCar.alerts || []), alert];
        await updateCar(selectedCar.id, { alerts: updatedAlerts });
        showToastMessage('alertAdded');
      }
      setEditingAlert(null);
      closeModal('alert');
    } catch (err: any) {
      showToastMessage('error', 'error');
    }
  };

  const handleUpdateNextKm = async (km: number) => {
    if (!selectedCar) return;
    try {
      await updateCar(selectedCar.id, { nextKm: km });
      showToastMessage('kmUpdated');
    } catch (err: any) {
      showToastMessage('kmUpdateFailed', 'error');
    }
  };

  const openModal = (modalType: ModalType) => {
    setOpenModals(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType: ModalType) => {
    setOpenModals(prev => ({ ...prev, [modalType]: false }));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  if (!user) {
    return <Auth language={language} onLogin={login} onRegister={register} onResetPassword={resetPassword} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(currentPage === 'detail' || currentPage === 'alerts') && (
              <button
                onClick={() => setCurrentPage(currentPage === 'alerts' ? 'detail' : 'cars')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentPage === 'detail' && selectedCar
                ? selectedCar.plaka
                : currentPage === 'alerts'
                ? t('alerts', lang)
                : 'M-Drive'}
            </h1>
          </div>
          {currentPage === 'detail' && selectedCar && (
            <button
              onClick={() => {
                setEditingCar(selectedCar);
                openModal('car');
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <Edit size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {carsLoading ? (
          <div className="text-center py-12">⏳ {t('saving', lang).replace('...', '')}</div>
        ) : currentPage === 'home' ? (
          <>
            <Dashboard stats={stats} cars={cars} currency={currency} language={language} onDeleteAlert={handleDeleteAlert} />
          </>
        ) : currentPage === 'cars' ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('cars', lang)}</h2>
            <CarList
              cars={cars}
              language={language}
              onSelectCar={(carId) => {
                setSelectedCarId(carId);
                setCurrentPage('detail');
              }}
              onAddCar={() => {
                setEditingCar(null);
                openModal('car');
              }}
            />
          </>
        ) : currentPage === 'detail' ? (
          selectedCar ? (
            <CarDetail
              car={selectedCar}
              currency={currency}
              language={language}
              onBack={() => {
                setCurrentPage('home');
                setSelectedCarId(null);
              }}
              onEdit={() => {
                setEditingCar(selectedCar);
                openModal('car');
              }}
              onDelete={() => {
                setDeleteConfirmData({ type: 'car' });
                openModal('deleteCarConfirm');
              }}
              onStatusChange={async (status) => {
                await updateCar(selectedCar.id, { durum: status });
              }}
              onAddMaintenance={() => {
                setEditingMaintenanceIdx(null);
                openModal('maintenance');
              }}
              onEditMaintenance={(idx) => {
                setEditingMaintenanceIdx(idx);
                openModal('maintenance');
              }}
              onDeleteMaintenance={(idx) => {
                setEditingMaintenanceIdx(idx);
                setDeleteConfirmData({ type: 'maintenance' });
              }}
              onUpdateKM={() => openModal('updateKM')}
              onAddAlert={() => {
                setEditingAlert(null);
                openModal('alert');
              }}
              onEditAlert={(alert) => {
                setEditingAlert(alert);
                openModal('alert');
              }}
              onDeleteAlert={handleDeleteAlertInCar}
              onUpdateNextKm={handleUpdateNextKm}
              onOpenAlerts={() => setCurrentPage('alerts')}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">Araç yükleniyor...</p>
            </div>
          )
        ) : currentPage === 'alerts' ? (
          selectedCar ? (
            <div className="space-y-3 pb-24">
              {/* Uyarı listesi */}
              {(selectedCar.alerts || []).length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-5xl mb-3">🔔</p>
                  <p className="text-gray-600 font-medium">{t('noAlerts', lang)}</p>
                </div>
              ) : (
                (selectedCar.alerts || []).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => { setEditingAlert(alert); openModal('alert'); }}
                    className="bg-yellow-50 border border-yellow-200 border-l-4 border-l-yellow-400 rounded-xl p-4 cursor-pointer hover:bg-yellow-100 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{alert.baslik}</p>
                        {alert.tip === 'tarih' && alert.bitiseTarihi && (
                          <p className="text-sm text-gray-600 mt-1">
                            📅 {new Date(alert.bitiseTarihi).toLocaleDateString('tr-TR')}
                            {alert.oncesindanGun && ` · ${alert.oncesindanGun} gün öncesinde uyar`}
                          </p>
                        )}
                        {alert.tip === 'km' && alert.bitisKm && (
                          <p className="text-sm text-gray-600 mt-1">
                            🛣️ {alert.bitisKm.toLocaleString('tr-TR')} KM
                            {alert.oncesindanKm && ` · ${alert.oncesindanKm.toLocaleString('tr-TR')} KM öncesinde uyar`}
                          </p>
                        )}
                        {alert.not && <p className="text-sm text-gray-500 mt-1 italic">"{alert.not}"</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* FAB - Uyarı Ekle */}
              <button
                onClick={() => { setEditingAlert(null); openModal('alert'); }}
                className="fixed bottom-24 right-6 w-14 h-14 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition z-30"
                title={t('addAlert', lang)}
              >
                +
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">Araç yükleniyor...</p>
            </div>
          )
        ) : currentPage === 'settings' ? (
          <Settings
            user={user}
            currency={currency}
            language={language}
            theme={theme}
            cars={cars}
            onLogout={logout}
            onCurrencyChange={setCurrency}
            onLanguageChange={setLanguage}
            onThemeChange={setTheme}
            onImport={async (importedCars) => {
              for (const importedCar of importedCars) {
                // Find if car with same plate already exists
                const existingCar = cars.find(c => c.plaka === importedCar.plaka);
                
                if (existingCar) {
                  // Merge maintenance and alerts data
                  const mergedBakimlar = [...(existingCar.bakimlar || []), ...(importedCar.bakimlar || [])];
                  const mergedAlerts = [...(existingCar.alerts || []), ...(importedCar.alerts || [])];
                  
                  // Remove duplicates by id
                  const uniqueBakimlar = Array.from(
                    new Map(mergedBakimlar.map(b => [b.id || b.tarih + b.islem, b])).values()
                  );
                  const uniqueAlerts = Array.from(
                    new Map(mergedAlerts.map(a => [a.id, a])).values()
                  );
                  
                  await updateCar(existingCar.id, {
                    bakimlar: uniqueBakimlar,
                    alerts: uniqueAlerts
                  });
                } else {
                  // Add new car
                  await addCar(importedCar);
                }
              }
              showToastMessage('dataImported');
            }}
          />
        ) : null}
      </div>

      {/* Modals */}
      <CarModal
        isOpen={openModals.car}
        onClose={() => {
          closeModal('car');
          setEditingCar(null);
        }}
        car={editingCar || undefined}
        language={language}
        onSubmit={editingCar ? handleEditCar : handleAddCar}
        onDelete={editingCar ? () => {
          setDeleteConfirmData({ type: 'car' });
          openModal('deleteCarConfirm');
        } : undefined}
      />

      <MaintenanceModal
        isOpen={openModals.maintenance}
        onClose={() => {
          closeModal('maintenance');
          setEditingMaintenanceIdx(null);
        }}
        maintenance={editingMaintenanceIdx !== null && selectedCar ? selectedCar.bakimlar[editingMaintenanceIdx] : undefined}
        currentKM={selectedCar?.km || 0}
        language={language}
        onSubmit={handleAddMaintenance}
        onDelete={editingMaintenanceIdx !== null ? () => {
          setDeleteConfirmData({ type: 'maintenance' });
          openModal('deleteMaintenanceConfirm');
        } : undefined}
      />

      <UpdateKMModal
        isOpen={openModals.updateKM}
        onClose={() => closeModal('updateKM')}
        currentKM={selectedCar?.km || 0}
        language={language}
        onSubmit={handleUpdateKM}
      />

      {selectedCar && (
        <AlertModal
          isOpen={openModals.alert}
          onClose={() => {
            setEditingAlert(null);
            closeModal('alert');
          }}
          carId={selectedCar.id}
          plaka={selectedCar.plaka}
          language={language}
          editingAlert={editingAlert}
          onSubmit={handleSaveAlert}
          onDelete={editingAlert ? async () => {
            if (!editingAlert?.id) return;
            try {
              const updatedAlerts = (selectedCar.alerts || []).filter((a) => a.id !== editingAlert.id);
              await updateCar(selectedCar.id, { alerts: updatedAlerts });
              showToastMessage('alertDeleted');
              closeModal('alert');
              setEditingAlert(null);
            } catch (err: any) {
              showToastMessage('error', 'error');
            }
          } : undefined}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteConfirmData?.type === 'car' && openModals.deleteCarConfirm}
        onClose={() => {
          setDeleteConfirmData(null);
          closeModal('deleteCarConfirm');
        }}
        onConfirm={handleDeleteCar}
        language={language}
        title={t('deleteCar', lang)}
        message={`${selectedCar?.plaka} ${t('deleteCarDescription', lang)}`}
        confirmPlate={selectedCar?.plaka}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmData?.type === 'maintenance'}
        onClose={() => {
          setDeleteConfirmData(null);
          closeModal('deleteMaintenanceConfirm');
        }}
        onConfirm={handleDeleteMaintenance}
        language={language}
        title={t('deleteMaintenance', lang)}
        message={t('deleteMaintainanceDescription', lang)}
      />

      {/* Toast */}
      {showToast && (
        <div
          className={`fixed bottom-24 left-4 right-4 max-w-sm mx-auto px-4 py-3 rounded-lg text-white font-bold animate-slide-up ${
            showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {showToast.message}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-md mx-auto px-4 flex items-center justify-around">
          <button
            onClick={() => {
              setCurrentPage('home');
              setSelectedCarId(null);
            }}
            className={`flex-1 py-4 text-center font-bold transition ${
              currentPage === 'home'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Home size={24} className="mx-auto mb-1" />
            <span className="text-xs">{t('dashboard', lang)}</span>
          </button>
          <button
            onClick={() => {
              setCurrentPage('cars');
              setSelectedCarId(null);
            }}
            className={`flex-1 py-4 text-center font-bold transition ${
              currentPage === 'cars'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Car size={24} className="mx-auto mb-1" />
            <span className="text-xs">{t('cars', lang)}</span>
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`flex-1 py-4 text-center font-bold transition ${
              currentPage === 'settings'
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            <SettingsIcon size={24} className="mx-auto mb-1" />
            <span className="text-xs">{t('settings', lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
