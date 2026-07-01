import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Layers, Terminal, Search, Clock, Wifi, WifiOff } from 'lucide-react';
import StatsCards from './components/StatsCards';
import OrderTable from './components/OrderTable';
import OrderModal from './components/OrderModal';
import LogsDashboard from './components/LogsDashboard';

const App = () => {
  // Tabs: 'orders' | 'logs'
  const [activeTab, setActiveTab] = useState('orders');
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState('');
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination
  const [pagination, setPagination] = useState({
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });

  // Scheduler Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Auto Refresh State (custom intervals in seconds: 0 means Off)
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  
  // Create Order Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch orders logic
  const fetchOrders = useCallback(async (page = pagination.currentPage) => {
    setLoadingOrders(true);
    setErrorOrders('');
    try {
      const url = `/api/orders?status=${statusFilter}&search=${debouncedSearch}&page=${page}&limit=${pagination.limit}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
        setMetrics(data.metrics);
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setErrorOrders(data.message || 'Failed to retrieve orders.');
      }
    } catch (err) {
      setErrorOrders('Cannot connect to backend server. Make sure server is running.');
    } finally {
      setLoadingOrders(false);
    }
  }, [statusFilter, debouncedSearch, pagination.limit]);

  // Fetch scheduler logs logic
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch('/api/scheduler/logs');
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to load scheduler execution history.');
    } finally {
      setLoadingLogs(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchOrders(pagination.currentPage);
  }, [fetchOrders, pagination.currentPage]);

  // Handle pagination clicks
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Refresh current view
  const handleManualRefresh = () => {
    if (activeTab === 'orders') {
      fetchOrders(pagination.currentPage);
    } else {
      fetchLogs();
    }
    // Reset countdown if active
    if (refreshInterval > 0) {
      setSecondsLeft(refreshInterval);
    }
  };

  // Fetch logs when tab changes
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else {
      fetchOrders(1);
    }
    if (refreshInterval > 0) {
      setSecondsLeft(refreshInterval);
    }
  }, [activeTab]);

  // Countdown timer effect
  useEffect(() => {
    if (refreshInterval === 0 || isModalOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          if (activeTab === 'orders') {
            fetchOrders(pagination.currentPage);
          } else {
            fetchLogs();
          }
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, activeTab, fetchOrders, pagination.currentPage, isModalOpen]);

  // Reset countdown if interval changes
  useEffect(() => {
    setSecondsLeft(refreshInterval);
  }, [refreshInterval]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-800">
      
      {/* Top Navbar - Clean Corporate style */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/11449/11449841.png" 
              alt="Enterprise Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Enterprise Order Center
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                Internal Operations & Fulfillment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Last Synced Status Info */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Update Status</span>
              <span className="text-[11px] text-slate-600 font-medium">
                {refreshInterval > 0 ? `Refreshing in ${secondsLeft}s` : `Refreshed at ${lastSyncedTime}`}
              </span>
            </div>

            {/* Auto Refresh Select Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">Auto Refresh:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value={0}>Off</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
              </select>
            </div>

            {/* Manual Refresh */}
            <button
              onClick={handleManualRefresh}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Manual Refresh"
            >
              <RefreshCw size={12} className={loadingOrders || loadingLogs ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* Create Order Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus size={16} />
              New Order
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6">
        
        {/* Statistics Cards Summary */}
        <StatsCards metrics={metrics} />

        {/* Tab Controls / View Switcher */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 bg-white px-4 pt-3 rounded-t-xl border-t border-x">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers size={14} />
            Orders Management
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Terminal size={14} />
            Background Logs
          </button>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'orders' ? (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-b-xl border-x border-b border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search by Order ID or Customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Status Dropdown Filter */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer min-w-[150px]"
                >
                  <option value="ALL">All Orders</option>
                  <option value="PLACED">Placed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="READY_TO_SHIP">Ready to Ship</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

            </div>

            {/* Error Message */}
            {errorOrders && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {errorOrders}
              </div>
            )}

            {/* Orders Table */}
            <OrderTable
              orders={orders}
              loading={loadingOrders}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <LogsDashboard
            logs={logs}
            loading={loadingLogs}
            onRefresh={fetchLogs}
          />
        )}
      </main>

      {/* Order Creation Modal Popups */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateOrder={() => fetchOrders(1)}
      />
    </div>
  );
};

export default App;
