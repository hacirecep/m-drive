import React, { useState } from 'react';
import { LogOut, Download, Upload, Settings as SettingsIcon } from 'lucide-react';
import { Car } from '../types';
import { exportToCSV } from '../lib/utils';
import { t } from '../lib/i18n';

interface SettingsProps {
  user: any;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  cars: Car[];
  onLogout: () => Promise<void>;
  onCurrencyChange: (currency: string) => void;
  onLanguageChange: (language: string) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
  onImport: (cars: Car[]) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  user,
  currency,
  language,
  theme,
  cars,
  onLogout,
  onCurrencyChange,
  onLanguageChange,
  onThemeChange,
  onImport,
}) => {
  const lang = language as any;
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    exportToCSV(cars, currency);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const carsData: { [key: string]: Car } = {};

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(';');
        if (cols.length < 7) continue;

        const plaka = cols[0].toUpperCase();
        if (!carsData[plaka]) {
          carsData[plaka] = {
            id: plaka,
            plaka,
            marka: cols[1],
            model: cols[2],
            yil: cols[3],
            km: parseInt(cols[4]) || 0,
            sasi: cols[5],
            durum: (cols[6] as any) || 'green',
            bakimlar: [],
            ownerEmail: user.email,
          };
        }

        // Only add maintenance record if tarih and islem exist
        if (cols[7] && cols[8]) {
          carsData[plaka].bakimlar.push({
            id: '',
            tarih: cols[7],
            islem: cols[8],
            km: 0, // Maintenance KM not exported in CSV
            maliyet: cols[9] || '0',
            not: cols[10] || '',
          });
        }
      }

      await onImport(Object.values(carsData));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {user?.displayName?.[0] || 'M'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.displayName || 'User'}</h2>
            <p className="text-blue-100">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <SettingsIcon size={20} /> {t('preferences', lang)}
        </h3>
        <div className="space-y-3">
          <SettingRow label={t('language', lang)} defaultValue={language} onChange={onLanguageChange}>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </SettingRow>
          <SettingRow label={t('theme', lang)} defaultValue={theme} onChange={onThemeChange}>
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="light">{t('light', lang)}</option>
              <option value="dark">{t('dark', lang)}</option>
              <option value="auto">{t('auto', lang)}</option>
            </select>
          </SettingRow>
          <SettingRow label={t('currency', lang)} defaultValue={currency} onChange={onCurrencyChange}>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="₺">TRY (₺)</option>
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
            </select>
          </SettingRow>
        </div>
      </div>

      {/* Data Management */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('dataManagement', lang)}</h3>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full bg-green-50 border border-green-200 text-green-700 font-bold py-3 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2"
          >
            <Download size={20} /> {t('exportData', lang)}
          </button>
          <label className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 cursor-pointer">
            <Upload size={20} /> {t('importData', lang)}
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* About */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('about', lang)}</h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white">M-Drive Bulut Sistemi</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{t('appDescription', lang)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">{t('version', lang)} 2.0.0 (React)</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('by', lang)} Haci Recep</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full bg-red-50 border border-red-200 text-red-700 font-bold py-3 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
      >
        <LogOut size={20} /> {t('logout', lang)}
      </button>
    </div>
  );
};

interface SettingRowProps {
  label: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
    <span className="font-medium text-gray-900 dark:text-white">{label}</span>
    <div className="w-32">{children}</div>
  </div>
);
