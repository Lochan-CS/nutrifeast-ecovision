import React from 'react';
import { 
  Info, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  Database, 
  Code2, 
  Leaf, 
  Lightbulb, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-eco-text">
      {/* Header */}
      <div className="pb-6 border-b border-eco-border">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-card text-eco-green text-xs font-semibold uppercase tracking-wider mb-2 border border-eco-green/20">
          <Info className="w-3.5 h-3.5" />
          <span>Project Identity & Scientific Disclosures</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-eco-text tracking-tight">
          About NutriFeast EcoVision
        </h1>
        <p className="text-sm text-eco-muted mt-1">
          Domain Focus: <strong className="text-eco-text">Intelligent Food Waste Minimization & Circular Resource Recovery</strong>
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-eco-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-eco-green/15 text-eco-green flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-xl text-eco-text">The Problem Statement</h3>
          <p className="text-xs text-eco-muted leading-relaxed">
            Over 1.3 billion tons of food are wasted annually worldwide. When discarded food ends up in municipal 
            landfills, it decomposes under anaerobic conditions, producing massive volumes of methane (CH4)—a greenhouse 
            gas with 28 times the global warming potential of carbon dioxide. Furthermore, contamination between food grease 
            and recyclable packaging causes entire loads of recyclable plastic and paper to be discarded.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-eco-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-eco-lime/15 text-eco-lime flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-xl text-eco-text">The Proposed Solution</h3>
          <p className="text-xs text-eco-muted leading-relaxed">
            NutriFeast EcoVision pairs state-of-the-art computer vision with deterministic waste segregation logic. 
            By recognizing common foods and containers, it guides operators to cleanly separate organic matter, 
            verifies recyclable packaging resin types, and prevents usable surplus meals from entering the trash bin 
            through NutriFeast Food Rescue.
          </p>
        </div>
      </div>

      {/* Critical Scientific Disclosure: Pretrained YOLOv8 vs Food-Waste Classification */}
      <div className="p-6 rounded-2xl bg-eco-card border border-eco-green/30 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-eco-green flex-shrink-0" />
          <h3 className="font-heading font-bold text-lg text-eco-text">
            Pretrained Object Detection vs. Waste Classification Taxonomy
          </h3>
        </div>
        <div className="space-y-3 text-xs text-eco-muted leading-relaxed">
          <p>
            <strong className="text-eco-text">Honest AI Principle:</strong> The AI model employed in this application is the official 
            <code className="text-eco-green px-1.5 py-0.5 rounded bg-eco-surface mx-1">yolov8n.pt</code> pretrained on the 80-class COCO benchmark dataset. 
            COCO provides general object classes (such as <code className="text-eco-lime">banana</code>, <code className="text-eco-lime">apple</code>, <code className="text-eco-lime">bottle</code>, <code className="text-eco-lime">cup</code>, <code className="text-eco-lime">bowl</code>).
          </p>
          <p>
            Pretrained vision models <strong className="text-eco-text">do not inherently know municipal recycling regulations</strong> or polymer resin codes. 
            For example, YOLOv8 can detect a "bottle" or "cup", but cannot discern whether a bottle is made of PET (#1) or PVC (#3), nor can it see the microscopic polyethylene lining inside a takeout cup.
          </p>
          <p>
            To bridge this gap ethically, EcoVision layers a <strong className="text-eco-text">transparent domain-rule segregation engine</strong> on top of YOLO detections:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-eco-text pl-2">
            <li>Food classes are routed to organic composting or evaluated for surplus redistribution.</li>
            <li>Packaging classes mandate physical resin verification rather than falsely assuring universal recyclability.</li>
            <li>Composite scenes (e.g. food in a bowl) trigger multi-step guidance: strip food first, then clean the container.</li>
          </ul>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="p-6 rounded-2xl glass-panel border border-eco-border space-y-4">
        <h3 className="font-heading font-bold text-lg text-eco-text flex items-center gap-2">
          <Cpu className="w-5 h-5 text-eco-green" />
          <span>System Architecture & Stack</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-eco-surface border border-eco-border space-y-2">
            <span className="font-heading font-bold text-eco-green block text-sm">Frontend Layer</span>
            <ul className="space-y-1 text-eco-muted">
              <li>• React 19 + Vite</li>
              <li>• Tailwind CSS (Custom Dark Eco Theme)</li>
              <li>• Recharts Data Visualizations</li>
              <li>• Lucide React Icons</li>
              <li>• Responsive Glassmorphism UI</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-eco-surface border border-eco-border space-y-2">
            <span className="font-heading font-bold text-eco-lime block text-sm">Computer Vision Engine</span>
            <ul className="space-y-1 text-eco-muted">
              <li>• Ultralytics YOLOv8 (yolov8n.pt)</li>
              <li>• OpenCV (cv2) bounding box renderer</li>
              <li>• Pillow / NumPy image matrix pipeline</li>
              <li>• Local Edge / CPU Execution</li>
              <li>• Zero external cloud API fees</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-eco-surface border border-eco-border space-y-2">
            <span className="font-heading font-bold text-eco-emerald block text-sm">Backend & Storage</span>
            <ul className="space-y-1 text-eco-muted">
              <li>• Python Flask microframework</li>
              <li>• Flask-CORS for secure local origin</li>
              <li>• SQLite zero-config local database</li>
              <li>• Deterministic segregation rules</li>
              <li>• CSV audit export engine</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Model Limitations & Future Scope */}
      <div className="p-6 rounded-2xl glass-card border border-eco-border space-y-4">
        <h3 className="font-heading font-bold text-lg text-eco-text flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-eco-lime" />
          <span>Model Limitations & Future Scope</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-eco-muted leading-relaxed">
          <div className="p-4 rounded-xl bg-eco-surface/70 border border-eco-border space-y-1.5">
            <h4 className="font-bold text-eco-text">Current Model Limitations</h4>
            <p>• Cannot assess bacterial spoilage or chemical freshness without spectral or smell sensors.</p>
            <p>• COCO-pretrained weights identify general objects, not fine-grained bio-plastics or mixed food recipes.</p>
            <p>• Visual occlusion and poor lighting can reduce confidence in dense cafeteria trays.</p>
          </div>

          <div className="p-4 rounded-xl bg-eco-surface/70 border border-eco-border space-y-1.5">
            <h4 className="font-bold text-eco-green">Future Enhancements</h4>
            <p>• Fine-tuning YOLOv8 on the TACO (Trash Annotations in Context) and Food-101 datasets.</p>
            <p>• Near-Infrared (NIR) hyperspectral camera integration to detect polymer resin types instantly.</p>
            <p>• Direct API connectors to local food banks and municipal smart-bin weighing scales.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
