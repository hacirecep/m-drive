import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, GripVertical } from 'lucide-react';
import { Car } from '../types';
import { searchCars, sortCars, filterCarsByStatus, getDurmBadgeColor } from '../lib/utils';
import { t } from '../lib/i18n';

interface CarListProps {
  cars: Car[];
  language: string;
  onSelectCar: (carId: string) => void;
  onAddCar: () => void;
}

export const CarList: React.FC<CarListProps> = ({ cars, language, onSelectCar, onAddCar }) => {
  const lang = language as any;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [sortBy, setSortBy] = useState<'plaka' | 'km' | 'maliyet' | 'durum'>('plaka');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [customOrder, setCustomOrder] = useState<string[]>([]);

  const filteredCars = useMemo(() => {
    const searched = searchCars(cars, searchQuery);
    const filtered = filterCarsByStatus(searched, statusFilter);
    return sortCars(filtered, sortBy);
  }, [cars, searchQuery, statusFilter, sortBy]);

  const handleDragStart = (e: React.DragEvent, carId: string) => {
    setDraggingId(carId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const displayCars = useMemo(() => {
    if (customOrder.length === 0 || searchQuery || statusFilter !== 'all') {
      return filteredCars;
    }
    const orderMap = new Map(customOrder.map((id, idx) => [id, idx]));
    return [...filteredCars].sort((a, b) => {
      const aIdx = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity;
      const bIdx = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity;
      return aIdx - bIdx;
    });
  }, [filteredCars, customOrder, searchQuery, statusFilter]);

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggingId && draggingId !== targetId) {
      const dragIndex = displayCars.findIndex((c) => c.id === draggingId);
      const targetIndex = displayCars.findIndex((c) => c.id === targetId);
      const newOrder = [...displayCars];
      [newOrder[dragIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[dragIndex]];
      setCustomOrder(newOrder.map((c) => c.id));
    }
    setDraggingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        <input
          type="text"
          placeholder={t('searchPlaceholder', lang)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('allCars', lang)}
        </button>
        <button
          onClick={() => setStatusFilter('green')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-2 ${
            statusFilter === 'green'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>{t('active', lang)}
        </button>
        <button
          onClick={() => setStatusFilter('yellow')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-2 ${
            statusFilter === 'yellow'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>{t('service', lang)}
        </button>
        <button
          onClick={() => setStatusFilter('red')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-2 ${
            statusFilter === 'red'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>{t('broken', lang)}
        </button>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2">
        <Filter size={20} className="text-gray-600 dark:text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="plaka">{t('sortByPlate', lang)}</option>
          <option value="km">{t('sortByKm', lang)}</option>
          <option value="maliyet">{t('sortByCost', lang)}</option>
          <option value="durum">{t('sortByStatus', lang)}</option>
        </select>
      </div>

      {/* Car List */}
      {displayCars.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-4xl mb-4">🚗</div>
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">{t('noCars', lang)}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('noCarDescription', lang)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayCars
            .filter(car => car.id && car.id.trim() !== '')
            .map((car) => (
            <div
              key={car.id}
              draggable
              onDragStart={(e) => handleDragStart(e, car.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, car.id)}
              onClick={() => onSelectCar(car.id)}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 cursor-move hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-900/30 transition transform hover:scale-102 ${
                draggingId === car.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-gray-400 dark:text-gray-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getDurmBadgeColor(car.durum)}`}></div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{car.plaka}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {car.marka} {car.model} {car.yil && `(${car.yil})`}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="font-bold text-gray-900 dark:text-white">{car.km.toLocaleString('tr-TR')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">KM</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={onAddCar}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-full shadow-lg dark:shadow-blue-900/50 flex items-center justify-center transition-transform hover:scale-110 z-50"
        title={t('addNewCar', lang)}
      >
        <Plus size={28} />
      </button>
    </div>
  );
};
