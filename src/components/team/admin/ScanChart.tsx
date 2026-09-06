'use client';

import React from 'react';

interface ScanEventData {
  scannedAt: string | Date;
  source?: string | null;
}

interface ScanChartProps {
  scans: ScanEventData[];
  memberName?: string;
}

export function ScanChart({ scans, memberName }: ScanChartProps) {
  if (!scans || scans.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] text-sm text-gray-500 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        No scan activity recorded yet.
      </div>
    );
  }

  // Aggregate scans by date
  const scansByDate = scans.reduce<Record<string, { total: number; qr: number; direct: number }>>(
    (acc, scan) => {
      const dateStr = new Date(scan.scannedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!acc[dateStr]) {
        acc[dateStr] = { total: 0, qr: 0, direct: 0 };
      }
      acc[dateStr].total += 1;
      if (scan.source === 'qr') {
        acc[dateStr].qr += 1;
      } else {
        acc[dateStr].direct += 1;
      }
      return acc;
    },
    {}
  );

  const chartData = Object.entries(scansByDate).map(([date, counts]) => ({
    date,
    qr: counts.qr,
    direct: counts.direct,
    total: counts.total,
  }));

  const maxTotal = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            {memberName ? `Scan Trend: ${memberName}` : 'Daily Badge Scans'}
          </h3>
          <p className="text-xs text-gray-400">Activity across all member ID badges</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#EB0028]" />
            <span className="text-gray-300">QR Scans</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span className="text-gray-300">Direct Link</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Visualizer */}
      <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 overflow-x-auto">
        {chartData.map((item, idx) => {
          const heightPercent = Math.max(8, Math.round((item.total / maxTotal) * 100));
          return (
            <div key={idx} className="flex-1 min-w-[48px] flex flex-col items-center gap-2 group">
              {/* Tooltip on hover */}
              <div className="text-[10px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.total}
              </div>

              {/* Bar */}
              <div
                className="w-full max-w-[36px] rounded-t-lg overflow-hidden flex flex-col justify-end bg-white/5 transition-all duration-300 group-hover:brightness-125"
                style={{ height: `${heightPercent}%` }}
              >
                <div
                  className="w-full bg-[#EB0028] transition-all"
                  style={{ height: `${(item.qr / (item.total || 1)) * 100}%` }}
                />
                <div
                  className="w-full bg-cyan-400/80 transition-all"
                  style={{ height: `${(item.direct / (item.total || 1)) * 100}%` }}
                />
              </div>

              {/* Label */}
              <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">
                {item.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
