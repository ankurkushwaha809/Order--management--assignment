import React from 'react';
import { ShoppingBag, Clock, Cpu, Ship, CheckCircle, AlertTriangle } from 'lucide-react';

const StatsCards = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Orders',
      value: metrics?.TOTAL || 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-200'
    },
    {
      title: 'Placed',
      value: metrics?.PLACED || 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-200'
    },
    {
      title: 'Processing',
      value: metrics?.PROCESSING || 0,
      icon: Cpu,
      color: 'bg-indigo-50 text-indigo-600',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-200'
    },
    {
      title: 'Ready To Ship',
      value: metrics?.READY_TO_SHIP || 0,
      icon: Ship,
      color: 'bg-purple-50 text-purple-600',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-200'
    },
    {
      title: 'Delivered',
      value: metrics?.DELIVERED || 0,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-200'
    },
    {
      title: 'Cancelled',
      value: metrics?.CANCELLED || 0,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`enterprise-card p-4 rounded-xl border ${card.borderColor} flex flex-col justify-between hover:border-slate-300 transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.color}`}>
                <Icon size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
