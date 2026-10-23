import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ecovision.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Scans table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_uid TEXT UNIQUE NOT NULL,
            timestamp TEXT NOT NULL,
            image_filename TEXT NOT NULL,
            annotated_filename TEXT NOT NULL,
            detected_objects TEXT NOT NULL, -- JSON string
            object_count INTEGER NOT NULL,
            primary_category TEXT NOT NULL,
            confidence_avg REAL NOT NULL,
            segregation_summary TEXT NOT NULL, -- JSON string
            environmental_tip TEXT,
            status TEXT DEFAULT 'completed'
        )
    ''')
    
    # Surplus Food Rescue table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS surplus_food (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            food_name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity TEXT NOT NULL,
            prep_datetime TEXT NOT NULL,
            storage_condition TEXT NOT NULL,
            pickup_location TEXT NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'available', -- 'available', 'collected', 'discarded'
            created_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

def save_scan(scan_uid, image_filename, annotated_filename, detected_objects, primary_category, confidence_avg, segregation_summary, environmental_tip):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    
    cursor.execute('''
        INSERT INTO scans (
            scan_uid, timestamp, image_filename, annotated_filename, 
            detected_objects, object_count, primary_category, 
            confidence_avg, segregation_summary, environmental_tip
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        scan_uid,
        now_iso,
        image_filename,
        annotated_filename,
        json.dumps(detected_objects),
        len(detected_objects),
        primary_category,
        confidence_avg,
        json.dumps(segregation_summary),
        environmental_tip
    ))
    
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return scan_id

