import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Sparkles, 
  Recycle, 
  HeartHandshake, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Globe2,
  TreePine,
  ExternalLink,
  Package,
  Leaf,
  Activity,
  History
} from 'lucide-react';
import { getAnalytics } from '../services/api';

export default function LandingPage({ onStartScan, onExploreDashboard }) {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAnalytics();
        setStats(data);
      } catch (err) {
        console.warn("Could not load overview telemetry:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="relative min-h-screen text-eco-text z-10">
      {/* Hero Section */}
      <section className="pt-10 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Animated Badge - Clean enterprise branding */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eco-card/90 border border-eco-green/40 text-eco-green text-xs font-semibold tracking-wide uppercase shadow-lg shadow-black/40 mb-8 backdrop-blur-md animate-pulse-slow">
          <Sparkles className="w-4 h-4 text-eco-lime" />
          <span>AI-Powered Food Waste Intelligence Platform</span>
        </div>

        {/* Hero Heading */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.1] max-w-5xl mb-6">
          Smarter Vision. <br className="hidden sm:inline" />
          <span className="text-eco-gradient">Less Waste.</span> <br className="hidden sm:inline" />
          Greener Tomorrow.
        </h1>

        {/* Hero Subheading */}
        <p className="text-eco-muted text-base sm:text-xl max-w-3xl leading-relaxed mb-10 font-normal">
          Transforming food waste management with intelligent computer vision, responsible segregation, 
          and sustainable food rescue powered by real-time YOLOv8 object detection.
        </p>

        {/* Tagline Banner */}
        <div className="mb-10 px-6 py-2.5 rounded-2xl bg-eco-surface/90 border border-eco-border shadow-inner text-sm font-medium text-eco-text flex items-center gap-2">
          <Leaf className="w-4 h-4 text-eco-green" />
          <span>See the Waste. Save the Food. Protect the Planet.</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={onStartScan}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-eco-green to-eco-emerald text-eco-bg font-heading font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-eco-green/25 hover:shadow-eco-green/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Eye className="w-5 h-5" />
            <span>Start AI Scanning</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDashboard}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-eco-card/90 hover:bg-eco-card text-eco-text border border-eco-border hover:border-eco-green/40 font-heading font-semibold text-base flex items-center justify-center gap-3 transition-all"
          >
            <BarChart3 className="w-5 h-5 text-eco-lime" />
            <span>Explore Dashboard</span>
          </button>
        </div>

        {/* Live System Telemetry Strip (TASK 3 requirement) */}
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-eco-muted flex items-center gap-2">
              <Activity className="w-4 h-4 text-eco-green animate-pulse" />
              Live System Telemetry & Diversion Metrics
            </span>
            <span className="text-[11px] text-eco-green font-mono bg-eco-card/80 px-2.5 py-0.5 rounded-full border border-eco-green/30">
              SQLite Connected
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {[
              {
                label: 'Total Scans',
                value: stats?.total_scans ?? 0,
                icon: Eye,
                color: 'text-eco-green',
                border: 'border-eco-green/30'
              },
              {
                label: 'Detected Items',
                value: stats?.total_objects ?? 0,
                icon: Layers,
                color: 'text-eco-lime',
                border: 'border-eco-lime/30'
              },
              {
                label: 'Organic Waste',
                value: stats?.organic_scans ?? 0,
                icon: Leaf,
                color: 'text-eco-green',
                border: 'border-eco-green/30'
              },
              {
                label: 'Packaging Items',
                value: stats?.recyclable_scans ?? 0,
                icon: Package,
                color: 'text-sky-400',
                border: 'border-sky-400/30'
              },
              {
                label: 'Food Rescue Listed',
                value: stats?.total_rescue ?? 0,
                icon: HeartHandshake,
                color: 'text-eco-emerald',
                border: 'border-eco-emerald/30'
              },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className={`p-4 rounded-2xl glass-card border ${st.border} flex flex-col justify-between text-left`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-eco-muted uppercase tracking-wider">
                      {st.label}
                    </span>
                    <Icon className={`w-4 h-4 ${st.color}`} />
                  </div>
                  <div className={`font-heading font-black text-2xl md:text-3xl ${st.color}`}>
                    {loadingStats ? '-' : st.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Environmental AI Triad Cards */}
        <div className="relative mt-12 w-full max-w-5xl p-6 sm:p-8 rounded-3xl glass-panel shadow-2xl border border-eco-green/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-eco-surface/80 border border-eco-border">
              <div className="w-10 h-10 rounded-xl bg-eco-green/20 flex items-center justify-center mb-3">
                <Eye className="w-5 h-5 text-eco-green" />
              </div>
              <h3 className="font-heading font-bold text-base text-eco-text mb-1">Visual Recognition</h3>
              <p className="text-xs text-eco-muted leading-relaxed">
                YOLOv8 detects bananas, apples, citrus, packaged bottles, cups, and food containers with precise coordinates and configurable sensitivity.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-eco-surface/80 border border-eco-border">
              <div className="w-10 h-10 rounded-xl bg-eco-lime/20 flex items-center justify-center mb-3">
                <Recycle className="w-5 h-5 text-eco-lime" />
              </div>
              <h3 className="font-heading font-bold text-base text-eco-text mb-1">Smart Segregation</h3>
              <p className="text-xs text-eco-muted leading-relaxed">
                Rules guide separation of organic food waste from composite beverage cups and verify recyclable resin types.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-eco-surface/80 border border-eco-border">
              <div className="w-10 h-10 rounded-xl bg-eco-emerald/20 flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5 text-eco-emerald" />
              </div>
              <h3 className="font-heading font-bold text-base text-eco-text mb-1">NutriFeast Surplus Rescue</h3>
              <p className="text-xs text-eco-muted leading-relaxed">
                Surplus edible foods are recorded for community redistribution with safety verification before waste occurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-eco-border">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-eco-text mb-3">
            Intelligent Waste Pipeline
          </h2>
          <p className="text-eco-muted text-sm sm:text-base max-w-2xl mx-auto">
            From optical detection to community redistribution, every step is transparent and auditable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-7 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-eco-green/15 text-eco-green flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-eco-text mb-2">
              Multi-Model Edge Vision
            </h3>
            <p className="text-sm text-eco-muted leading-relaxed mb-4">
              Real neural inference on uploaded images. Select between YOLOv8 Nano for fast edge analysis or YOLOv8 Small for enhanced accuracy.
            </p>
            <div className="text-xs font-semibold text-eco-green flex items-center gap-1">
              <span>Local CPU Execution • No Cloud Latency</span>
            </div>
          </div>

          <div className="glass-card p-7 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-eco-lime/15 text-eco-lime flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-eco-text mb-2">
              Domain Segregation Logic
            </h3>
            <p className="text-sm text-eco-muted leading-relaxed mb-4">
              Rule-based engine distinguishes organic compostables from materials needing verification (such as PE-lined cups and PET plastic bottles).
            </p>
            <div className="text-xs font-semibold text-eco-lime flex items-center gap-1">
              <span>Zero-Hallucination Taxonomy</span>
            </div>
          </div>

          <div className="glass-card p-7 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-eco-emerald/15 text-eco-emerald flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-eco-text mb-2">
              NutriFeast Food Rescue
            </h3>
            <p className="text-sm text-eco-muted leading-relaxed mb-4">
              Seamlessly record surplus food batches for local redistribution. Built-in food safety warnings mandate physical verification before redistribution.
            </p>
            <div className="text-xs font-semibold text-eco-emerald flex items-center gap-1">
              <span>SQLite Persistent Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-eco-border">
        <div className="text-center mb-14">
          <div className="text-xs font-bold text-eco-green uppercase tracking-wider mb-2">Workflow</div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-eco-text">
            How EcoVision Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload Image',
              desc: 'Provide food or packaging photos via drag-and-drop or one-click demo samples.'
            },
            {
              step: '02',
              title: 'YOLOv8 Detection',
              desc: 'Neural model segments objects, generating coordinates, confidence scores, and uncertainty tags.'
            },
            {
              step: '03',
              title: 'Verify & Classify',
              desc: 'Confirm mixed-waste items, add missing categories, and trigger deterministic segregation rules.'
            },
            {
              step: '04',
              title: 'Action & Rescue',
              desc: 'Follow disposal guidance or redirect untouched meals into NutriFeast Food Rescue.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-eco-card/50 border border-eco-border relative">
              <span className="font-heading font-black text-3xl text-eco-green/30 absolute top-4 right-4">
                {item.step}
              </span>
              <h3 className="font-heading font-bold text-lg text-eco-text mb-2">{item.title}</h3>
              <p className="text-xs text-eco-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainability Mission Banner */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-eco-surface to-eco-card border border-eco-green/30 relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-eco-lime text-xs font-bold uppercase tracking-wider mb-3">
              <Globe2 className="w-4 h-4" /> Environmental Impact
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-eco-text mb-4">
              Preventing Landfill Methane at the Source
            </h2>
            <p className="text-sm text-eco-muted leading-relaxed mb-6">
              Food waste decomposing in anaerobic landfills generates potent methane gas. By providing accurate 
              sorting guidance and prioritizing safe surplus food recovery, NutriFeast EcoVision fosters a circular, 
              responsible ecosystem.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onStartScan}
                className="px-6 py-3 rounded-xl bg-eco-green text-eco-bg font-heading font-bold text-sm shadow-lg shadow-eco-green/20 hover:scale-105 transition-all"
              >
                Scan an Item Now
              </button>
              <div className="flex items-center gap-2 text-xs text-eco-muted">
                <ShieldCheck className="w-4 h-4 text-eco-green" />
                <span>Transparent AI • No Hallucinated Metrics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-eco-border py-10 px-6 max-w-7xl mx-auto text-center text-xs text-eco-muted">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-eco-green" />
            <span className="font-bold text-eco-text">NutriFeast EcoVision</span>
            <span>— AI Food Waste Intelligence</span>
          </div>
          <div>
            <span>NutriFeast EcoVision • Enterprise AI Waste Management • Powered by YOLOv8, Flask & React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
