import React from 'react';
import { TrendingDown, Bell, Pencil, Trash2, ChevronLeft, Edit } from 'lucide-react';
import { Car, Maintenance, Alert } from '../types';
import { formatDate } from '../lib/utils';
import { t } from '../lib/i18n';

interface CarDetailProps {
  car: Car;
  currency: string;
  language: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: 'green' | 'yellow' | 'red') => void;
  onAddMaintenance: () => void;
  onEditMaintenance: (idx: number) => void;
  onDeleteMaintenance: (idx: number) => void;
  onUpdateKM: () => void;
  onAddAlert: () => void;
  onEditAlert: (alert: Alert) => void;
  onDeleteAlert: (alertId: string) => void;
  onUpdateNextKm: (km: number) => void;
  onOpenAlerts: () => void;
}

export const CarDetail: React.FC<CarDetailProps> = ({
  car,
  currency,
  language,
  onBack,
  onEdit,
  onDelete,
  onStatusChange,
  onAddMaintenance,
  onEditMaintenance,
  onDeleteMaintenance,
  onUpdateKM,
  onAddAlert,
  onEditAlert,
  onDeleteAlert,
  onUpdateNextKm,
  onOpenAlerts,
}) => {
  const lang = language as any;

  // Safety check in case car is not loaded yet
  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Araç bilgileri yükleniyor...</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  const totalMaintenances = car.bakimlar?.length || 0;
  const totalCost = (car.bakimlar || []).reduce((sum, m) => sum + parseFloat(m.maliyet || '0'), 0);

  return (
    <div className="space-y-6">
      {/* Info Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <Edit size={24} />
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-1">{car.plaka}</h2>
        <p className="text-blue-100 text-lg mb-4">{car.marka} {car.model} {car.yil && `(${car.yil})`}</p>

        {car.sasi && (
          <div className="bg-white/20 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-100 dark:text-blue-200 mb-1">Şasi Numarası</p>
            <p className="font-mono font-bold text-lg text-white">{car.sasi}</p>
          </div>
        )}

        <select
          value={car.durum}
          onChange={(e) => onStatusChange(e.target.value as any)}
          className="w-full px-3 py-2 bg-white/20 dark:bg-gray-700/50 text-white rounded-lg focus:outline-none border border-white/30 dark:border-gray-600 cursor-pointer"
        >
          <option value="green" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Aktif</option>
          <option value="yellow" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Servis</option>
          <option value="red" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Arıza</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label={t('currentKm', lang)} value={car.km.toLocaleString('tr-TR')} subtext="KM" />
        <StatBox label={t('maintenanceCount', lang)} value={totalMaintenances} />

        {/* Uyarılar - tıklanabilir stat kutusu */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-900/30 transition"
          onClick={onOpenAlerts}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('alerts', lang)}</p>
          <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
            {(car.alerts || []).length}
            {(car.alerts || []).length > 0 && (
              <Bell size={13} className="text-yellow-500" />
            )}
          </p>
        </div>

        <StatBox label={t('totalCost', lang)} value={totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} subtext={currency} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onUpdateKM}
          className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 p-3 rounded-xl font-bold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition border border-orange-200 dark:border-orange-800 text-sm"
        >
          ⬆️ {t('updateKm', lang)}
        </button>
        <button
          onClick={onAddMaintenance}
          className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition border border-green-200 dark:border-green-800 text-sm"
        >
          🔧 {t('addMaintenance', lang)}
        </button>
      </div>

      {/* Maintenance History */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('maintenanceHistory', lang)}</h3>
        {(car.bakimlar || []).length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <TrendingDown className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">{t('noRecords', lang)}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...(car.bakimlar || [])]
              .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())
              .map((m, idx) => (
                <MaintenanceCard
                  key={idx}
                  maintenance={m}
                  currency={currency}
                  language={language}
                  onEdit={() => onEditMaintenance(idx)}
                  onDelete={() => onDeleteMaintenance(idx)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatBoxProps {
  label: string;
  value: string | number;
  subtext?: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, subtext }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
    <p className="font-bold text-gray-900 dark:text-white">
      {value}
      {subtext && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{subtext}</span>}
    </p>
  </div>
);

interface MaintenanceCardProps {
  maintenance: Maintenance;
  currency: string;
  language: string;
  onEdit: () => void;
  onDelete: () => void;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ maintenance, currency, language, onEdit }) => {
  const lang = language as any;
  return (
    <div
      onClick={onEdit}
      className="bg-white dark:bg-gray-800 border border-l-4 border-l-blue-600 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-900/30 transition cursor-pointer active:scale-95"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white">{maintenance.islem}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(maintenance.tarih)} • {maintenance.km.toLocaleString('tr-TR')} KM
          </p>
          {maintenance.not && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">"{maintenance.not}"</p>
          )}
          {maintenance.sonraki && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
              {t('nextMaintenanceKm', lang)}: {maintenance.sonraki.toLocaleString('tr-TR')} KM
            </p>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="font-bold text-gray-900 dark:text-white">
            {maintenance.maliyet} {currency}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">›</p>
        </div>
      </div>
    </div>
  );
};
