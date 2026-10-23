import React, { useState } from 'react';
import { 
  Recycle, 
  Leaf, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  Package, 
  Coffee, 
  Apple, 
  Wine, 
  Utensils, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function SegregationPage({ onOpenScanner }) {
  const [selectedCat, setSelectedCat] = useState('organic');

  const categories = [
    {
      id: 'organic',
      title: 'Organic / Compostable',
      icon: Leaf,
      badgeColor: 'border-eco-green/40 text-eco-green bg-eco-green/10',
      tagline: 'Biodegradable biomass for compost and anaerobic digesters',
      description: 'Pure food residues, peelings, vegetable trimmings, fruits, grains, and organic scraps. Nutritious material that returns carbon to soil.',
      handling: 'Segregate at the source. Never mix with plastic cling film, fruit stickers, or non-compostable packaging. Store in breathable or paper-lined organic bins.',
      environmentalGuidance: 'Landfilled organics decay anaerobically, emitting methane (CH4)—a greenhouse gas 28x more potent than CO2. Composting traps carbon in soil.',
      examples: ['Bananas & citrus peels', 'Apples & fruit cores', 'Vegetable stems & peels', 'Cooked grains & bread crusts', 'Bakery and coffee grounds'],
      verificationNote: 'Fruit stickers, plastic bands, and coated wrappers must be physically removed.'
    },
    {
      id: 'recyclable',
      title: 'Recyclable — Verification Required',
      icon: Recycle,
      badgeColor: 'border-sky-400/40 text-sky-400 bg-sky-400/10',
      tagline: 'Rigid containers, clean packaging & verified plastics',
      description: 'Bottles, jars, cans, and clean containers. AI detects the object shape, but physical verification of the resin identification code is required.',
      handling: 'Empty all liquids. Rinse thoroughly to remove food oils. Flatten bottles to save volume. Keep caps on or off per municipal rules.',
      environmentalGuidance: 'High-purity recycling prevents fossil-fuel plastic synthesis. Food oils and beverage dregs ruin entire batches in recycling facilities.',
      examples: ['Clear PET water bottles (#1)', 'HDPE milk/detergent jugs (#2)', 'Aluminum beverage cans', 'Clean glass bottles and jars', 'PP deli tubs (#5)'],
      verificationNote: 'Do not assume all bottles are plastic; glass or specialty bottles require separate handling.'
    },
    {
      id: 'general',
      title: 'General / Mixed Waste',
      icon: Trash2,
      badgeColor: 'border-eco-amber/40 text-eco-amber bg-eco-amber/10',
      tagline: 'Composite materials, grease-soaked items & non-recyclables',
      description: 'Single-use packaging with waterproof plastic/wax linings, multi-layer foil laminates, and food-contaminated packaging.',
      handling: 'Place in designated general landfill or waste-to-energy bin. Do not contaminate green organic bins or clean paper streams.',
      environmentalGuidance: 'Minimize usage by opting for reusable containers, mugs, and durable cutleries.',
      examples: ['PE-lined paper coffee cups', 'Greasy pizza boxes with heavy oil', 'Multi-layer snack chip pouches', 'Wax-coated wrappers', 'Styrofoam food trays'],
      verificationNote: 'Paper cups almost always have waterproof polyethylene plastic lining.'
    },
    {
      id: 'review',
      title: 'Manual Review & Special Handling',
      icon: HelpCircle,
      badgeColor: 'border-slate-400/40 text-slate-300 bg-slate-400/10',
      tagline: 'Ambiguous materials, utensils & mixed assemblies',
      description: 'Items where visual features alone cannot confirm chemical composition, contamination level, or municipal recyclability.',
      handling: 'Inspect physical markings, resin codes (1-7), and cleanliness. Disassemble multi-part packaging (e.g., separate plastic lid from cup).',
      environmentalGuidance: 'Pretrained computer vision models identify visual bounding boxes; domain rules mandate operator verification to ensure zero contamination.',
      examples: ['Plastic forks, knives & spoons', 'Drinking glassware / crystal', 'Unknown takeout bowls', 'Bio-plastics without clear ASTM markings', 'Sealed food packs'],
      verificationNote: 'When doubtful, check your local authority’s accepted materials list.'
    }
  ];

  const current = categories.find((c) => c.id === selectedCat) || categories[0];
  const Icon = current.icon;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-eco-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-eco-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-card text-eco-green text-xs font-semibold uppercase tracking-wider mb-2 border border-eco-green/20">
            <Recycle className="w-3.5 h-3.5" />
            <span>Standardized Waste Taxonomy</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-eco-text tracking-tight">
            Smart Waste Segregation
          </h1>
          <p className="text-sm text-eco-muted mt-1">
            Understand the rule-based decision engine behind EcoVision’s disposal recommendations.
          </p>
        </div>

        {onOpenScanner && (
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-eco-green to-eco-emerald text-eco-bg font-heading font-bold text-sm shadow-lg shadow-eco-green/20 hover:scale-[1.02] transition-all"
          >
            <span>Scan Waste Item</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const CatIcon = cat.icon;
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-eco-card border-eco-green/50 shadow-lg shadow-eco-green/10'
                  : 'bg-eco-surface/80 border-eco-border hover:bg-eco-card/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <CatIcon className={`w-5 h-5 ${isSelected ? 'text-eco-green' : 'text-eco-muted'}`} />
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-eco-green' : 'bg-transparent'}`} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-eco-text">{cat.title}</h4>
                <p className="text-[11px] text-eco-muted line-clamp-1 mt-0.5">{cat.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Card for Active Category */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-eco-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-eco-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-eco-surface border border-eco-border flex items-center justify-center text-eco-green">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${current.badgeColor}`}>
                Active Category
              </span>
              <h2 className="font-heading font-bold text-2xl text-eco-text mt-1.5">{current.title}</h2>
              <p className="text-xs text-eco-muted">{current.tagline}</p>
            </div>
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-heading font-bold text-sm text-eco-text mb-1">Description</h4>
              <p className="text-xs text-eco-muted leading-relaxed">{current.description}</p>
            </div>

            <div>
              <h4 className="font-heading font-bold text-sm text-eco-text mb-1">Recommended Handling</h4>
              <p className="text-xs text-eco-muted leading-relaxed">{current.handling}</p>
            </div>

            <div className="p-4 rounded-xl bg-eco-surface/80 border border-eco-border">
              <div className="flex items-center gap-2 text-eco-lime text-xs font-semibold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Environmental Impact</span>
              </div>
              <p className="text-xs text-eco-muted leading-relaxed">{current.environmentalGuidance}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-eco-card border border-eco-border">
              <h4 className="font-heading font-bold text-sm text-eco-text mb-3">Example Detected Items</h4>
              <ul className="space-y-2">
                {current.examples.map((ex, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-eco-text">
                    <CheckCircle2 className="w-4 h-4 text-eco-green flex-shrink-0" />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-eco-amber/10 border border-eco-amber/30 text-xs text-eco-amber">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Mandatory Verification Note</span>
              </div>
              <p className="leading-relaxed">{current.verificationNote}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Logic Explainer */}
      <div className="p-6 rounded-2xl bg-eco-card/50 border border-eco-border">
        <h3 className="font-heading font-bold text-base text-eco-text mb-2">
          The Rule-Based Segregation Matrix
        </h3>
        <p className="text-xs text-eco-muted leading-relaxed mb-4">
          Pretrained YOLOv8 provides generalized visual detections (e.g. "bottle", "cup", "banana", "bowl"). 
          EcoVision’s deterministic segregation engine evaluates each item against contamination probabilities:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-eco-surface border border-eco-border">
            <span className="font-bold text-eco-green block mb-1">Food Classes</span>
            <p className="text-eco-muted">
              Apples, bananas, citrus, carrots, broccoli are classified as compostable organic matter. Unpackaged edible food is flagged for NutriFeast Surplus Rescue.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-eco-surface border border-eco-border">
            <span className="font-bold text-sky-400 block mb-1">Container Classes</span>
            <p className="text-eco-muted">
              Bottles and cups trigger verification prompts. Lined coffee cups go to general waste unless commercial compostability is certified.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-eco-surface border border-eco-border">
            <span className="font-bold text-eco-amber block mb-1">Mixed Compositions</span>
            <p className="text-eco-muted">
              If an image contains both food items and bowls/utensils, users are instructed to separate food biomass first before rinsing containers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
