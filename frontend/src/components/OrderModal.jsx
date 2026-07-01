import React, { useState } from 'react';
import { X, ShoppingBag, User, Phone, Tag, CreditCard } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, onCreateOrder }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    productName: '',
    amount: '',
    paymentStatus: 'PENDING'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { customerName, phone, productName, amount } = formData;

    if (!customerName || !phone || !productName || !amount) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Amount must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();
      if (data.success) {
        onCreateOrder();
        onClose();
        setFormData({
          customerName: '',
          phone: '',
          productName: '',
          amount: '',
          paymentStatus: 'PENDING'
        });
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="enterprise-modal w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" size={18} />
            <h3 className="text-sm font-bold text-slate-900">Create New Order</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Customer Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User size={14} />
              </span>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Phone size={14} />
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                required
              />
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Product Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Tag size={14} />
              </span>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Product SKU or Name"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                required
              />
            </div>
          </div>

          {/* Amount & Payment Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Amount (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <span className="text-xs font-semibold">₹</span>
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Payment</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <CreditCard size={14} />
                </span>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-250 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-200 bg-slate-50 -mx-5 -mb-5 p-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
