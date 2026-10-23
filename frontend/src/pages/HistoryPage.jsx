import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  Layers, 
  Sparkles, 
  Filter, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getScans, deleteScan, getExportCsvUrl } from '../services/api';
import { useToast } from '../components/Toast';

export default function HistoryPage({ onOpenScanner }) {
  const { addToast } = useToast();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await getScans({ query: searchQuery, category: categoryFilter });
      setScans(res.scans || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load scan history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScans();
  };

  const handleDelete = async (scanId) => {
    if (!window.confirm(`Are you sure you want to delete scan record #${scanId}?`)) return;
    try {
      await deleteScan(scanId);
      addToast(`Scan #${scanId} removed from database.`, 'info');
      fetchScans();
      if (selectedScan?.id === scanId) setSelectedScan(null);
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-eco-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-eco-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-card text-eco-green text-xs font-semibold uppercase tracking-wider mb-2 border border-eco-green/20">
            <History className="w-3.5 h-3.5" />
            <span>Persistent Audit Log</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-eco-text tracking-tight">
            Scan History & Archive
          </h1>
          <p className="text-sm text-eco-muted mt-1">
            Browse previous YOLOv8 computer vision detections, inspect bounding boxes, and export audit CSV.
          </p>
        </div>

        {/* CSV Export Button */}
        <a
          href={getExportCsvUrl()}
          download="nutrifeast_ecovision_scans.csv"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-eco-card hover:bg-eco-card-hover text-eco-text border border-eco-green/30 hover:border-eco-green text-sm font-semibold transition-all shadow-md"
        >
          <Download className="w-4 h-4 text-eco-green" />
          <span>Export Scans to CSV</span>
        </a>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-eco-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by object or label..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-xs text-eco-text outline-none"
          />
        </form>

        {/* Category Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Scans' },
            { id: 'Organic / Compostable', label: 'Organic' },
            { id: 'Recyclable (Verify Material)', label: 'Recyclable' },
            { id: 'Mixed Waste Stream — Separate First', label: 'Mixed' },
            { id: 'Manual Review', label: 'Manual' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-eco-card text-eco-green border border-eco-green/30 shadow'
                  : 'bg-eco-surface text-eco-muted hover:text-eco-text border border-eco-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-eco-muted">
          <div className="w-8 h-8 border-2 border-eco-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading scan records from database...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel border border-eco-border text-eco-muted">
          <History className="w-12 h-12 text-eco-muted/50 mx-auto mb-3" />
          <h4 className="font-heading font-bold text-base text-eco-text mb-1">
            No Scan Records Found
          </h4>
          <p className="text-xs max-w-sm mx-auto mb-4">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search terms or filters.'
              : 'Upload and analyze images in the AI Waste Scanner to begin logging scans.'}
          </p>
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="px-5 py-2 rounded-xl bg-eco-green text-eco-bg font-heading font-bold text-xs"
            >
              Open AI Scanner
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="rounded-2xl glass-card border border-eco-border hover:border-eco-green/30 overflow-hidden flex flex-col justify-between"
            >
              {/* Thumbnail header */}
              <div 
                onClick={() => setSelectedScan(scan)}
                className="relative h-44 bg-black/40 overflow-hidden cursor-pointer group"
              >
                <img
                  src={`/uploads/${scan.annotated_filename || scan.image_filename}`}
                  alt={`Scan ${scan.scan_uid}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-eco-card via-transparent to-black/30" />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-eco-green border border-eco-green/30">
                  #{scan.scan_uid}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-eco-text">
                  <span className="font-heading font-bold truncate">
                    {scan.primary_category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-eco-green/20 text-eco-green font-bold">
                    {scan.object_count} item(s)
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-eco-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-eco-muted" />
                    {scan.timestamp ? scan.timestamp.slice(0, 16).replace('T', ' ') : 'N/A'}
                  </span>
                  <span>Avg Conf: {scan.confidence_avg}%</span>
                </div>

                {/* Items detected pills */}
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                  {scan.detected_objects && scan.detected_objects.length > 0 ? (
                    scan.detected_objects.map((obj, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-eco-surface border border-eco-border text-eco-text"
                      >
                        {obj.display_name} ({obj.confidence}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-eco-muted italic">
                      No supported items detected
                    </span>
                  )}
                </div>

                {scan.environmental_tip && (
                  <p className="text-[10px] text-eco-lime line-clamp-1 italic">
                    💡 {scan.environmental_tip}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-eco-surface/50 border-t border-eco-border flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedScan(scan)}
                  className="inline-flex items-center gap-1.5 text-eco-green hover:underline font-semibold text-[11px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Details</span>
                </button>

                <button
                  onClick={() => handleDelete(scan.id)}
                  className="p-1.5 text-eco-muted hover:text-eco-red transition-colors"
                  title="Delete scan record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedScan(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-eco-card rounded-3xl border border-eco-green/30 p-6 md:p-8 shadow-2xl z-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-eco-border">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-eco-surface border border-eco-green/30 text-eco-green font-mono text-xs font-bold">
                  Scan #{selectedScan.scan_uid}
                </span>
                <span className="text-xs text-eco-muted">
                  Recorded: {selectedScan.timestamp?.slice(0, 16).replace('T', ' ')}
                </span>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-eco-muted hover:text-eco-text p-1.5 rounded-lg bg-eco-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-side Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-black/40 border border-eco-border text-center">
                <p className="text-xs text-eco-muted font-bold mb-2 uppercase tracking-wider">
                  Original Input
                </p>
                <img
                  src={`/uploads/${selectedScan.image_filename}`}
                  alt="Original"
                  className="max-h-72 w-auto mx-auto rounded-xl object-contain"
                />
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-eco-green/30 text-center">
                <p className="text-xs text-eco-green font-bold mb-2 uppercase tracking-wider">
                  YOLOv8 Annotations
                </p>
                <img
                  src={`/uploads/${selectedScan.annotated_filename}`}
                  alt="Annotated"
                  className="max-h-72 w-auto mx-auto rounded-xl object-contain"
                />
              </div>
            </div>

            {/* Detections List */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-sm text-eco-text uppercase tracking-wider">
                Detection Breakdown ({selectedScan.object_count} objects)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {selectedScan.detected_objects?.map((obj, i) => (
                  <div key={i} className="p-3 rounded-xl bg-eco-surface border border-eco-border space-y-1">
                    <div className="flex items-center justify-between font-bold text-eco-text">
                      <span>{obj.display_name}</span>
                      <span className="text-eco-green font-mono">{obj.confidence}%</span>
                    </div>
                    <p className="text-[11px] text-eco-muted">
                      <strong className="text-eco-text">Handling: </strong>{obj.handling}
                    </p>
                    <p className="text-[11px] text-eco-muted">
                      <strong className="text-eco-text">Tip: </strong>{obj.segregation_tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {selectedScan.environmental_tip && (
              <div className="p-4 rounded-xl bg-eco-surface border border-eco-border text-xs text-eco-lime">
                💡 <strong>Environmental Recommendation:</strong> {selectedScan.environmental_tip}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
