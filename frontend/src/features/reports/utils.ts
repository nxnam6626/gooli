/** Format number thành chuỗi tiền VN */
export const fmt = (n: number | string) => Number(n).toLocaleString('vi-VN');

/** Format YYYY-MM-DD → DD/MM/YYYY */
export const fmtDateRange = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};
