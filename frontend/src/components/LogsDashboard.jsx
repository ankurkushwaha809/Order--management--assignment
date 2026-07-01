import React, { useState } from 'react';
import { Play, Shield, Cpu, RefreshCw, AlertCircle, CheckCircle2, Clock, Eye, EyeOff } from 'lucide-react';

const LogsDashboard = ({ logs, loading, onRefresh }) => {
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [secretKey, setSecretKey] = useState('my_secure_scheduler_secret_key_2026');
  const [isTriggering, setIsTriggering] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState('');

  const toggleLog = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const handleRunScheduler = async () => {
    setIsTriggering(true);
    setRunResult(null);
    setRunError('');
    try {
      const response = await fetch('/api/scheduler/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-scheduler-key': secretKey
        }
      });

      const data = await response.json();
      if (data.success) {
        setRunResult(data.result);
        onRefresh(); // Refresh logs table
      } else {
        setRunError(data.message || 'Verification failed');
      }
    } catch (err) {
      setRunError('Failed to establish contact with backend scheduler API.');
    } finally {
      setIsTriggering(false);
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const elapsed = now - past;

    if (elapsed < msPerMinute) {
      return 'Just now';
    } else if (elapsed < msPerHour) {
      const mins = Math.round(elapsed / msPerMinute);
      return `${mins} min${mins > 1 ? 's' : ''} ago`;
    } else if (elapsed < msPerDay) {
      const hours = Math.round(elapsed / msPerHour);
      return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    } else {
      return past.toLocaleDateString();
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center flex flex-col items-center justify-center border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-xs font-semibold">Loading execution logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scheduler Trigger Box */}
      <div className="bg-white p-6 rounded-b-xl border-x border-b border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="text-indigo-600" size={16} />
            Background Scheduler Control
          </h3>
          <p className="text-xs text-slate-500 max-w-lg">
            Scan and process order status transitions immediately instead of waiting for the automatic 5-minute timer.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Shield size={14} />
            </span>
            <input
              type="password"
              placeholder="Security Key Required"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
            />
          </div>
          <button
            onClick={handleRunScheduler}
            disabled={isTriggering}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isTriggering ? (
              <RefreshCw className="animate-spin" size={12} />
            ) : (
              <Play size={12} />
            )}
            {isTriggering ? 'Running Scan...' : 'Scan & Update Orders Now'}
          </button>
        </div>
      </div>

      {/* Manual Trigger Status Feedback */}
      {(runResult || runError) && (
        <div className={`p-4 rounded-lg border ${
          runResult 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-start gap-2.5">
            {runResult ? (
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-600" />
            )}
            <div className="text-xs">
              <p className="font-bold mb-0.5">
                {runResult ? 'Scan Completed Successfully!' : 'Scanning Failed'}
              </p>
              <p className="text-slate-600">
                {runResult 
                  ? `Scan complete. Checked ${runResult.ordersProcessed} active orders. Auto-moved ${runResult.ordersUpdated} orders.`
                  : runError
                }
              </p>
              {runResult && runResult.details.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-emerald-200 space-y-1">
                  <p className="font-bold text-[9px] uppercase text-emerald-700">Auto-Updated Orders:</p>
                  {runResult.details.map((detail, idx) => (
                    <div key={idx} className="font-mono text-[10px] flex items-center gap-1.5 text-slate-600">
                      <span>Order {detail.orderId}:</span>
                      <span className="text-amber-700 font-bold">{detail.previousStatus}</span>
                      <span>&rarr;</span>
                      <span className="text-indigo-600 font-bold">{detail.newStatus}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Automatic System Check History
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Audit log of system checks and auto-updates.</p>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors flex items-center gap-1 text-[10px] font-bold"
          >
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No system check history found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Scan Time</th>
                  <th className="p-3 text-center">Result Status</th>
                  <th className="p-3 text-center">Checked Orders</th>
                  <th className="p-3 text-center">Auto-Updated</th>
                  <th className="p-3 pr-5 text-center">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.executionId;
                  const hasCheckedOrders = log.checkedOrders && log.checkedOrders.length > 0;
                  const hasDetails = hasCheckedOrders || (log.details && log.details.length > 0);
                  return (
                    <React.Fragment key={log.executionId}>
                      <tr 
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                        onClick={() => hasDetails && toggleLog(log.executionId)}
                      >
                        {/* Time of Scan */}
                        <td className="p-3.5 pl-5 text-xs text-slate-600 font-medium">
                          <span className="flex items-center gap-2">
                            <Clock size={12} className="text-slate-400" />
                            <span>{new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-slate-400">({getRelativeTime(log.startTime)})</span>
                          </span>
                        </td>
                        {/* Result Status */}
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block uppercase ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-250'
                              : 'bg-red-100 text-red-800 border border-red-250'
                          }`}>
                            {log.status === 'SUCCESS' ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        {/* Evaluated */}
                        <td className="p-3 text-center text-slate-600 font-medium">
                          <span className="text-indigo-600 underline decoration-dotted cursor-pointer hover:text-indigo-700">
                            {log.ordersProcessed} orders
                          </span>
                        </td>
                        {/* Updated */}
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.ordersUpdated > 0 ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500'
                          }`}>
                            {log.ordersUpdated} moved
                          </span>
                        </td>
                        {/* Details Trigger */}
                        <td className="p-3 pr-5 text-center" onClick={(e) => e.stopPropagation()}>
                          {hasDetails ? (
                            <button
                              onClick={() => toggleLog(log.executionId)}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-1 mx-auto shadow-xs"
                            >
                              {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">None</span>
                          )}
                        </td>
                      </tr>

                      {/* Log details expansion */}
                      {isExpanded && hasDetails && (
                        <tr>
                          <td colSpan="5" className="bg-slate-50/50 p-5 border-l-2 border-indigo-600 space-y-4">
                            
                            {/* Section 1: Checked Orders */}
                            {hasCheckedOrders && (
                              <div className="max-w-3xl">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                  Orders Inspected in this Run ({log.checkedOrders.length}):
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {log.checkedOrders.map((orderId, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-600">
                                      {orderId}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section 2: Moved Orders */}
                            {log.details && log.details.length > 0 && (
                              <div className="max-w-3xl pt-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-2">
                                  Auto-Advanced Status Updates ({log.details.length}):
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {log.details.map((detail, idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs flex justify-between items-center shadow-xs">
                                      <span className="text-indigo-600 font-bold">{detail.orderId}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-amber-700 text-[10px] px-1 bg-amber-50 rounded uppercase">{detail.previousStatus}</span>
                                        <span className="text-slate-400">&rarr;</span>
                                        <span className="text-indigo-600 text-[10px] px-1 bg-indigo-50 rounded uppercase">{detail.newStatus}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsDashboard;
