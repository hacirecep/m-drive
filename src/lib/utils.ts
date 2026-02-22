import { Car, DashboardStats } from '../types';

export const searchCars = (cars: Car[], query: string): Car[] => {
  if (!query.trim()) return cars;

  const lowerQuery = query.toLowerCase();
  return cars.filter((car) =>
    car.plaka.toLowerCase().includes(lowerQuery) ||
    car.marka.toLowerCase().includes(lowerQuery) ||
    car.model.toLowerCase().includes(lowerQuery) ||
    car.sasi?.toLowerCase().includes(lowerQuery)
  );
};

export const sortCars = (
  cars: Car[],
  sortBy: 'plaka' | 'km' | 'maliyet' | 'durum'
): Car[] => {
  const sorted = [...cars];

  switch (sortBy) {
    case 'km':
      return sorted.sort((a, b) => b.km - a.km);
    case 'maliyet':
      return sorted.sort((a, b) => {
        const costA = (a.bakimlar || []).reduce((sum, m) => sum + parseFloat(m.maliyet || '0'), 0);
        const costB = (b.bakimlar || []).reduce((sum, m) => sum + parseFloat(m.maliyet || '0'), 0);
        return costB - costA;
      });
    case 'durum':
      const durmOrder = { green: 0, yellow: 1, red: 2 };
      return sorted.sort((a, b) => durmOrder[a.durum] - durmOrder[b.durum]);
    default:
      return sorted.sort((a, b) => a.plaka.localeCompare(b.plaka));
  }
};

export const filterCarsByStatus = (cars: Car[], status: string): Car[] => {
  if (status === 'all') return cars;
  return cars.filter((car) => car.durum === status);
};

export const calculateDashboardStats = (cars: Car[]): DashboardStats => {
  const totalCars = cars.length;
  const allMaintenances = cars.flatMap((car) => car.bakimlar || []);
  const totalMaintenances = allMaintenances.length;

  const totalCost = allMaintenances.reduce(
    (sum, m) => sum + parseFloat(m.maliyet || '0'),
    0
  );

  const upcomingMaintenances = allMaintenances.filter((m) => m.sonraki && m.sonraki > 0);

  const averageKm = totalCars > 0 ? cars.reduce((sum, car) => sum + car.km, 0) / totalCars : 0;

  return {
    totalCars,
    totalMaintenances,
    totalCost,
    upcomingMaintenances,
    averageKm,
  };
};

export const formatCurrency = (value: number, currency: string = '₺'): string => {
  return `${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ${currency}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR');
};

export const getDurmColor = (durum: 'green' | 'yellow' | 'red'): string => {
  switch (durum) {
    case 'green':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'yellow':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'red':
      return 'bg-red-100 text-red-800 border-red-300';
  }
};

export const getDurmBadgeColor = (durum: 'green' | 'yellow' | 'red'): string => {
  switch (durum) {
    case 'green':
      return 'w-3 h-3 bg-green-500';
    case 'yellow':
      return 'w-3 h-3 bg-yellow-500';
    case 'red':
      return 'w-3 h-3 bg-red-500';
  }
};

export const exportToCSV = (cars: Car[], currency: string = '₺'): void => {
  if (cars.length === 0) return;

  let csv = 'Plaka;Marka;Model;Yil;KM;Sasi;Durum;Bakim_Tarihi;Bakim_Islemi;Bakim_Maliyet;Bakim_Not;Sahip_Email\n';

  cars.forEach((car) => {
    const base = `${car.plaka};${car.marka};${car.model};${car.yil || ''};${car.km};${car.sasi || ''};${car.durum}`;
    if (!car.bakimlar || car.bakimlar.length === 0) {
      csv += `${base};;;;${car.ownerEmail || ''}\n`;
    } else {
      car.bakimlar.forEach((m) => {
        csv += `${base};${m.tarih};${m.islem};${m.maliyet};${m.not || ''};${car.ownerEmail || ''}\n`;
      });
    }
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
  link.setAttribute('download', 'mdrive-rapor.csv');
  link.click();
};