def update_scan_confirmation(scan_id, confirmed_objects, primary_category, confidence_avg, segregation_summary, environmental_tip):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE scans 
        SET detected_objects = ?,
            object_count = ?,
            primary_category = ?,
            confidence_avg = ?,
            segregation_summary = ?,
            environmental_tip = ?,
            status = 'confirmed'
        WHERE id = ?
    ''', (
        json.dumps(confirmed_objects),
        len(confirmed_objects),
        primary_category,
        confidence_avg,
        json.dumps(segregation_summary),
        environmental_tip,
        scan_id
    ))
    
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def get_all_scans(limit=100, search_query="", category_filter=""):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM scans WHERE 1=1"
    params = []
    
    if category_filter and category_filter != "all":
        query += " AND primary_category = ?"
        params.append(category_filter)
        
    if search_query:
        query += " AND (detected_objects LIKE ? OR primary_category LIKE ?)"
        params.append(f"%{search_query}%")
        params.append(f"%{search_query}%")
        
    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    scans = []
    for r in rows:
        scans.append({
            "id": r["id"],
            "scan_uid": r["scan_uid"],
            "timestamp": r["timestamp"],
            "image_filename": r["image_filename"],
            "annotated_filename": r["annotated_filename"],
            "detected_objects": json.loads(r["detected_objects"]) if r["detected_objects"] else [],
            "object_count": r["object_count"],
            "primary_category": r["primary_category"],
            "confidence_avg": r["confidence_avg"],
            "segregation_summary": json.loads(r["segregation_summary"]) if r["segregation_summary"] else {},
            "environmental_tip": r["environmental_tip"],
            "status": r["status"]
        })
        
    conn.close()
    return scans

def delete_scan(scan_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT image_filename, annotated_filename FROM scans WHERE id = ?", (scan_id,))
    row = cursor.fetchone()
    
    if row:
        cursor.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
        conn.commit()
        conn.close()
        return dict(row)
    conn.close()
    return None

def add_surplus_food(food_name, category, quantity, prep_datetime, storage_condition, pickup_location, notes=""):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    
    cursor.execute('''
        INSERT INTO surplus_food (
            food_name, category, quantity, prep_datetime,
            storage_condition, pickup_location, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'available', ?)
    ''', (
        food_name, category, quantity, prep_datetime,
        storage_condition, pickup_location, notes, now_iso
    ))
    
    item_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return item_id

def get_surplus_food_records():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM surplus_food ORDER BY id DESC")
    rows = cursor.fetchall()
    
    items = []
    for r in rows:
        items.append({
            "id": r["id"],
            "food_name": r["food_name"],
            "category": r["category"],
            "quantity": r["quantity"],
            "prep_datetime": r["prep_datetime"],
            "storage_condition": r["storage_condition"],
            "pickup_location": r["pickup_location"],
            "notes": r["notes"],
            "status": r["status"],
            "created_at": r["created_at"]
        })
    conn.close()
    return items

def update_surplus_status(item_id, new_status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE surplus_food SET status = ? WHERE id = ?", (new_status, item_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def delete_surplus_food(item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM surplus_food WHERE id = ?", (item_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def get_analytics_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Counts
    cursor.execute("SELECT COUNT(*) FROM scans")
    total_scans = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(object_count) FROM scans")
    sum_objects = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM scans WHERE primary_category = 'Organic / Compostable'")
    organic_scans = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM scans WHERE primary_category LIKE '%Recyclable%'")
    recyclable_scans = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM scans WHERE primary_category = 'Manual Review'")
    manual_review_scans = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM surplus_food")
    total_rescue = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM surplus_food WHERE status = 'available'")
    available_rescue = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM surplus_food WHERE status = 'collected'")
    collected_rescue = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM surplus_food WHERE status = 'discarded'")
    discarded_rescue = cursor.fetchone()[0]
    
    # Category distribution across all detected objects
    cursor.execute("SELECT detected_objects FROM scans")
    all_scan_objs = cursor.fetchall()
    
    category_counts = {
        "Organic / Compostable": 0,
        "Recyclable (Verify Material)": 0,
        "General / Mixed Waste": 0,
        "Manual Review": 0
    }
    
    for row in all_scan_objs:
        if row[0]:
            try:
                items = json.loads(row[0])
                for it in items:
                    cat = it.get("category", "Manual Review")
                    if "Organic" in cat:
                        category_counts["Organic / Compostable"] += 1
                    elif "Recyclable" in cat:
                        category_counts["Recyclable (Verify Material)"] += 1
                    elif "General" in cat:
                        category_counts["General / Mixed Waste"] += 1
                    else:
                        category_counts["Manual Review"] += 1
            except Exception:
                pass
                
    # Daily activity (last 7 days of scans)
    cursor.execute('''
        SELECT substr(timestamp, 1, 10) as scan_date, count(*) as count, sum(object_count) as objects
        FROM scans
        GROUP BY scan_date
        ORDER BY scan_date ASC
        LIMIT 14
    ''')
    daily_rows = cursor.fetchall()
    daily_activity = [{"date": r["scan_date"], "scans": r["count"], "objects": r["objects"] or 0} for r in daily_rows]
    
    conn.close()
    
    return {
        "total_scans": total_scans,
        "total_objects": sum_objects,
        "organic_scans": organic_scans,
        "recyclable_scans": recyclable_scans,
        "manual_review_scans": manual_review_scans,
        "total_rescue": total_rescue,
        "available_rescue": available_rescue,
        "collected_rescue": collected_rescue,
        "discarded_rescue": discarded_rescue,
        "category_distribution": [
            {"name": "Organic / Compostable", "value": category_counts["Organic / Compostable"], "color": "#4ADE80"},
            {"name": "Recyclable (Verify Material)", "value": category_counts["Recyclable (Verify Material)"], "color": "#10B981"},
            {"name": "General / Mixed Waste", "value": category_counts["General / Mixed Waste"], "color": "#F59E0B"},
            {"name": "Manual Review", "value": category_counts["Manual Review"], "color": "#64748B"}
        ],
        "daily_activity": daily_activity,
        "rescue_status_distribution": [
            {"name": "Available for Rescue", "value": available_rescue, "color": "#4ADE80"},
            {"name": "Successfully Collected", "value": collected_rescue, "color": "#10B981"},
            {"name": "Discarded / Expired", "value": discarded_rescue, "color": "#EF4444"}
        ]
    }
