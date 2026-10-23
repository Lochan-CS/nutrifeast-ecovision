import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Layers, 
  Leaf, 
  Package, 
  HelpCircle, 
  HeartHandshake, 
  Sparkles,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { getAnalytics } from '../services/api';
import { useToast } from '../components/Toast';

export default function AnalyticsPage({ onOpenScanner }) {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
        addToast('Failed to load live analytics data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hasScans = data && data.total_scans > 0;
  const hasRescue = data && data.total_rescue > 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-eco-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-eco-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-card text-eco-green text-xs font-semibold uppercase tracking-wider mb-2 border border-eco-green/20">
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Backed Telemetry</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-eco-text tracking-tight">
            Waste Analytics & Metrics
          </h1>
          <p className="text-sm text-eco-muted mt-1">
            Real-time visualization of detected waste streams, organic biomass diversion, and food rescue records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-eco-muted bg-eco-card px-3.5 py-2 rounded-xl border border-eco-border">
          <span className="w-2 h-2 rounded-full bg-eco-green animate-pulse" />
          <span>Live SQLite Database Connection</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Scans',
            value: data?.total_scans ?? 0,
            icon: BarChart3,
            color: 'text-eco-green',
            bg: 'bg-eco-green/10',
            border: 'border-eco-green/20'
          },
          {
            label: 'Objects Detected',
            value: data?.total_objects ?? 0,
            icon: Layers,
            color: 'text-eco-lime',
            bg: 'bg-eco-lime/10',
            border: 'border-eco-lime/20'
          },
          {
            label: 'Organic Scans',
            value: data?.organic_scans ?? 0,
            icon: Leaf,
            color: 'text-eco-green',
            bg: 'bg-eco-green/10',
            border: 'border-eco-green/20'
          },
          {
            label: 'Packaging Items',
            value: data?.recyclable_scans ?? 0,
            icon: Package,
            color: 'text-sky-400',
            bg: 'bg-sky-400/10',
            border: 'border-sky-400/20'
          },
          {
            label: 'Manual Reviews',
            value: data?.manual_review_scans ?? 0,
            icon: HelpCircle,
            color: 'text-eco-amber',
            bg: 'bg-eco-amber/10',
            border: 'border-eco-amber/20'
          },
          {
            label: 'Rescue Listings',
            value: data?.total_rescue ?? 0,
            icon: HeartHandshake,
            color: 'text-eco-emerald',
            bg: 'bg-eco-emerald/10',
            border: 'border-eco-emerald/20'
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-eco-card/80 border ${kpi.border} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-eco-muted tracking-wide uppercase">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-heading font-black text-2xl lg:text-3xl text-eco-text">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Section */}
      {loading ? (
        <div className="py-24 text-center text-eco-muted">
          <div className="w-8 h-8 border-2 border-eco-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Compiling analytics from database...</p>
        </div>
      ) : !hasScans && !hasRescue ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl glass-panel border border-eco-border text-eco-muted">
          <BarChart3 className="w-16 h-16 text-eco-muted/40 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-lg text-eco-text mb-2">
            No Scan Data Recorded Yet
          </h3>
          <p className="text-xs max-w-md mx-auto mb-6 leading-relaxed">
            NutriFeast EcoVision relies strictly on authentic YOLOv8 scans and user rescue inputs. 
            Run your first AI waste scan to start populating this dashboard.
          </p>
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-eco-green to-eco-emerald text-eco-bg font-heading font-bold text-xs shadow-lg shadow-eco-green/20 hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <span>Scan Your First Image</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Waste Category Distribution */}
          <div className="p-6 rounded-2xl glass-panel border border-eco-border flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-heading font-bold text-base text-eco-text flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-eco-green" />
                <span>Detected Category Distribution</span>
              </h3>
              <p className="text-xs text-eco-muted">
                Aggregated detections sorted into EcoVision waste streams
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.category_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(data?.category_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#123126',
                      borderColor: '#4ADE80',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-eco-muted">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Daily Scan Activity */}
          <div className="p-6 rounded-2xl glass-panel border border-eco-border flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-heading font-bold text-base text-eco-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-eco-lime" />
                <span>Scan Activity & Volume</span>
              </h3>
              <p className="text-xs text-eco-muted">
                Scans and detected object volume over recent operational dates
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.daily_activity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#183F31" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#A7B8AE" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#A7B8AE" 
                    fontSize={11} 
                    tickLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#123126',
                      borderColor: '#4ADE80',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(val) => <span className="text-xs text-eco-muted">{val}</span>}
                  />
                  <Bar dataKey="scans" name="Total Scans" fill="#4ADE80" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="objects" name="Objects Found" fill="#BEF264" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Food Rescue Redistribution Status */}
          <div className="p-6 rounded-2xl glass-panel border border-eco-border lg:col-span-2">
            <div className="mb-4">
              <h3 className="font-heading font-bold text-base text-eco-text flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-eco-emerald" />
                <span>NutriFeast Surplus Food Lifecycle</span>
              </h3>
              <p className="text-xs text-eco-muted">
                Distribution of recorded surplus food batches by current handling state
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.rescue_status_distribution || []}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#183F31" horizontal={false} />
                  <XAxis type="number" stroke="#A7B8AE" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#A7B8AE" fontSize={11} width={160} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#123126',
                      borderColor: '#10B981',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" name="Batch Count" fill="#10B981" radius={[0, 6, 6, 0]}>
                    {(data?.rescue_status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-rescue-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Audit Transparency Disclaimer */}
      <div className="p-4 rounded-xl bg-eco-card/40 border border-eco-border text-[11px] text-eco-muted flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-eco-lime flex-shrink-0" />
        <span>
          <strong>Ethical AI Reporting:</strong> EcoVision metrics strictly aggregate verified SQLite database counts. 
          Theoretical carbon offsets and estimated food weights are deliberately not fabricated without direct physical scale sensor input.
        </span>
      </div>
    </div>
  );
}
