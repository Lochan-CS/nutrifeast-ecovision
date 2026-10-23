"""
Seed initial demonstrative data by running actual YOLOv8 detection on the sample images
and adding initial surplus rescue batches.
"""
import os
import uuid
from detector import analyze_image_with_yolo
import database

def seed():
    database.init_db()
    existing_scans = database.get_all_scans(limit=10)
    
    if len(existing_scans) == 0:
        print("Populating initial real scans from sample images...")
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        sample_fruits = os.path.join(backend_dir, "..", "sample_images", "fruits.jpg")
        sample_packaging = os.path.join(backend_dir, "..", "sample_images", "packaging.jpg")
        
        # Copy to uploads
        import shutil
        uploads_dir = os.path.join(backend_dir, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        
        if os.path.exists(sample_fruits):
            uid_f = "demo_fruit"
            shutil.copy(sample_fruits, os.path.join(uploads_dir, f"scan_{uid_f}.jpg"))
            res_f = analyze_image_with_yolo(os.path.join(uploads_dir, f"scan_{uid_f}.jpg"), uid_f)
            database.save_scan(
                scan_uid=uid_f,
                image_filename=f"scan_{uid_f}.jpg",
                annotated_filename=res_f["annotated_filename"],
                detected_objects=res_f["detections"],
                primary_category=res_f["summary"]["primary_category"],
                confidence_avg=res_f["confidence_avg"],
                segregation_summary=res_f["summary"],
                environmental_tip=res_f["summary"]["environmental_tip"]
            )
            print(f"Seeded real fruit scan: {res_f['object_count']} items.")

        if os.path.exists(sample_packaging):
            uid_p = "demo_pack"
            shutil.copy(sample_packaging, os.path.join(uploads_dir, f"scan_{uid_p}.jpg"))
            res_p = analyze_image_with_yolo(os.path.join(uploads_dir, f"scan_{uid_p}.jpg"), uid_p)
            database.save_scan(
                scan_uid=uid_p,
                image_filename=f"scan_{uid_p}.jpg",
                annotated_filename=res_p["annotated_filename"],
                detected_objects=res_p["detections"],
                primary_category=res_p["summary"]["primary_category"],
                confidence_avg=res_p["confidence_avg"],
                segregation_summary=res_p["summary"],
                environmental_tip=res_p["summary"]["environmental_tip"]
            )
            print(f"Seeded real packaging scan: {res_p['object_count']} items.")

    # Check surplus food
    existing_rescue = database.get_surplus_food_records()
    if len(existing_rescue) == 0:
        print("Seeding initial surplus rescue records...")
        database.add_surplus_food(
            food_name="Fresh Surplus Apples & Bananas",
            category="Fresh Produce",
            quantity="4 kg / ~25 pieces",
            prep_datetime="2026-10-23T11:30",
            storage_condition="Ambient Dry (15-22°C)",
            pickup_location="Central Dining Hall - Loading Dock A",
            notes="Unpeeled, pristine table fruit from morning catered breakfast. Certified safe for consumption."
        )
        database.add_surplus_food(
            food_name="Steamed Vegetable Medley Trays",
            category="Prepared Meal",
            quantity="6 kg (2 large hotel pans)",
            prep_datetime="2026-10-23T13:00",
            storage_condition="Refrigerated (0-4°C)",
            pickup_location="Cafeteria Kitchen Prep Station 3",
            notes="Chilled rapidly within 90 minutes. Sealed in sanitized food-grade stainless containers."
        )
        print("Seeded surplus rescue batches.")

if __name__ == "__main__":
    seed()
