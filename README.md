# NutriFeast EcoVision — AI Food Waste Intelligence Platform

> **See the Waste. Save the Food. Protect the Planet.**  
> *AI-Powered Food Waste Intelligence*

NutriFeast EcoVision is a full-stack, AI-driven food waste intelligence and segregation platform. It combines edge-based computer vision (**Ultralytics YOLOv8**) with deterministic rule-based waste segregation taxonomies, surplus food recovery logging (**NutriFeast Food Rescue**), and live telemetry analytics.

---

## 🌿 Problem Statement

Global food waste exceeds 1.3 billion tonnes annually. When organic waste decomposes in municipal landfills without oxygen, it generates massive plumes of methane ($CH_4$), a greenhouse gas over 28 times more potent than carbon dioxide at trapping atmospheric heat. Simultaneously, recyclable paper, cardboard, and rigid polymers are routinely discarded or rejected at municipal recovery facilities due to cross-contamination with food residues and grease.

---

## 💡 Proposed Solution

NutriFeast EcoVision intercepts food and packaging waste at the source:
1. **Edge Computer Vision Detection**: Detects food items, beverage containers, and tableware using authentic neural inference.
2. **Transparent Rule-Based Segregation**: Deterministic rules classify detected classes into Organic/Compostable, Recyclable (with material verification), Food Containers (empty first), and Manual Review.
3. **NutriFeast Surplus Food Rescue**: Facilitates peer-to-peer and charity redistribution of untouched food batches, enforcing physical food-safety verification declarations.
4. **Data Analytics & Auditability**: SQLite-backed metrics track diversion patterns with exportable CSV audit logs.

---

## 🔬 Critical AI Distinction: Detection vs. Segregation

> [!IMPORTANT]
> **Ethical & Scientific Transparency**  
> NutriFeast EcoVision utilizes the official `yolov8n.pt` neural model trained on the COCO benchmark. The model identifies visual bounding classes (`apple`, `banana`, `orange`, `bottle`, `cup`, `bowl`, etc.).  
> 
> A standard computer vision model cannot ascertain chemical resin codes (e.g. whether a bottle is PET #1 or PVC #3) nor whether a paper cup has a polyethylene moisture liner. EcoVision **does not fabricate certainty**:
> - AI object classes are strictly separated from disposal guidance.
> - Packaging items trigger explicit **material verification requirements**.
> - Food safety is explicitly guarded: visual models cannot test for bacterial spoilage.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Recharts |
| **Design System** | Custom Dark Eco Palette (`#071711`, `#123126`, `#4ADE80`), Glassmorphism, Responsive Drawer |
| **Backend** | Python 3.11+, Flask, Flask-CORS, Werkzeug |
| **AI / Computer Vision** | Ultralytics YOLOv8 (`yolov8n.pt`), OpenCV (`cv2`), Pillow, NumPy |
| **Database** | SQLite3 (`ecovision.db`) |
| **Platform** | Windows 11 / Edge CPU Inference (Zero API keys, zero cloud costs) |

---

## 🚀 Key Features

1. **AI Waste Scanner**:
   - Drag-and-drop image upload with live file preview.
   - 1-click demo test buttons for fresh produce and beverage packaging.
   - Real-time YOLOv8 bounding box generation with high-contrast coordinate rendering.
   - Side-by-side comparison between raw photograph and annotated vision output.
   - Confidence percentage calculation and rule-basis disclosure.

2. **Smart Waste Segregation Hub**:
   - Comprehensive taxonomy guides covering Organics, Recyclables, Containers, and Manual Review.
   - Contamination mitigation checklists and municipal sorting best practices.

3. **NutriFeast Food Rescue**:
   - Structured registry for surplus food batches (quantity, storage condition, prep time, pickup location).
   - Mandatory food safety verification declaration.
   - Status tracking (`Available`, `Collected`, `Discarded`).

4. **Telemetry & Analytics**:
   - Visualizations using Recharts (Pie/Donut category distribution, daily scan trends, surplus food lifecycle).
   - Real database-driven metrics without synthetic estimations.

5. **Persistent Audit History**:
   - Searchable, filterable scan archive.
   - Detailed modal inspection with original and annotated image comparison.
   - 1-click CSV audit log export.

---

## 📁 Project Architecture

```
NutriFeast EcoVision/
├── backend/
│   ├── app.py                # Flask REST API & static server
│   ├── detector.py           # Real YOLOv8 inference & OpenCV annotation engine
│   ├── segregation.py        # Domain-specific rule-based classification matrix
│   ├── database.py           # SQLite connection layer & telemetry queries
│   ├── seed_demo_data.py     # Initial verification & sample scan seeder
│   ├── requirements.txt      # Python dependencies
│   ├── models/               # YOLOv8 model weights (yolov8n.pt)
│   ├── uploads/              # Uploaded input images and generated annotations
│   └── ecovision.db          # Persistent SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/       # Sidebar, Toast notification system
│   │   ├── pages/            # LandingPage, Scanner, Segregation, Rescue, Analytics, History, About
│   │   ├── services/api.js   # Client HTTP API connector
│   │   ├── App.jsx           # Master navigation & view switcher
│   │   ├── main.jsx          # React DOM root
│   │   └── index.css         # Tailwind directives & glassmorphism utilities
│   ├── public/               # Favicon and local sample images
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Custom eco theme colors
│   └── vite.config.js        # Vite build config with backend proxy
├── sample_images/            # High-resolution benchmark test images
├── run.bat                   # 1-click Windows startup script
└── README.md
```

---

## ⚡ Installation & Execution Guide

### Prerequisites
- Python 3.11, 3.12, or 3.14
- Node.js (v18+) and npm

### Quick Start (Windows)
Double-click `run.bat` in the project root folder. The script will:
1. Verify Python and Node environments.
2. Launch the Flask backend on `http://127.0.0.1:5000`.
3. Launch the Vite frontend on `http://localhost:5173`.
4. Automatically open your default browser.

---

### Manual Start Commands

#### 1. Backend
```powershell
cd backend
python -m pip install -r requirements.txt
python app.py
```
*Backend runs on `http://127.0.0.1:5000`*

#### 2. Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔍 Model Limitations & Future Scope

### Limitations
- **Fine-Grained Packaging Materials**: A standard camera cannot detect whether a black plastic container is recyclable polypropylene (#5) or unrecyclable polystyrene (#6).
- **Food Spoilage**: Optical imagery cannot evaluate microbial counts, internal food acidity, or foodborne pathogens. Physical human inspection remains mandatory.

### Future Scope
- Fine-tuning YOLOv8 on specialized environmental datasets like **TACO** (Trash Annotations in Context).
- Integration with Near-Infrared (NIR) sensors for automated plastic resin identification.
- Direct webhooks to municipal smart-bins and regional food redistribution charities.

---

## 📜 License & Enterprise Deployment
NutriFeast EcoVision Open Platform. Open-source under the MIT License.
