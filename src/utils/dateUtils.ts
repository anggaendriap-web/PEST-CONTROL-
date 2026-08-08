export const formatDateIndo = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const rawDate = dateStr.split('T')[0];
  const parts = rawDate.split('-');
  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const mIdx = parseInt(month, 10) - 1;
  if (mIdx >= 0 && mIdx < 12) {
    const dayNum = parseInt(day, 10);
    return `${dayNum} ${months[mIdx]} ${year}`;
  }
  return dateStr;
};
