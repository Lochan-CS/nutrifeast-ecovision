import os
import cv2
import numpy as np
from PIL import Image
from segregation import classify_detected_object, synthesize_scan_recommendations

# Paths setup
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BACKEND_DIR, "models")
UPLOADS_DIR = os.path.join(BACKEND_DIR, "uploads")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Cache loaded models in memory (Do not reload on every request!)
_loaded_models = {}
_load_errors = {}

def get_yolo_model(model_name: str = "yolov8n"):
    """
    Lazily loads and caches YOLOv8 models in memory.
    Supports 'yolov8n' (default) and 'yolov8s' (enhanced accuracy).
    """
    global _loaded_models, _load_errors
    
    clean_name = "yolov8s" if "s" in model_name.lower() else "yolov8n"
    
    if clean_name in _loaded_models:
        return _loaded_models[clean_name], None
        
    try:
        from ultralytics import YOLO
        model_filename = f"{clean_name}.pt"
        model_path = os.path.join(MODELS_DIR, model_filename)
        
        # Check local models dir or current dir
        if os.path.exists(model_path):
            model = YOLO(model_path)
        elif os.path.exists(model_filename):
            model = YOLO(model_filename)
        else:
            # Download and save
            model = YOLO(model_filename)
            try:
                import shutil
                if os.path.exists(model_filename) and not os.path.exists(model_path):
                    shutil.copy(model_filename, model_path)
            except Exception:
                pass
                
        _loaded_models[clean_name] = model
        _load_errors[clean_name] = None
        return model, None
    except Exception as e:
        _load_errors[clean_name] = str(e)
        # Fallback to yolov8n if yolov8s had an issue
        if clean_name != "yolov8n" and "yolov8n" in _loaded_models:
            return _loaded_models["yolov8n"], None
        return None, str(e)

def analyze_image_with_yolo(
    input_image_path: str, 
    scan_uid: str, 
    conf_threshold: float = 0.20,
    iou_threshold: float = 0.45,
    model_name: str = "yolov8n",
    imgsz: int = 640
):
    """
    Runs real YOLOv8 inference with configurable thresholds, NMS, and multi-model support.
    Extracts all supported detection classes, flags uncertain detections, and draws high-contrast bounding boxes.
    """
    model, err = get_yolo_model(model_name)
    if err or model is None:
        # Fallback attempt to yolov8n
        model, err = get_yolo_model("yolov8n")
        if err or model is None:
            raise RuntimeError(f"YOLOv8 Model initialization failed: {err}")

    # Read image using cv2.imdecode with np.fromfile to handle Windows unicode paths reliably
    try:
        with open(input_image_path, "rb") as f:
            bytes_data = bytearray(f.read())
            np_arr = np.asarray(bytes_data, dtype=np.uint8)
            cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    except Exception:
        cv_img = cv2.imread(input_image_path)

    if cv_img is None:
        try:
            pil_img = Image.open(input_image_path).convert("RGB")
            cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            raise ValueError(f"Could not read image file at {input_image_path}. Unsupported format or corrupted file.")

    height, width, _ = cv_img.shape
    
    # Run YOLO inference with NMS settings and configurable thresholds
    # We do NOT restrict classes - all detected objects are preserved
    results = model.predict(
        source=cv_img, 
        conf=conf_threshold,
        iou=iou_threshold,
        imgsz=imgsz,
        agnostic_nms=True,
        max_det=300,
        verbose=False
    )
    result = results[0]
    
    detections = []
    annotated_img = cv_img.copy()
    
    # Eco theme BGR colors for OpenCV bounding boxes
    COLOR_ORGANIC = (128, 222, 74)      # #4ADE80
    COLOR_RECYCLE = (129, 185, 16)      # #10B981
    COLOR_CONTAINER = (100, 242, 190)   # #BEF264
    COLOR_GENERAL = (11, 158, 245)      # #F59E0B
    COLOR_UNCERTAIN = (40, 160, 255)    # Orange for uncertain
    COLOR_DEFAULT = (148, 163, 184)     # slate gray
    
    if len(result.boxes) > 0:
        for idx, box in enumerate(result.boxes):
            cls_id = int(box.cls[0].item())
            class_name = result.names.get(cls_id, f"object_{cls_id}")
            confidence = float(box.conf[0].item())
            xyxy = box.xyxy[0].cpu().numpy().astype(int)
            x1, y1, x2, y2 = xyxy
            
            # Segregation enrichment
            classification = classify_detected_object(class_name, confidence, source="ai")
            
            detections.append({
                "id": idx + 1,
                "class_name": class_name,
                "display_name": classification["display_name"],
                "confidence": classification["confidence"],
                "is_uncertain": classification["is_uncertain"],
                "source": "ai",
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "category": classification["category"],
                "handling": classification["handling"],
                "segregation_tip": classification["segregation_tip"],
                "environmental_impact": classification["environmental_impact"],
                "is_edible_candidate": classification["is_edible_candidate"],
                "badge_color": classification["badge_color"],
                "rule_basis": classification["rule_basis"]
            })
            
            # Select color based on category and certainty
            cat = classification["category"]
            if classification["is_uncertain"]:
                box_color = COLOR_UNCERTAIN
            elif "Organic" in cat:
                box_color = COLOR_ORGANIC
            elif "Recyclable" in cat:
                box_color = COLOR_RECYCLE
            elif "Container" in cat:
                box_color = COLOR_CONTAINER
            elif "General" in cat:
                box_color = COLOR_GENERAL
            else:
                box_color = COLOR_DEFAULT
                
            # Draw sleek bounding box
            line_thickness = max(2, int(min(width, height) / 320))
            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), box_color, line_thickness)
            
            # Label banner
            uncertain_flag = " [Review]" if classification["is_uncertain"] else ""
            label_text = f"{classification['display_name']} {classification['confidence']}%{uncertain_flag}"
            font_scale = max(0.42, min(width, height) / 1100)
            font_thickness = max(1, int(line_thickness / 2))
            (text_w, text_h), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
            
            # Background tag for label
            tag_y1 = max(0, y1 - text_h - 10)
            tag_y2 = y1
            tag_x2 = min(width, x1 + text_w + 14)
            cv2.rectangle(annotated_img, (x1, tag_y1), (tag_x2, tag_y2), box_color, -1)
            
            # Text on badge
            text_color = (20, 20, 20) if not classification["is_uncertain"] else (255, 255, 255)
            cv2.putText(
                annotated_img, 
                label_text, 
                (x1 + 6, tag_y2 - 5), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                font_scale, 
                text_color, 
                font_thickness, 
                cv2.LINE_AA
            )
            
    # Save annotated image
    annotated_filename = f"annotated_{scan_uid}.jpg"
    annotated_path = os.path.join(UPLOADS_DIR, annotated_filename)
    try:
        is_success, buffer = cv2.imencode(".jpg", annotated_img)
        if is_success:
            with open(annotated_path, "wb") as f:
                f.write(buffer)
        else:
            cv2.imwrite(annotated_path, annotated_img)
    except Exception:
        cv2.imwrite(annotated_path, annotated_img)
    
    # Compute synthesized recommendations
    summary = synthesize_scan_recommendations(detections)
    conf_avg = round(sum(d["confidence"] for d in detections) / len(detections), 1) if detections else 0.0
    
    return {
        "annotated_filename": annotated_filename,
        "detections": detections,
        "object_count": len(detections),
        "confidence_avg": conf_avg,
        "summary": summary,
        "model_used": "yolov8s (Enhanced)" if "s" in model_name.lower() else "yolov8n (Fast Edge)"
    }
