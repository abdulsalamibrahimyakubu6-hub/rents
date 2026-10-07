import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-slate-800 rounded" />
        <div className="h-8 w-32 bg-slate-800 rounded" />
      </div>
      <div className="h-10 w-10 bg-slate-800 rounded-xl" />
    </div>
    <div className="mt-4 h-3 w-40 bg-slate-800 rounded" />
  </div>
);

export const SkeletonTableRow: React.FC = () => (
  <tr className="border-b border-slate-800/60 animate-pulse">
    <td className="p-4"><div className="h-4 w-12 bg-slate-800 rounded" /></td>
    <td className="p-4"><div className="h-4 w-36 bg-slate-800 rounded" /></td>
    <td className="p-4"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
    <td className="p-4"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
    <td className="p-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
    <td className="p-4"><div className="h-6 w-16 bg-slate-800 rounded-full" /></td>
  </tr>
);

export const SkeletonPropertyGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden animate-pulse">
        <div className="h-48 bg-slate-800 w-full" />
        <div className="p-5 space-y-3">
          <div className="h-5 w-3/4 bg-slate-800 rounded" />
          <div className="h-3 w-full bg-slate-800 rounded" />
          <div className="h-3 w-1/2 bg-slate-800 rounded" />
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <div className="h-6 w-20 bg-slate-800 rounded" />
            <div className="h-6 w-16 bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
