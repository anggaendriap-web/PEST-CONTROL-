import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  actions?: (item: T) => React.ReactNode;
  filterOptions?: {
    key: keyof T;
    label: string;
    options: { label: string; value: string }[];
  }[];
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Cari data...',
  searchKeys = [],
  actions,
  filterOptions = [],
  title,
  subtitle,
  headerAction
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter logic
  let filteredData = data.filter(item => {
    // Search matching
    if (searchTerm && searchKeys.length > 0) {
      const matchSearch = searchKeys.some(key => {
        const val = item[key];
        return val ? String(val).toLowerCase().includes(searchTerm.toLowerCase()) : false;
      });
      if (!matchSearch) return false;
    }

    // Dropdown filters
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (filterValue && filterValue !== 'ALL') {
        const itemVal = item[filterKey as keyof T];
        if (String(itemVal) !== filterValue) return false;
      }
    }

    return true;
  });

  // Sort logic
  if (sortKey) {
    filteredData = [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, any>)[sortKey];
      const bVal = (b as Record<string, any>)[sortKey];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Title & Header Action bar */}
      {(title || headerAction) && (
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40 dark:bg-slate-900/40">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/20 dark:bg-slate-900/20">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
          />
        </div>

        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            {filterOptions.map(opt => (
              <select
                key={String(opt.key)}
                value={filters[String(opt.key)] || 'ALL'}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, [String(opt.key)]: e.target.value }));
                  setCurrentPage(1);
                }}
                className="text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="ALL">Semua {opt.label}</option>
                {opt.options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3.5 text-right whitespace-nowrap">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3.5 whitespace-nowrap align-middle">
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5 text-right whitespace-nowrap align-middle">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-900/20">
        <div>
          Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> -{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredData.length)}</span> dari{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{filteredData.length}</span> data
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
