import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Eye, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Recycle, 
  HeartHandshake, 
  HelpCircle, 
  Maximize2,
  FileText,
  Sliders,
  ChevronRight,
  Info,
  Plus,
  Trash2,
  Save,
  Check,
  X,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { analyzeImage, confirmScan } from '../services/api';
import { useToast } from '../components/Toast';

// Supported user-selectable waste categories
const TAXONOMY_OPTIONS = [
  { group: 'Organic Food Waste', items: [
    'Fruit peels',
    'Vegetable scraps',
    'Leftover rice',
    'Bread waste',
    'Food leftovers',
    'Eggshells',
    'Other organic food waste'
  ]},
  { group: 'Packaging & Containers', items: [
    'Plastic containers',
    'Plastic bottles',
    'Paper packaging',
    'Cardboard',
    'Metal cans',
    'Glass containers'
  ]},
  { group: 'Other / Mixed', items: [
    'Mixed waste',
    'Unknown waste'
  ]}
];

export default function ScannerPage({ onNavigateToRescue }) {
  const { addToast } = useToast();
  
  // File & Analysis State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('annotated'); // 'annotated' or 'original'
  const [dragOver, setDragOver] = useState(false);
  
  // Model & Threshold Settings (TASK 2)
  const [showSettings, setShowSettings] = useState(false);
  const [modelName, setModelName] = useState('yolov8n'); // 'yolov8n' or 'yolov8s'
  const [confThreshold, setConfThreshold] = useState(0.20);
  const [iouThreshold, setIouThreshold] = useState(0.45);

  // Manual Verification & Correction State (TASK 2 & 5)
  const [itemsList, setItemsList] = useState([]);
  const [selectedCategoryToAdd, setSelectedCategoryToAdd] = useState('Fruit peels');
  const [savingConfirmation, setSavingConfirmation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addToast('Please upload a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      addToast('Image size exceeds 16MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setItemsList([]);
    setIsConfirmed(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setItemsList([]);
    setIsConfirmed(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick Demo Sample loader
  const loadSampleImage = async (sampleType) => {
    try {
      addToast(`Loading sample ${sampleType} image...`, 'info', 2000);
      const filename = sampleType === 'fruits' ? 'fruits.jpg' : 'packaging.jpg';
      const response = await fetch(`/sample_images/${filename}`).catch(() => null);
      
      let blob;
      if (response && response.ok) {
        blob = await response.blob();
      }

      if (!blob) {
        addToast('Sample image could not be loaded directly.', 'warning');
        return;
      }

      const file = new File([blob], `${sampleType}_test.jpg`, { type: 'image/jpeg' });
      handleFileSelect(file);
    } catch (err) {
      addToast('Could not load sample file. Please select a file manually.', 'warning');
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      addToast('Please select or drop an image first.', 'warning');
      return;
    }

    setAnalyzing(true);
    setIsConfirmed(false);
    try {
      const data = await analyzeImage(selectedFile, {
        conf_threshold: confThreshold,
        iou_threshold: iouThreshold,
        model_name: modelName
      });
      setResult(data);
      setItemsList(data.detected_objects || []);
      
      if (data.object_count > 0) {
        addToast(`${data.model_used || 'YOLOv8'} detected ${data.object_count} item(s). Review or add missing items below.`, 'success');
      } else {
        addToast('No supported objects detected. You can add items manually below.', 'warning');
      }
    } catch (err) {
      console.error(err);
      addToast(`Analysis error: ${err.message}`, 'error', 6000);
    } finally {
      setAnalyzing(false);
    }
  };

  // User adds missing item
  const handleAddItem = () => {
    if (!selectedCategoryToAdd) return;
    
    // Determine category based on item name
    let cat = 'Organic / Compostable';
    if (['Plastic containers', 'Plastic bottles', 'Paper packaging', 'Cardboard', 'Metal cans', 'Glass containers'].includes(selectedCategoryToAdd)) {
      cat = 'Recyclable (Verify Material)';
    } else if (selectedCategoryToAdd === 'Mixed waste') {
      cat = 'General Waste or Verification Needed';
    } else if (selectedCategoryToAdd === 'Unknown waste') {
      cat = 'Manual Review / Unknown Material';
    }

    const newItem = {
      id: Date.now(),
      display_name: selectedCategoryToAdd,
      class_name: selectedCategoryToAdd.toLowerCase(),
      category: cat,
      confidence: 100.0,
      is_uncertain: false,
      source: 'user',
      handling: `User verified: ${selectedCategoryToAdd}.`,
      segregation_tip: 'Follow verified sorting stream.',
      badge_color: cat.includes('Organic') ? 'emerald' : (cat.includes('Recyclable') ? 'blue' : 'amber'),
      rule_basis: 'User Confirmed Classification'
    };

    setItemsList((prev) => [...prev, newItem]);
    setIsConfirmed(false);
    addToast(`Added "${selectedCategoryToAdd}". Click "Save Confirmed Results" to update database.`, 'info', 2500);
  };

  // User removes false detection
  const handleRemoveItem = (index) => {
    setItemsList((prev) => prev.filter((_, i) => i !== index));
    setIsConfirmed(false);
  };

  // Save Confirmed Results (TASK 2 & 5)
  const handleSaveConfirmedResults = async () => {
    if (!result?.scan_id) {
      addToast('No active scan record to update.', 'warning');
      return;
    }

    setSavingConfirmation(true);
    try {
      const updated = await confirmScan(result.scan_id, itemsList);
      setResult((prev) => ({
        ...prev,
        ...updated,
        detected_objects: updated.detected_objects,
        object_count: updated.object_count,
        primary_category: updated.primary_category,
        segregation_summary: updated.segregation_summary
      }));
      setItemsList(updated.detected_objects);
      setIsConfirmed(true);
      addToast('Waste classification verified & saved to database!', 'success');
    } catch (err) {
      console.error(err);
      addToast(`Save error: ${err.message}`, 'error');
    } finally {
      setSavingConfirmation(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-eco-text z-10 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-eco-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-card text-eco-green text-xs font-semibold uppercase tracking-wider mb-2 border border-eco-green/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Computer Vision & Human-in-the-Loop Intelligence</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-eco-text tracking-tight">
            AI Waste Scanner
          </h1>
          <p className="text-sm text-eco-muted mt-1">
            Detect food and packaging waste with YOLOv8 neural inference, then verify or refine mixed waste categories.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              showSettings 
                ? 'bg-eco-green text-eco-bg border-eco-green shadow-md' 
                : 'bg-eco-card hover:bg-eco-card-hover text-eco-muted hover:text-eco-text border-eco-border'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Inference Settings</span>
          </button>

          {previewUrl && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-eco-card hover:bg-eco-card-hover text-eco-muted hover:text-eco-text border border-eco-border text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Inference Settings Bar (TASK 2) */}
      {showSettings && (
        <div className="p-5 rounded-2xl glass-panel border border-eco-green/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-eco-border pb-3">
            <h3 className="font-heading font-bold text-sm text-eco-text flex items-center gap-2">
              <Sliders className="w-4 h-4 text-eco-green" />
              <span>Model & Detection Parameters</span>
            </h3>
            <span className="text-[11px] text-eco-muted">Tune sensitivity for mixed-waste scenes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Model Selector */}
            <div>
              <label className="block font-semibold text-eco-text mb-1.5">
                AI Vision Model
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-eco-text text-xs outline-none"
              >
                <option value="yolov8n">YOLOv8 Nano (Fast Edge - 6.2MB)</option>
                <option value="yolov8s">YOLOv8 Small (Enhanced Accuracy - 21.5MB)</option>
              </select>
              <span className="text-[10px] text-eco-muted mt-1 block">
                Cached in memory on local CPU.
              </span>
            </div>

            {/* Confidence Threshold */}
            <div>
              <div className="flex justify-between font-semibold text-eco-text mb-1.5">
                <span>Confidence Threshold:</span>
                <span className="text-eco-green font-mono">{Math.round(confThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.05"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                className="w-full accent-eco-green cursor-pointer"
              />
              <span className="text-[10px] text-eco-muted mt-1 block">
                Lower threshold (e.g. 15%) detects partial or mixed food scraps.
              </span>
            </div>

            {/* IoU NMS Threshold */}
            <div>
              <div className="flex justify-between font-semibold text-eco-text mb-1.5">
                <span>IoU (NMS Overlap):</span>
                <span className="text-eco-lime font-mono">{Math.round(iouThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.70"
                step="0.05"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                className="w-full accent-eco-lime cursor-pointer"
              />
              <span className="text-[10px] text-eco-muted mt-1 block">
                Non-Maximum Suppression filters duplicate overlapping boxes.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Upload & Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Quick Samples (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Modern Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 relative ${
              dragOver
                ? 'border-eco-green bg-eco-green/15 shadow-xl shadow-eco-green/20'
                : 'border-eco-border hover:border-eco-green/50 bg-eco-card/60 hover:bg-eco-card/90'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files[0])}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-eco-surface border border-eco-border flex items-center justify-center text-eco-green mb-4 shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="font-heading font-bold text-base text-eco-text mb-1">
              {selectedFile ? selectedFile.name : 'Drop photo or click to browse'}
            </h3>
            <p className="text-xs text-eco-muted max-w-xs mb-4">
              Supports high-resolution JPG, JPEG, PNG, or WEBP. Clear angles optimize detection.
            </p>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-eco-surface hover:bg-eco-card text-eco-green border border-eco-green/30 text-xs font-semibold tracking-wide transition-all"
            >
              Select Image File
            </button>
          </div>

          {/* Quick Demo Test Samples */}
          <div className="p-4 rounded-2xl bg-eco-surface/80 border border-eco-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-eco-muted flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-eco-lime" />
                Benchmark Test Samples
              </span>
              <span className="text-[10px] text-eco-muted bg-eco-card px-2 py-0.5 rounded border border-eco-border">
                Instant Test
              </span>
            </div>
            <p className="text-xs text-eco-muted mb-3">
              Test detection immediately with pre-captured images:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => loadSampleImage('fruits')}
                className="px-3.5 py-2.5 rounded-xl bg-eco-card hover:bg-eco-card-hover text-eco-text border border-eco-green/20 hover:border-eco-green/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <span>🍌 Fresh Produce</span>
              </button>
              <button
                type="button"
                onClick={() => loadSampleImage('packaging')}
                className="px-3.5 py-2.5 rounded-xl bg-eco-card hover:bg-eco-card-hover text-eco-text border border-eco-green/20 hover:border-eco-green/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <span>🥤 Packaging & Cup</span>
              </button>
            </div>
          </div>

          {/* Analyze CTA */}
          <button
            onClick={handleRunAnalysis}
            disabled={!selectedFile || analyzing}
            className={`w-full py-4 rounded-2xl font-heading font-bold text-base flex items-center justify-center gap-3 transition-all ${
              !selectedFile || analyzing
                ? 'bg-eco-card text-eco-muted border border-eco-border cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-eco-green to-eco-emerald text-eco-bg shadow-xl shadow-eco-green/25 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running {modelName === 'yolov8s' ? 'YOLOv8 Small' : 'YOLOv8'} Neural Inference...</span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                <span>Analyze Waste Image</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Visual Stage & Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Image Display Card */}
          <div className="relative rounded-3xl glass-panel border border-eco-border overflow-hidden min-h-[380px] flex flex-col justify-center items-center bg-eco-surface/40">
            {previewUrl ? (
              <div className="relative w-full h-full flex flex-col">
                {/* View Tabs */}
                {result && (
                  <div className="flex items-center justify-between px-5 py-3 bg-eco-card/90 border-b border-eco-border z-10">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('annotated')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === 'annotated'
                            ? 'bg-eco-green text-eco-bg font-bold shadow'
                            : 'text-eco-muted hover:text-eco-text'
                        }`}
                      >
                        YOLOv8 Detections
                      </button>
                      <button
                        onClick={() => setActiveTab('original')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === 'original'
                            ? 'bg-eco-green text-eco-bg font-bold shadow'
                            : 'text-eco-muted hover:text-eco-text'
                        }`}
                      >
                        Original Photo
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-eco-muted">
                        {itemsList.length} total items
                      </span>
                      {isConfirmed && (
                        <span className="px-2 py-0.5 rounded-full bg-eco-green/20 text-eco-green text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Confirmed
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Image Stage Container */}
                <div className="relative w-full flex-1 flex items-center justify-center p-4 bg-black/40 min-h-[340px]">
                  <img
                    src={
                      result && activeTab === 'annotated'
                        ? result.annotated_image_url
                        : previewUrl
                    }
                    alt="Analyzed subject"
                    className="max-h-[460px] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
                  />

                  {/* Laser Scanning Animation */}
                  {analyzing && <div className="scanner-line" />}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-eco-muted flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-eco-surface/80 border border-eco-border flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-eco-muted/60" />
                </div>
                <h4 className="font-heading font-semibold text-base text-eco-text mb-1">
                  Vision Output Preview
                </h4>
                <p className="text-xs max-w-xs text-eco-muted">
                  Select or drop a food or waste image to preview and run computer vision analysis.
                </p>
              </div>
            )}
          </div>

          {/* Detections, Mixed-Waste Identification & Recommendations */}
          {result && (
            <div className="space-y-6">
              {/* Primary Segregation Banner */}
              <div className="p-5 rounded-3xl bg-eco-card border border-eco-green/30 shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-eco-green/20 text-eco-green border border-eco-green/30">
                        Synthesized Segregation Decision
                      </span>
                      <span className="text-xs text-eco-muted">
                        Avg Confidence: {result.confidence_avg}%
                      </span>
                    </div>
                    <h3 className="font-heading font-extrabold text-xl text-eco-text">
                      {result.primary_category}
                    </h3>
                    <p className="text-xs text-eco-muted mt-1 leading-relaxed">
                      {result.segregation_summary?.action_recommendation}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-eco-green/15 text-eco-green flex items-center justify-center flex-shrink-0">
                    <Recycle className="w-6 h-6" />
                  </div>
                </div>

                {result.environmental_tip && (
                  <div className="mt-4 pt-3 border-t border-eco-border flex items-center gap-2 text-xs text-eco-lime">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span>{result.environmental_tip}</span>
                  </div>
                )}
              </div>

              {/* USER-ASSISTED WASTE IDENTIFICATION & CORRECTION INTERFACE (TASK 2) */}
              <div className="p-5 rounded-3xl glass-panel border border-eco-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-eco-border">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-eco-text flex items-center gap-2">
                      <Layers className="w-4 h-4 text-eco-green" />
                      <span>Waste Items & Manual Verification</span>
                    </h4>
                    <p className="text-[11px] text-eco-muted">
                      Mixed waste piles cannot always be identified by vision alone. Confirm or add missing items below.
                    </p>
                  </div>

                  {/* Save Confirmed Results Button */}
                  <button
                    onClick={handleSaveConfirmedResults}
                    disabled={savingConfirmation}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-eco-green hover:bg-eco-emerald text-eco-bg font-heading font-bold text-xs shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingConfirmation ? 'Saving...' : 'Save Confirmed Results'}</span>
                  </button>
                </div>

                {/* Add Missing Category Selector */}
                <div className="p-3.5 rounded-2xl bg-eco-surface/90 border border-eco-border flex flex-col sm:flex-row items-center gap-3">
                  <span className="text-xs font-semibold text-eco-text whitespace-nowrap flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-eco-lime" />
                    Add Waste Item:
                  </span>

                  <select
                    value={selectedCategoryToAdd}
                    onChange={(e) => setSelectedCategoryToAdd(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-eco-card border border-eco-border text-xs text-eco-text outline-none focus:border-eco-green"
                  >
                    {TAXONOMY_OPTIONS.map((grp) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.items.map((it) => (
                          <option key={it} value={it}>{it}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <button
                    onClick={handleAddItem}
                    className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-eco-card hover:bg-eco-card-hover text-eco-green border border-eco-green/30 text-xs font-bold transition-all"
                  >
                    + Add to Scan
                  </button>
                </div>

                {/* Current Items List with Uncertainty Highlights & Deletion */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {itemsList.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.is_uncertain
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-eco-card/80 border-eco-border hover:border-eco-green/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-bold text-sm text-eco-text">
                            {item.display_name}
                          </span>

                          {/* Source badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            item.source === 'user'
                              ? 'bg-eco-emerald/20 text-eco-emerald border border-eco-emerald/30'
                              : 'bg-eco-surface text-eco-muted border border-eco-border'
                          }`}>
                            {item.source === 'user' ? 'User Added' : `AI Predicted (${item.confidence}%)`}
                          </span>

                          {/* Category badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            item.category?.includes('Organic')
                              ? 'bg-eco-green/15 text-eco-green'
                              : item.category?.includes('Recyclable')
                              ? 'bg-sky-400/15 text-sky-400'
                              : 'bg-eco-amber/15 text-eco-amber'
                          }`}>
                            {item.category}
                          </span>

                          {/* Uncertainty highlight */}
                          {item.is_uncertain && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Uncertain &lt;45% (Verify)
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-eco-muted">
                          <strong className="text-eco-text">Tip: </strong>{item.segregation_tip}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-eco-muted hover:text-eco-red rounded-lg hover:bg-eco-surface transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {itemsList.length === 0 && (
                    <div className="p-4 text-center text-eco-muted text-xs">
                      No items classified. Select from the dropdown above to add items.
                    </div>
                  )}
                </div>
              </div>

              {/* Surplus Food Action Prompt */}
              {result.segregation_summary?.has_food_candidate && onNavigateToRescue && (
                <div className="p-5 rounded-3xl bg-eco-emerald/10 border border-eco-emerald/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="w-5 h-5 text-eco-emerald flex-shrink-0" />
                    <div>
                      <h5 className="font-heading font-bold text-xs text-eco-text">
                        Potentially Edible Surplus Food Detected
                      </h5>
                      <p className="text-[11px] text-eco-muted">
                        Is this food unconsumed and safe? Record it under NutriFeast Surplus Rescue for community redistribution.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToRescue}
                    className="px-4 py-2 rounded-xl bg-eco-emerald text-eco-bg font-heading font-bold text-xs flex items-center gap-1.5 hover:bg-eco-green transition-colors flex-shrink-0"
                  >
                    <span>List Surplus</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
