// NutriFeast EcoVision API Client

const BASE_URL = '';

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend health check failed:", err.message);
    return { status: "offline", yolo_ready: false, error: err.message };
  }
}

export async function analyzeImage(imageFile, options = {}) {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (options.conf_threshold !== undefined) {
    formData.append('conf_threshold', options.conf_threshold);
  }
  if (options.iou_threshold !== undefined) {
    formData.append('iou_threshold', options.iou_threshold);
  }
  if (options.model_name) {
    formData.append('model_name', options.model_name);
  }

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to analyze image');
  }
  return data;
}

export async function confirmScan(scanId, confirmedObjects) {
  const res = await fetch(`${BASE_URL}/api/scans/${scanId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmed_objects: confirmedObjects }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to confirm scan');
  }
  return data;
}

export async function getScans(params = {}) {
  const query = new URLSearchParams();
  if (params.query) query.append('query', params.query);
  if (params.category && params.category !== 'all') query.append('category', params.category);
  if (params.limit) query.append('limit', params.limit);

  const res = await fetch(`${BASE_URL}/api/scans?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch scans');
  return await res.json();
}

export async function deleteScan(scanId) {
  const res = await fetch(`${BASE_URL}/api/scans/${scanId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete scan');
  return await res.json();
}

export function getExportCsvUrl() {
  return `${BASE_URL}/api/scans/export/csv`;
}

export async function getAnalytics() {
  const res = await fetch(`${BASE_URL}/api/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return await res.json();
}

export async function getRescueRecords() {
  const res = await fetch(`${BASE_URL}/api/rescue`);
  if (!res.ok) throw new Error('Failed to fetch rescue records');
  return await res.json();
}

export async function createRescueRecord(payload) {
  const res = await fetch(`${BASE_URL}/api/rescue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to list surplus food');
  return data;
}

export async function updateRescueStatus(itemId, status) {
  const res = await fetch(`${BASE_URL}/api/rescue/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update rescue status');
  return data;
}

export async function deleteRescueRecord(itemId) {
  const res = await fetch(`${BASE_URL}/api/rescue/${itemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete record');
  return await res.json();
}
