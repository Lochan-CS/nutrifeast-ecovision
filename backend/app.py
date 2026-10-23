import os
import uuid
import csv
import io
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename

import database
from detector import analyze_image_with_yolo, get_yolo_model

from segregation import classify_detected_object, synthesize_scan_recommendations

app = Flask(__name__)
# Enable CORS for local Vite dev server and all local interfaces
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Configurations
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB max upload

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize database on startup
database.init_db()

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    """Serves uploaded and annotated images directly."""
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health status and AI model readiness."""
    model, err = get_yolo_model("yolov8n")
    return jsonify({
        "status": "healthy" if err is None else "degraded",
        "service": "NutriFeast EcoVision Backend",
        "yolo_ready": err is None,
        "yolo_error": err,
        "models_available": ["yolov8n (Fast Edge)", "yolov8s (Enhanced Accuracy)"],
        "device": "cpu",
        "version": "1.1.0"
    }), 200

@app.route("/api/analyze", methods=["POST"])
def analyze_image():
    """
    Main AI Vision endpoint.
    Uploads user image, runs real YOLOv8 inference with configurable confidence, IoU, and model selection.
    Records scan in SQLite, and returns comprehensive segregation recommendations.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file provided in request."}), 400
        
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename submitted."}), 400
        
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file format. Supported formats: JPG, JPEG, PNG, WEBP."}), 400

    # Configurable parameters
    conf_threshold = float(request.form.get("conf_threshold", 0.20))
    iou_threshold = float(request.form.get("iou_threshold", 0.45))
    model_name = request.form.get("model_name", "yolov8n").strip()

    scan_uid = str(uuid.uuid4())[:8]
    ext = file.filename.rsplit(".", 1)[1].lower()
    original_filename = f"scan_{scan_uid}.{ext}"
    original_filepath = os.path.join(app.config["UPLOAD_FOLDER"], original_filename)
    
    file.save(original_filepath)
    
    try:
        # Run real YOLOv8 inference with custom parameters
        inference_result = analyze_image_with_yolo(
            input_image_path=original_filepath,
            scan_uid=scan_uid,
            conf_threshold=conf_threshold,
            iou_threshold=iou_threshold,
            model_name=model_name
        )
        
        annotated_filename = inference_result["annotated_filename"]
        detections = inference_result["detections"]
        summary = inference_result["summary"]
        confidence_avg = inference_result["confidence_avg"]
        primary_category = summary["primary_category"]
        environmental_tip = summary["environmental_tip"]
        model_used = inference_result.get("model_used", model_name)
        
        # Persist scan into SQLite
        scan_id = database.save_scan(
            scan_uid=scan_uid,
            image_filename=original_filename,
            annotated_filename=annotated_filename,
            detected_objects=detections,
            primary_category=primary_category,
            confidence_avg=confidence_avg,
            segregation_summary=summary,
            environmental_tip=environmental_tip
        )
        
        return jsonify({
            "success": True,
            "scan_id": scan_id,
            "scan_uid": scan_uid,
            "original_image_url": f"/uploads/{original_filename}",
            "annotated_image_url": f"/uploads/{annotated_filename}",
            "detected_objects": detections,
            "object_count": len(detections),
            "confidence_avg": confidence_avg,
            "primary_category": primary_category,
            "segregation_summary": summary,
            "environmental_tip": environmental_tip,
            "model_used": model_used,
            "message": "Detection completed successfully." if detections else "No supported objects detected. Try another image or add items manually."
        }), 200
        
    except Exception as e:
        app.logger.error(f"Inference error: {str(e)}")
        return jsonify({
            "error": f"Image processing failed: {str(e)}",
            "success": False
        }), 500

@app.route("/api/scans/<int:scan_id>/confirm", methods=["POST", "PUT"])
def confirm_scan(scan_id):
    """
    User-Assisted Waste Identification & Confirmation endpoint.
    Allows users to confirm, correct, or add waste categories for mixed waste piles.
    Recalibrates segregation recommendations and updates the SQLite database.
    """
    try:
        data = request.get_json() or {}
        items = data.get("confirmed_objects", [])
        
        if not items:
            return jsonify({"error": "No items provided for confirmation."}), 400
            
        enriched_items = []
        for idx, it in enumerate(items):
            display_name = it.get("display_name") or it.get("class_name") or "Waste Item"
            confidence = float(it.get("confidence", 100.0))
            source = it.get("source", "user")
            
            # Classify through rule engine
            meta = classify_detected_object(display_name, confidence / 100.0, source=source)
            # Keep any custom user attributes
            enriched = {
                "id": idx + 1,
                "class_name": it.get("class_name") or display_name.lower(),
                "display_name": meta["display_name"],
                "category": it.get("category") or meta["category"],
                "confidence": meta["confidence"],
                "is_uncertain": False if source == "user" else meta.get("is_uncertain", False),
                "source": source,
                "handling": meta["handling"],
                "segregation_tip": meta["segregation_tip"],
                "environmental_impact": meta["environmental_impact"],
                "badge_color": meta["badge_color"],
                "rule_basis": meta["rule_basis"]
            }
            if "bbox" in it:
                enriched["bbox"] = it["bbox"]
            enriched_items.append(enriched)
            
        # Recompute segregation summary
        summary = synthesize_scan_recommendations(enriched_items)
        primary_category = summary["primary_category"]
        environmental_tip = summary["environmental_tip"]
        conf_avg = round(sum(d["confidence"] for d in enriched_items) / len(enriched_items), 1) if enriched_items else 0.0
        
        updated = database.update_scan_confirmation(
            scan_id=scan_id,
            confirmed_objects=enriched_items,
            primary_category=primary_category,
            confidence_avg=conf_avg,
            segregation_summary=summary,
            environmental_tip=environmental_tip
        )
        
        if not updated:
            return jsonify({"error": f"Scan #{scan_id} not found."}), 404
            
        return jsonify({
            "success": True,
            "scan_id": scan_id,
            "message": "Scan results verified and successfully saved to database.",
            "detected_objects": enriched_items,
            "object_count": len(enriched_items),
            "confidence_avg": conf_avg,
            "primary_category": primary_category,
            "segregation_summary": summary,
            "environmental_tip": environmental_tip
        }), 200
            
    except Exception as e:
        app.logger.error(f"Confirmation error: {str(e)}")
        return jsonify({
            "error": f"Confirmation update failed: {str(e)}",
            "success": False
        }), 500

