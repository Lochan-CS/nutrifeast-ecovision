import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Package, 
  Thermometer, 
  FileText,
  Filter,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { getRescueRecords, createRescueRecord, updateRescueStatus, deleteRescueRecord } from '../services/api';
import { useToast } from '../components/Toast';

export default function RescuePage() {
  const { addToast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'collected', 'discarded'
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    food_name: '',
    category: 'Prepared Meal',
    quantity: '',
    prep_datetime: new Date().toISOString().slice(0, 16),
    storage_condition: 'Refrigerated (0-4°C)',
    pickup_location: '',
    notes: '',
    safety_acknowledged: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getRescueRecords();
      setRecords(data.records || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load surplus food records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.food_name || !formData.quantity || !formData.pickup_location) {
      addToast('Please complete all required fields.', 'warning');
      return;
    }

    if (!formData.safety_acknowledged) {
      addToast('You must acknowledge the Food Safety Verification requirement.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createRescueRecord(formData);
      addToast('Surplus food successfully listed for rescue!', 'success');
      setFormData({
        food_name: '',
        category: 'Prepared Meal',
        quantity: '',
        prep_datetime: new Date().toISOString().slice(0, 16),
        storage_condition: 'Refrigerated (0-4°C)',
        pickup_location: '',
        notes: '',
        safety_acknowledged: false,
      });
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateRescueStatus(id, status);
      addToast(`Item marked as ${status}.`, 'success');
      fetchRecords();
    } catch (err) {
      addToast(`Update failed: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rescue listing?')) return;
    try {
      await deleteRescueRecord(id);
      addToast('Listing deleted successfully.', 'info');
      fetchRecords();
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-eco-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-eco-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-card text-eco-emerald text-xs font-semibold uppercase tracking-wider mb-2 border border-eco-emerald/20">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>NutriFeast Surplus Redistribution</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-eco-text tracking-tight">
            NutriFeast Food Rescue
          </h1>
          <p className="text-sm text-eco-muted mt-1">
            Log wholesome surplus food batches to coordinate responsible redistribution before items enter the waste stream.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-eco-green to-eco-emerald text-eco-bg font-heading font-bold text-sm shadow-lg shadow-eco-green/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'List Surplus Food'}</span>
        </button>
      </div>

      {/* Prominent Food Safety Warning Banner */}
      <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-4 shadow-lg backdrop-blur-md">
        <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <h4 className="font-heading font-bold text-amber-300 text-sm">
            Mandatory Food Safety Verification Warning
          </h4>
          <p>
            Image recognition cannot determine whether food is safe to consume. Redistribution requires appropriate food safety verification.
          </p>
          <p className="text-amber-300/80">
            Always inspect temperature, scent, expiration dates, allergen labeling, and storage history according to local health standards.
          </p>
        </div>
      </div>

      {/* Listing Form Drawer / Modal / Inline Card */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 rounded-2xl glass-panel border border-eco-green/30 space-y-6 shadow-2xl animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-4 border-b border-eco-border">
            <h3 className="font-heading font-bold text-xl text-eco-text flex items-center gap-2">
              <Package className="w-5 h-5 text-eco-green" />
              <span>Record Surplus Food Batch</span>
            </h3>
            <span className="text-xs text-eco-muted">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-eco-text mb-1.5">
                Food Name / Description *
              </label>
              <input
                type="text"
                name="food_name"
                value={formData.food_name}
                onChange={handleInputChange}
                placeholder="e.g. Fresh Ripe Bananas or Cooked Rice Trays"
                className="w-full px-4 py-2.5 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-eco-text text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-eco-text mb-1.5">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-eco-text text-sm outline-none"
              >
                <option value="Fresh Produce">Fresh Produce (Fruits / Veg)</option>
                <option value="Prepared Meal">Prepared Meal (Catering / Kitchen)</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Dairy & Chilled">Dairy & Chilled</option>
                <option value="Pantry Goods">Packaged / Pantry Goods</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-eco-text mb-1.5">Approximate Quantity *</label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="e.g. 5 kg, 12 portions, 3 boxes"
                className="w-full px-4 py-2.5 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-eco-text text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-eco-text mb-1.5">
                Preparation / Harvest Date & Time
              </label>
              <input
                type="datetime-local"
                name="prep_datetime"
                value={formData.prep_datetime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-eco-text text-sm outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-eco-text mb-1.5">Storage Conditions</label>
              <select
                name="storage_condition"
                value={formData.storage_condition}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-eco-text text-sm outline-none"
              >
                <option value="Refrigerated (0-4°C)">Refrigerated (0-4°C)</option>
                <option value="Hot Hold (Above 63°C)">Hot Hold (Above 63°C)</option>
                <option value="Frozen (-18°C)">Frozen (-18°C)</option>
                <option value="Ambient Dry (15-22°C)">Ambient Dry (15-22°C)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-eco-text mb-1.5">Pickup Location *</label>
              <input
                type="text"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleInputChange}
                placeholder="e.g. Main Cafeteria Kitchen, Dock B"
                className="w-full px-4 py-2.5 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-eco-text text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-eco-text mb-1.5 text-xs">
              Allergen & Handling Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              placeholder="e.g. Contains gluten. Packed in clean sanitized foil trays at 12:30 PM."
              className="w-full px-4 py-2.5 rounded-xl bg-eco-surface border border-eco-border focus:border-eco-green text-eco-text text-sm outline-none"
            />
          </div>

          {/* Mandatory Checkbox */}
          <div className="p-4 rounded-xl bg-eco-surface border border-eco-border flex items-start gap-3">
            <input
              type="checkbox"
              id="safety_acknowledged"
              name="safety_acknowledged"
              checked={formData.safety_acknowledged}
              onChange={handleInputChange}
              className="mt-1 w-4 h-4 rounded text-eco-green bg-eco-card border-eco-border focus:ring-0 cursor-pointer"
              required
            />
            <label htmlFor="safety_acknowledged" className="text-xs text-eco-muted cursor-pointer">
              <span className="font-bold text-eco-text">Food Safety Declaration: </span>
              I acknowledge that AI image detection alone cannot determine food safety, and I have physically verified that this food batch has been handled in compliance with hygiene and temperature guidelines.
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl bg-eco-card hover:bg-eco-card-hover text-eco-muted hover:text-eco-text text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-eco-green to-eco-emerald text-eco-bg font-heading font-bold text-sm shadow-lg shadow-eco-green/20 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving to Database...' : 'Confirm Surplus Listing'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-eco-border pb-3">
        {['all', 'available', 'collected', 'discarded'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === status
                ? 'bg-eco-card text-eco-green border border-eco-green/30 shadow'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            {status} ({records.filter((r) => status === 'all' || r.status === status).length})
          </button>
        ))}
      </div>

      {/* Records Grid */}
      {loading ? (
        <div className="py-16 text-center text-eco-muted">
          <div className="w-8 h-8 border-2 border-eco-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading NutriFeast records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel border border-eco-border text-eco-muted">
          <HeartHandshake className="w-12 h-12 text-eco-muted/50 mx-auto mb-3" />
          <h4 className="font-heading font-bold text-base text-eco-text mb-1">
            No Surplus Food Records Found
          </h4>
          <p className="text-xs max-w-sm mx-auto mb-4">
            Click "List Surplus Food" above to log extra wholesome food for redistribution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl glass-card border border-eco-border hover:border-eco-green/30 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-eco-surface text-eco-lime border border-eco-border">
                      {item.category}
                    </span>
                    <h3 className="font-heading font-bold text-base text-eco-text mt-1.5">
                      {item.food_name}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'available'
                      ? 'bg-eco-green/15 text-eco-green border border-eco-green/30'
                      : item.status === 'collected'
                      ? 'bg-sky-400/15 text-sky-400 border border-sky-400/30'
                      : 'bg-eco-red/15 text-eco-red border border-eco-red/30'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-eco-muted">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-eco-green" />
                    <span>Quantity: <strong className="text-eco-text">{item.quantity}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-eco-lime" />
                    <span>Storage: {item.storage_condition}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-eco-emerald" />
                    <span>Pickup: {item.pickup_location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-eco-muted" />
                    <span>Prepared: {item.prep_datetime ? item.prep_datetime.replace('T', ' ') : 'N/A'}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-eco-muted/90 bg-eco-surface/60 p-2.5 rounded-lg border border-eco-border italic">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-eco-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {item.status !== 'collected' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'collected')}
                      className="px-2.5 py-1 rounded-lg bg-eco-surface hover:bg-eco-green/20 text-eco-green border border-eco-border text-[11px] font-medium transition-colors"
                      title="Mark as collected by recipient"
                    >
                      Collected
                    </button>
                  )}
                  {item.status !== 'discarded' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'discarded')}
                      className="px-2.5 py-1 rounded-lg bg-eco-surface hover:bg-eco-red/20 text-eco-red border border-eco-border text-[11px] font-medium transition-colors"
                      title="Mark as discarded"
                    >
                      Discarded
                    </button>
                  )}
                  {item.status !== 'available' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'available')}
                      className="px-2.5 py-1 rounded-lg bg-eco-surface hover:bg-eco-card text-eco-muted hover:text-eco-text border border-eco-border text-[11px] font-medium transition-colors"
                    >
                      Re-list
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-eco-muted hover:text-eco-red transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
