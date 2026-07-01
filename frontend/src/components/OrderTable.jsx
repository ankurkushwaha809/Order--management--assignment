import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, Phone, Package } from 'lucide-react';

const OrderTable = ({ orders, loading, pagination, onPageChange }) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const toggleRow = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PLACED':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'READY_TO_SHIP':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-12 text-center flex flex-col items-center justify-center border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-xs font-semibold">Loading orders database...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-16 text-center flex flex-col items-center justify-center border border-slate-200 shadow-sm">
        <div className="p-3.5 rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
          <Package size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">No Orders Found</h3>
        <p className="text-xs text-slate-500 max-w-xs">No orders match the selected filters or search terms. Try modifying your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Payment</th>
                <th className="p-3.5">Created At</th>
                <th className="p-3.5 pr-5 text-center">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.orderId;
                return (
                  <React.Fragment key={order.orderId}>
                    <tr 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                      onClick={() => toggleRow(order.orderId)}
                    >
                      <td className="p-3.5 pl-5 font-mono font-bold text-indigo-600">
                        {order.orderId}
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{order.customerName}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={10} /> {order.phone}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{order.productName}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        ₹{order.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block uppercase tracking-wide ${getStatusBadgeClass(order.orderStatus)}`}>
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block uppercase ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 pl-3.5">
                            <Clock size={10} className="text-slate-400" />
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 pr-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleRow(order.orderId)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 transition-all"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded History Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="8" className="bg-slate-50/50 p-5 border-l-2 border-indigo-600">
                          <div className="max-w-2xl">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                              <Clock size={12} className="text-indigo-600" />
                              Order Fulfillment Audit Timeline
                            </h4>
                            <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4 py-1">
                              {order.statusHistory.map((history, idx) => (
                                <div key={idx} className="relative">
                                  {/* Dot */}
                                  <div className="absolute -left-[21px] mt-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600"></div>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(history.status)}`}>
                                        {history.status.replace(/_/g, ' ')}
                                      </span>
                                      <span className="text-[11px] text-slate-600 font-medium italic">
                                        "{history.reason}"
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(history.changedAt).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-xs text-slate-500">
            Page <strong className="text-slate-700">{pagination.currentPage}</strong> of <strong className="text-slate-700">{pagination.totalPages}</strong> ({pagination.totalOrders} total items)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