@app.route("/api/scans", methods=["GET"])
def get_scans():
    """Fetches scan history with optional search and category filters."""
    query = request.args.get("query", "")
    category = request.args.get("category", "")
    limit = int(request.args.get("limit", 100))
    
    scans = database.get_all_scans(limit=limit, search_query=query, category_filter=category)
    return jsonify({"scans": scans, "count": len(scans)}), 200

@app.route("/api/scans/<int:scan_id>", methods=["DELETE"])
def delete_scan(scan_id):
    """Deletes a scan and cleans up associated images."""
    deleted_info = database.delete_scan(scan_id)
    if not deleted_info:
        return jsonify({"error": "Scan record not found."}), 404
        
    # Attempt to remove image files
    try:
        if deleted_info.get("image_filename"):
            orig_p = os.path.join(app.config["UPLOAD_FOLDER"], deleted_info["image_filename"])
            if os.path.exists(orig_p):
                os.remove(orig_p)
        if deleted_info.get("annotated_filename"):
            ann_p = os.path.join(app.config["UPLOAD_FOLDER"], deleted_info["annotated_filename"])
            if os.path.exists(ann_p):
                os.remove(ann_p)
    except Exception as e:
        app.logger.warning(f"File cleanup warning: {e}")
        
    return jsonify({"success": True, "message": f"Scan #{scan_id} deleted successfully."}), 200

@app.route("/api/scans/export/csv", methods=["GET"])
def export_scans_csv():
    """Generates and downloads a CSV export of all scan records."""
    scans = database.get_all_scans(limit=1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Scan ID", "Timestamp", "Primary Category", "Object Count", "Avg Confidence (%)", "Detected Items", "Environmental Tip"])
    
    for s in scans:
        items_str = ", ".join([f"{d.get('display_name')}({d.get('confidence')}%)" for d in s.get("detected_objects", [])])
        writer.writerow([
            s["scan_uid"],
            s["timestamp"],
            s["primary_category"],
            s["object_count"],
            s["confidence_avg"],
            items_str,
            s["environmental_tip"] or ""
        ])
        
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment;filename=nutrifeast_ecovision_scans.csv"}
    )

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    """Returns analytics data aggregated from SQLite."""
    try:
        data = database.get_analytics_data()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/rescue", methods=["GET"])
def get_rescue_records():
    """Lists all NutriFeast surplus food records."""
    records = database.get_surplus_food_records()
    return jsonify({"records": records, "count": len(records)}), 200

@app.route("/api/rescue", methods=["POST"])
def create_rescue_record():
    """
    Creates a new surplus food rescue listing.
    Includes mandatory food safety acknowledgement.
    """
    data = request.get_json() or {}
    
    food_name = data.get("food_name", "").strip()
    category = data.get("category", "Prepared Meal").strip()
    quantity = data.get("quantity", "").strip()
    prep_datetime = data.get("prep_datetime", "").strip()
    storage_condition = data.get("storage_condition", "Refrigerated (0-4°C)").strip()
    pickup_location = data.get("pickup_location", "").strip()
    notes = data.get("notes", "").strip()
    safety_acknowledged = data.get("safety_acknowledged", False)
    
    if not food_name or not quantity or not pickup_location:
        return jsonify({"error": "Food name, quantity, and pickup location are required."}), 400
        
    if not safety_acknowledged:
        return jsonify({"error": "Food safety verification acknowledgment is mandatory."}), 400
        
    item_id = database.add_surplus_food(
        food_name=food_name,
        category=category,
        quantity=quantity,
        prep_datetime=prep_datetime,
        storage_condition=storage_condition,
        pickup_location=pickup_location,
        notes=notes
    )
    
    return jsonify({
        "success": True,
        "item_id": item_id,
        "message": "Surplus food listed successfully for NutriFeast Food Rescue."
    }), 201

@app.route("/api/rescue/<int:item_id>", methods=["PATCH"])
def update_rescue_status(item_id):
    """Updates status: available, collected, discarded."""
    data = request.get_json() or {}
    status = data.get("status", "")
    
    if status not in ["available", "collected", "discarded"]:
        return jsonify({"error": "Invalid status. Allowed: available, collected, discarded."}), 400
        
    updated = database.update_surplus_status(item_id, status)
    if not updated:
        return jsonify({"error": "Surplus food record not found."}), 404
        
    return jsonify({"success": True, "message": f"Status updated to '{status}'."}), 200

@app.route("/api/rescue/<int:item_id>", methods=["DELETE"])
def delete_rescue_record(item_id):
    """Deletes a surplus food rescue record."""
    deleted = database.delete_surplus_food(item_id)
    if not deleted:
        return jsonify({"error": "Record not found."}), 404
    return jsonify({"success": True, "message": "Record deleted."}), 200

if __name__ == "__main__":
    print("Starting NutriFeast EcoVision Backend on http://127.0.0.1:5000...")
    app.run(host="127.0.0.1", port=5000, debug=False)
