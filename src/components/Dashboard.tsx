import React from 'react';
import { Car, Wrench, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Car as CarType, DashboardStats } from '../types';
import { t } from '../lib/i18n';

interface DashboardProps {
  stats: DashboardStats;
  cars: CarType[];
  currency: string;
  language: string;
  onDeleteAlert?: (carId: string, alertId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, cars, currency, language, onDeleteAlert }) => {
  const lang = language as any;
  const totalCost = cars.reduce(
    (sum, car) => sum + (car.bakimlar || []).reduce((s, m) => s + parseFloat(m.maliyet || '0'), 0),
    0
  );

  const statusCounts = {
    green: cars.filter((c) => c.durum === 'green').length,
    yellow: cars.filter((c) => c.durum === 'yellow').length,
    red: cars.filter((c) => c.durum === 'red').length,
  };

  // Calculate active alerts
  const allAlerts = cars.flatMap((car) => (car.alerts || []).map((alert) => ({ ...alert, carData: car })));

  const activeAlerts = allAlerts.filter((alert) => {
    if (alert.tip === 'tarih') {
      const endDate = new Date(alert.bitiseTarihi || '');
      const daysUntil = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= (alert.oncesindanGun || 0) && daysUntil > 0;
    } else {
      const carKm = cars.find((c) => c.id === alert.carId)?.km || 0;
      return carKm + (alert.oncesindanKm || 0) >= alert.bitisKm;
    }
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<Car className="w-6 h-6" />}
          label={t('totalCars', lang)}
          value={stats.totalCars}
          color="blue"
        />
        <StatCard
          icon={<Wrench className="w-6 h-6" />}
          label={t('maintenanceCount', lang)}
          value={stats.totalMaintenances}
          color="orange"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label={t('totalCost', lang)}
          value={`${totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
          subtext={currency}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label={t('avgKm', lang)}
          value={`${Math.round(stats.averageKm).toLocaleString('tr-TR')}`}
          subtext="KM"
          color="purple"
        />
      </div>

      {/* Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('carStatus', lang)}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700 dark:text-gray-300">{t('active', lang)}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{statusCounts.green}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-700 dark:text-gray-300">{t('service', lang)}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{statusCounts.yellow}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700 dark:text-gray-300">{t('broken', lang)}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{statusCounts.red}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      {stats.upcomingMaintenances.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('upcomingMaintenance', lang)}</h3>
          <div className="space-y-2">
            {stats.upcomingMaintenances.slice(0, 5).map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{m.islem}</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{m.sonraki?.toLocaleString()} KM</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-yellow-200 dark:border-yellow-900">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">{t('alerts', lang)}</h3>
          </div>
          <div className="space-y-2">
            {activeAlerts.slice(0, 5).map((alert, idx) => (
              <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{alert.baslik}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{alert.carData.plaka}</p>
                {alert.not && <p className="text-xs text-gray-600 dark:text-gray-400 italic">{alert.not}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="font-bold text-gray-900 dark:text-white text-lg">
        {value}
        {subtext && <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{subtext}</span>}
      </p>
    </div>
  );
};
