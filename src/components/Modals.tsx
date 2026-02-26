import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Car, Maintenance } from '../types';
import { t } from '../lib/i18n';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CarModalProps extends ModalProps {
  car?: Car;
  language?: string;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: () => void;
}

interface MaintenanceModalProps extends ModalProps {
  maintenance?: Maintenance;
  language?: string;
  currentKM: number;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: () => void;
}

export const CarModal: React.FC<CarModalProps> = ({ isOpen, onClose, car, language, onSubmit, onDelete }) => {
  const lang = language as any;
  const [formData, setFormData] = useState({
    plaka: '',
    marka: '',
    model: '',
    yil: '',
    km: '',
    sasi: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (car) {
      setFormData({
        plaka: car.plaka,
        marka: car.marka,
        model: car.model,
        yil: car.yil || '',
        km: car.km.toString(),
        sasi: car.sasi || '',
      });
    } else {
      setFormData({
        plaka: '',
        marka: '',
        model: '',
        yil: '',
        km: '',
        sasi: '',
      });
    }
    setError('');
  }, [car, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="w-full max-w-[840px] bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {car ? t('editCar', lang) : t('addNewCar', lang)}
          </h2>
          {car && onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
            >
              <Trash2 size={22} />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('plateExample', lang)}
            value={formData.plaka}
            onChange={(e) => setFormData({ ...formData, plaka: e.target.value.toUpperCase() })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="text"
            placeholder={t('brand', lang)}
            value={formData.marka}
            onChange={(e) => setFormData({ ...formData, marka: e.target.value.toUpperCase() })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="text"
            placeholder={t('model', lang)}
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value.toUpperCase() })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder={t('year', lang)}
              value={formData.yil}
              onChange={(e) => setFormData({ ...formData, yil: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="number"
              placeholder={t('km', lang)}
              value={formData.km}
              onChange={(e) => setFormData({ ...formData, km: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <input
            type="text"
            placeholder={t('chassis', lang)}
            value={formData.sasi}
            onChange={(e) => setFormData({ ...formData, sasi: e.target.value.toUpperCase() })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? t('saving', lang) : car ? t('update', lang) : t('add', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  maintenance,
  language,
  currentKM,
  onSubmit,
  onDelete,
}) => {
  const lang = language as any;
  const [formData, setFormData] = useState({
    tarih: '',
    islem: '',
    km: '',
    maliyet: '',
    sonraki: '',
    not: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (maintenance) {
      setFormData({
        tarih: maintenance.tarih,
        islem: maintenance.islem,
        km: maintenance.km.toString(),
        maliyet: maintenance.maliyet,
        sonraki: maintenance.sonraki?.toString() || '',
        not: maintenance.not || '',
      });
    } else {
      setFormData({
        tarih: new Date().toISOString().split('T')[0],
        islem: '',
        km: currentKM.toString(),
        maliyet: '',
        sonraki: '',
        not: '',
      });
    }
    setError('');
  }, [maintenance, currentKM, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="w-full max-w-[840px] bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {maintenance ? t('maintenanceDetail', lang) : t('addMaintenance', lang)}
          </h2>
          {maintenance && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
            >
              <Trash2 size={22} />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="date"
            value={formData.tarih}
            onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder={t('operation', lang)}
            value={formData.islem}
            onChange={(e) => setFormData({ ...formData, islem: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder={t('maintenanceKm', lang)}
              value={formData.km}
              onChange={(e) => setFormData({ ...formData, km: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="number"
              placeholder={t('cost', lang)}
              value={formData.maliyet}
              onChange={(e) => setFormData({ ...formData, maliyet: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <textarea
            placeholder={t('notePlaceholder', lang)}
            value={formData.not}
            onChange={(e) => setFormData({ ...formData, not: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? t('saving', lang) : maintenance ? t('update', lang) : t('add', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface UpdateKMModalProps extends ModalProps {
  currentKM: number;
  language?: string;
  onSubmit: (km: number) => Promise<void>;
}

export const UpdateKMModal: React.FC<UpdateKMModalProps> = ({
  isOpen,
  onClose,
  currentKM,
  language,
  onSubmit,
}) => {
  const lang = language as any;
  const [newKM, setNewKM] = useState(currentKM.toString());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewKM(currentKM.toString());
  }, [currentKM, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(parseInt(newKM));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-[840px]">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('updateKm', lang)}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">{t('currentKm', lang)}: {currentKM.toLocaleString('tr-TR')}</label>
            <input
              type="number"
              value={newKM}
              onChange={(e) => setNewKM(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? t('updating', lang) : t('update', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmPlate?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  language,
  onConfirm,
  title,
  message,
  confirmPlate,
}) => {
  const lang = language as any;
  const [loading, setLoading] = useState(false);
  const [plateInput, setPlateInput] = useState('');

  const isConfirmed = confirmPlate ? plateInput.trim().toUpperCase() === confirmPlate.trim().toUpperCase() : true;

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await onConfirm();
      onClose();
      setPlateInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPlateInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-[840px]">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>

          {confirmPlate && (
            <input
              type="text"
              placeholder={confirmPlate}
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-red-400 text-center font-bold text-lg mb-4 tracking-widest bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
            >
              {t('cancel', lang)}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !isConfirmed}
              className="flex-1 bg-red-600 dark:bg-red-700 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 dark:hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? t('deleting', lang) : t('delete', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AlertModalProps extends ModalProps {
  carId: string;
  plaka: string;
  language?: string;
  editingAlert?: any;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, carId, plaka, language, editingAlert, onSubmit, onDelete }) => {
  const lang = language as any;
  const [formData, setFormData] = useState({
    baslik: '',
    not: '',
    tip: 'tarih' as 'tarih' | 'km',
    bitiseTarihi: new Date().toISOString().split('T')[0],
    oncesindanGun: '7',
    bitisKm: '',
    oncesindanKm: '',
  });

  useEffect(() => {
    if (editingAlert) {
      setFormData({
        baslik: editingAlert.baslik || '',
        not: editingAlert.not || '',
        tip: editingAlert.tip || 'tarih',
        bitiseTarihi: editingAlert.bitiseTarihi || new Date().toISOString().split('T')[0],
        oncesindanGun: editingAlert.oncesindanGun?.toString() || '7',
        bitisKm: editingAlert.bitisKm?.toString() || '',
        oncesindanKm: editingAlert.oncesindanKm?.toString() || '',
      });
    } else {
      setFormData({
        baslik: '',
        not: '',
        tip: 'tarih',
        bitiseTarihi: new Date().toISOString().split('T')[0],
        oncesindanGun: '7',
        bitisKm: '',
        oncesindanKm: '',
      });
    }
  }, [editingAlert, isOpen]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.baslik.trim()) {
      setError('Başlık gerekli');
      return;
    }

    if (formData.tip === 'tarih') {
      if (!formData.bitiseTarihi) {
        setError(t('alertNoEndDate', lang));
        return;
      }
      const gunVal = parseInt(formData.oncesindanGun) || 0;
      if (!gunVal || gunVal <= 0) {
        setError(t('alertDaysBeforeError', lang));
        return;
      }
    } else {
      const bitisKmVal = parseInt(formData.bitisKm as any) || 0;
      const oncesindanKmVal = parseInt(formData.oncesindanKm as any) || 0;
      
      if (!bitisKmVal || bitisKmVal <= 0) {
        setError(t('alertNoEndKm', lang));
        return;
      }
      if (!oncesindanKmVal || oncesindanKmVal <= 0) {
        setError(t('alertKmBeforeError', lang));
        return;
      }
    }

    setLoading(true);
    try {
      const submitData = {
        carId,
        plaka,
        baslik: formData.baslik,
        not: formData.not,
        tip: formData.tip,
        bitiseTarihi: formData.tip === 'tarih' ? formData.bitiseTarihi : undefined,
        oncesindanGun: formData.tip === 'tarih' ? parseInt(formData.oncesindanGun) : undefined,
        bitisKm: formData.tip === 'km' ? parseInt(formData.bitisKm as any) : undefined,
        oncesindanKm: formData.tip === 'km' ? parseInt(formData.oncesindanKm as any) : undefined,
      };
      await onSubmit(submitData);
      onClose();
      setFormData({
        baslik: '',
        not: '',
        tip: 'tarih',
        bitiseTarihi: new Date().toISOString().split('T')[0],
        oncesindanGun: '7',
        bitisKm: '',
        oncesindanKm: '',
      });
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="w-full max-w-[840px] bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingAlert ? t('editAlert', lang) : t('addAlert', lang)}</h2>
          {editingAlert && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={loading}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50"
            >
              <Trash2 size={22} />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('alertBaslik', lang)}
            value={formData.baslik}
            onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <textarea
            placeholder={t('notePlaceholder', lang)}
            value={formData.not}
            onChange={(e) => setFormData({ ...formData, not: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tip: 'tarih' })}
              className={`py-3 rounded-lg font-bold transition ${
                formData.tip === 'tarih'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('alertDateAlert', lang)}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tip: 'km' })}
              className={`py-3 rounded-lg font-bold transition ${
                formData.tip === 'km'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('alertKmAlert', lang)}
            </button>
          </div>

          {formData.tip === 'tarih' ? (
            <>
              <input
                type="date"
                value={formData.bitiseTarihi}
                onChange={(e) => setFormData({ ...formData, bitiseTarihi: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder={t('alertDaysBefore', lang)}
                value={formData.oncesindanGun}
                onChange={(e) => setFormData({ ...formData, oncesindanGun: e.target.value })}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </>
          ) : (
            <>
              <input
                type="number"
                placeholder={t('alertEndKm', lang)}
                value={formData.bitisKm}
                onChange={(e) => setFormData({ ...formData, bitisKm: e.target.value })}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <input
                type="number"
                placeholder={t('alertKmBefore', lang)}
                value={formData.oncesindanKm}
                onChange={(e) => setFormData({ ...formData, oncesindanKm: e.target.value })}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? t('saving', lang) : editingAlert ? t('update', lang) : t('add', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
