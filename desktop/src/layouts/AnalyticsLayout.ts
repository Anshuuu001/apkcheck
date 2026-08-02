import type { LayoutTemplate } from './types';

export const AnalyticsLayout: LayoutTemplate = {
  id: 'layout-analytics',
  name: 'Analytics',
  description: 'KPI row, charts, date range picker',
  category: 'admin',
  slots: [
    { id: 'header', name: 'Header Bar', position: 'top', flex: 0, acceptsComponents: ['TopBar'], defaultComponent: 'TopBar' },
    { id: 'dateRange', name: 'Date Range Picker', position: 'top', flex: 0, acceptsComponents: ['DateRangePicker', 'FilterChips'], defaultComponent: 'DateRangePicker' },
    { id: 'kpis', name: 'KPI Cards', position: 'top', flex: 1, acceptsComponents: ['StatCard', 'KPICard'], defaultComponent: 'StatCard' },
    { id: 'charts', name: 'Charts Area', position: 'center', flex: 4, acceptsComponents: ['LineChart', 'BarChart', 'PieChart'], defaultComponent: 'LineChart' },
  ],
  defaultComponents: ['TopBar', 'DateRangePicker', 'StatCard', 'LineChart'],
};
