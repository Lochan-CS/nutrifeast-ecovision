"""
NutriFeast EcoVision - Waste Segregation Intelligence Engine
Provides transparent, rule-based mapping from AI-detected object classes and user-confirmed categories
to waste categories and disposal recommendations.

PRINCIPLES:
1. Clearly distinguish between AI-detected visual bounding labels and domain segregation rules.
2. Clearly distinguish automatic model predictions from user manual additions/corrections.
3. Require material verification for packaging.
4. Promote organic diversion and safe surplus food rescue when suitable.
"""

# Categorization categories
CATEGORY_ORGANIC = "Organic / Compostable"
CATEGORY_RECYCLABLE_VERIFY = "Recyclable (Verify Material)"
CATEGORY_MIXED_CONTAINER = "Food Container - Segregate First"
CATEGORY_GENERAL_OR_VERIFY = "General Waste or Verification Needed"
CATEGORY_MANUAL_REVIEW = "Manual Review / Unknown Material"

# User-selectable waste categories specified by task requirements
USER_SELECTABLE_TAXONOMY = {
    # Organic
    "Fruit peels": {
        "category": CATEGORY_ORGANIC,
        "handling": "Compostable biomass rich in micronutrients and moisture.",
        "tip": "Place in organic bin. Ensure synthetic fruit barcode stickers are peeled off.",
        "impact": "Composting fruit skins diverts heavy wet organic mass from anaerobic landfills."
    },
    "Vegetable scraps": {
        "category": CATEGORY_ORGANIC,
        "handling": "Raw or trimmed vegetable peelings, stalks, and roots.",
        "tip": "Ideal for vermicomposting, municipal green carts, or community composters.",
        "impact": "High nitrogen and carbon content replenishes degraded soil biology."
    },
    "Leftover rice": {
        "category": CATEGORY_ORGANIC,
        "handling": "Cooked carbohydrate food waste.",
        "tip": "Discard in organic waste bin. Note: Rice develops Bacillus cereus rapidly at room temperature; do not leave unrefrigerated if intending donation.",
        "impact": "Decomposes quickly in aerobic compost environments."
    },
    "Bread waste": {
        "category": CATEGORY_ORGANIC,
        "handling": "Stale bakery items, crusts, and flour products.",
        "tip": "Organic food waste bin. Remove plastic bread clips or polyethylene bags first.",
        "impact": "High carbohydrate organic feed suitable for municipal anaerobic digesters."
    },
    "Food leftovers": {
        "category": CATEGORY_ORGANIC,
        "handling": "Mixed prepared meal residues, cooked dishes, and plate scrapings.",
        "tip": "Separate clean organic matter from single-use napkins, foil wrappers, or toothpicks.",
        "impact": "Preventing organic landfilling stops immediate fugitive methane generation."
    },
    "Eggshells": {
        "category": CATEGORY_ORGANIC,
        "handling": "Calcium-rich mineral/organic residue.",
        "tip": "Crush lightly and place in home or commercial compost; enriches compost with calcium carbonate.",
        "impact": "Non-polluting natural mineral that balances compost acidity."
    },
    "Other organic food waste": {
        "category": CATEGORY_ORGANIC,
        "handling": "General biodegradable food biomass.",
        "tip": "Compost or anaerobic digestion. Separate any synthetic liners.",
        "impact": "Keeps organics out of municipal incinerators and landfills."
    },
    # Packaging
    "Plastic containers": {
        "category": CATEGORY_RECYCLABLE_VERIFY,
        "handling": "Rigid plastic tubs, clamshells, or food trays.",
        "tip": "Verify resin identification code (#1 PET, #2 HDPE, #5 PP are widely recycled). Scrape out residual food and rinse before recycling.",
        "impact": "Unrinsed food oils ruin entire plastic recycling batches; washing is essential."
    },
    "Plastic bottles": {
        "category": CATEGORY_RECYCLABLE_VERIFY,
        "handling": "Beverage or condiment bottles.",
        "tip": "Empty liquids, rinse clean, crush to conserve transit volume, and replace caps.",
        "impact": "PET bottles have high post-consumer circularity for closed-loop textile/bottle remanufacturing."
    },
    "Paper packaging": {
        "category": CATEGORY_RECYCLABLE_VERIFY,
        "handling": "Paperboard, grocery bags, and dry packaging.",
        "tip": "Only recycle if clean and dry. Food grease compromises cellulose fiber strength in recycling mills.",
        "impact": "Clean paper recycling saves timber, water, and processing energy."
    },
    "Cardboard": {
        "category": CATEGORY_RECYCLABLE_VERIFY,
        "handling": "Corrugated boxes and shipping cartons.",
        "tip": "Flatten boxes. If contaminated with heavy food grease (e.g. bottom of pizza box), tear off greasy section for compost/landfill.",
        "impact": "Corrugated cardboard has one of the highest recovery rates among all packaging."
    },
    "Metal cans": {
        "category": CATEGORY_RECYCLABLE_VERIFY,
        "handling": "Aluminum drink cans, tin/steel food cans.",
        "tip": "Rinse out food liquids. Aluminum and steel are infinitely recyclable without property loss.",
        "impact": "Recycling aluminum uses 95% less energy than refining primary bauxite ore."
    },
    "Glass containers": {
        "category": CATEGORY_RECYCLABLE_VERIFY,
        "handling": "Glass jars, beverage bottles.",
        "tip": "Rinse clean. Remove metal lids and place both in recyclables according to local color sorting.",
        "impact": "Glass is 100% recyclable infinitely with zero chemical degradation."
    },
    # Other
    "Mixed waste": {
        "category": CATEGORY_GENERAL_OR_VERIFY,
        "handling": "Composite materials, multi-layer laminates, or contaminated items.",
        "tip": "Separate any recyclable or organic parts if practical; discard residue in general waste.",
        "impact": "Minimizing mixed waste prevents downcycling and landfill accumulation."
    },
    "Unknown waste": {
        "category": CATEGORY_MANUAL_REVIEW,
        "handling": "Unclassified material requiring operator inspection.",
        "tip": "Check product labeling, resin code, or local municipal waste directory before sorting.",
        "impact": "Careful verification prevents municipal stream contamination."
    }
}

# Known COCO food classes
FOOD_CLASSES = {
    "banana": {
        "label": "Banana",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Compostable organic matter. Banana peels are nutrient-rich in potassium.",
        "segregation_tip": "Place in organic/green bin. If whole and fresh, consider surplus redistribution before spoiling.",
        "environmental_impact": "Diverting organic food waste prevents methane emissions in landfills."
    },
    "apple": {
        "label": "Apple",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Compostable organic matter.",
        "segregation_tip": "Remove fruit stickers/labels before composting. If pristine, prioritize consumption or donation.",
        "environmental_impact": "Decomposes cleanly into compost if kept free from plastic wrappers."
    },
    "orange": {
        "label": "Orange / Citrus",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Organic citrus waste.",
        "segregation_tip": "Compostable in municipal compost systems. In home vermicomposting, add in moderation.",
        "environmental_impact": "Citrus rinds can be processed for natural oils or composted."
    },
    "broccoli": {
        "label": "Broccoli",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Fibrous organic vegetable waste.",
        "segregation_tip": "Stems and florets compost rapidly. Remove any plastic band/tag.",
        "environmental_impact": "High moisture organic matter suitable for composting."
    },
    "carrot": {
        "label": "Carrot",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Root vegetable organic waste.",
        "segregation_tip": "100% compostable. If edible surplus, store in cool conditions.",
        "environmental_impact": "Decomposes cleanly into rich organic compost."
    },
    "pizza": {
        "label": "Pizza Slice / Crust",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Cooked food waste containing dairy, wheat, and oils.",
        "segregation_tip": "Food leftovers go to organic/food waste bin. Do NOT place oily pizza boxes in paper recycling unless free of grease.",
        "environmental_impact": "Food oils contaminate cardboard recycling; segregate food cleanly from paper."
    },
    "sandwich": {
        "label": "Sandwich",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Prepared meal waste.",
        "segregation_tip": "Separate any plastic cling film, toothpick, or foil wrapping before placing in food waste bin.",
        "environmental_impact": "Compostable once stripped of synthetic packaging."
    },
    "hot dog": {
        "label": "Hot Dog / Prepared Food",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Cooked processed food.",
        "segregation_tip": "Discard wrapper in general waste/recycling; food item belongs in organic waste bin.",
        "environmental_impact": "Meat/cooked food is best handled via municipal organics or anaerobic digestors."
    },
    "donut": {
        "label": "Donut / Bakery Item",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Bakery and confectionery waste.",
        "segregation_tip": "Discard in organic waste. Check if packaging includes wax paper or plastic window.",
        "environmental_impact": "High sugar/fat content; safe for industrial composting."
    },
    "cake": {
        "label": "Cake / Pastry",
        "category": CATEGORY_ORGANIC,
        "is_edible_candidate": True,
        "handling": "Bakery food waste.",
        "segregation_tip": "Organic food bin. Remove non-edible decorations, plastic bases, or metallic candles.",
        "environmental_impact": "Organic waste diverted from landfills."
    }
}

# Packaging & Container Classes
PACKAGING_CLASSES = {
    "bottle": {
        "label": "Bottle",
        "category": CATEGORY_RECYCLABLE_VERIFY,
        "is_edible_candidate": False,
        "handling": "Packaging item requiring material verification.",
        "segregation_tip": "Check material: Clear PET (code 1) or HDPE (code 2) plastic, glass, or aluminum. Empty liquids, rinse clean, and crush before binning.",
        "environmental_impact": "Rinsed plastic bottles and glass have high recycling circularity."
    },
    "cup": {
        "label": "Cup / Beverage Container",
        "category": CATEGORY_GENERAL_OR_VERIFY,
        "is_edible_candidate": False,
        "handling": "Composite material unknown until physically verified.",
        "segregation_tip": "Many paper coffee cups contain a polyethylene or PLA plastic waterproof lining that cannot be recycled in standard paper mills. If lined, place in general waste unless commercial composting is confirmed.",
        "environmental_impact": "Separating lids (often polystyrene #6) and cups prevents contamination of recycling streams."
    },
    "bowl": {
        "label": "Bowl / Food Container",
        "category": CATEGORY_MIXED_CONTAINER,
        "is_edible_candidate": False,
        "handling": "Food container; disposal depends on contents and container material.",
        "segregation_tip": "STEP 1: Scrape all residual food into the organic waste bin. STEP 2: Rinse container. STEP 3: If reusable ceramic/glass, wash. If single-use plastic, verify resin code (#1, #2, #5 recyclable). If greasy styrofoam, dispose in general waste.",
        "environmental_impact": "Cleaning food residue from containers is essential to prevent rejection of recycling batches."
    },
    "wine glass": {
        "label": "Glassware / Glass Container",
        "category": CATEGORY_RECYCLABLE_VERIFY,
        "is_edible_candidate": False,
        "handling": "Specialty glassware.",
        "segregation_tip": "Drinking glasses and crystal have a different melting point than container glass (jars/bottles). Do not mix with container glass recycling if broken; place in general waste wrapped safely.",
        "environmental_impact": "Proper glass sorting prevents kiln contamination in remanufacturing."
    },
    "fork": {
        "label": "Fork / Cutlery",
        "category": CATEGORY_MANUAL_REVIEW,
        "is_edible_candidate": False,
        "handling": "Utensil requiring material check.",
        "segregation_tip": "If stainless steel, reuse. If plastic cutlery (usually #6 polystyrene or rigid polypropylene), check local facility; most MRFs cannot sort small black plastic utensils.",
        "environmental_impact": "Prioritize durable reusables over disposable cutlery."
    },
    "knife": {
        "label": "Knife / Cutlery",
        "category": CATEGORY_MANUAL_REVIEW,
        "is_edible_candidate": False,
        "handling": "Utensil requiring material check.",
        "segregation_tip": "Inspect material. Wrap sharp edges safely if disposing.",
        "environmental_impact": "Reusables prevent single-use fossil fuel plastic generation."
    },
    "spoon": {
        "label": "Spoon / Cutlery",
        "category": CATEGORY_MANUAL_REVIEW,
        "is_edible_candidate": False,
        "handling": "Utensil requiring material check.",
        "segregation_tip": "Determine if reusable metal, recyclable polypropylene, or disposable polystyrene.",
        "environmental_impact": "Reuse prevents lifecycle waste."
    }
}

def classify_detected_object(class_name: str, confidence: float, source: str = "ai"):
    """
    Evaluates an object name (AI detected or user added) and returns detailed rule-based segregation metadata.
    Flags uncertain detections (confidence < 45%).
    """
    clean_name = class_name.strip()
    clean_lower = clean_name.lower()
    
    # Check user-selectable taxonomy first
    for tax_name, tax_data in USER_SELECTABLE_TAXONOMY.items():
        if clean_lower == tax_name.lower():
            is_food = "Organic" in tax_data["category"]
            return {
                "detected_label": clean_name,
                "display_name": tax_name,
                "category": tax_data["category"],
                "confidence": round(confidence * 100, 1) if source == "ai" else 100.0,
                "is_uncertain": False if source == "user" else (confidence < 0.45),
                "is_edible_candidate": is_food,
                "source": source,
                "handling": tax_data["handling"],
                "segregation_tip": tax_data["tip"],
                "environmental_impact": tax_data["impact"],
                "badge_color": "emerald" if is_food else ("blue" if "Recyclable" in tax_data["category"] else "amber"),
                "rule_basis": "User Verified Waste Item" if source == "user" else "Standardized Waste Taxonomy"
            }

    # Check COCO Food classes
    if clean_lower in FOOD_CLASSES:
        meta = FOOD_CLASSES[clean_lower]
        return {
            "detected_label": class_name,
            "display_name": meta["label"],
            "category": meta["category"],
            "confidence": round(confidence * 100, 1),
            "is_uncertain": confidence < 0.45,
            "is_edible_candidate": meta["is_edible_candidate"],
            "source": source,
            "handling": meta["handling"],
            "segregation_tip": meta["segregation_tip"],
            "environmental_impact": meta["environmental_impact"],
            "badge_color": "emerald",
            "rule_basis": "COCO Food Class. Directs to organic waste diversion."
        }
    
    # Check COCO Packaging & Utensils
    if clean_lower in PACKAGING_CLASSES:
        meta = PACKAGING_CLASSES[clean_lower]
        badge = "blue" if "Recyclable" in meta["category"] else ("lime" if "Container" in meta["category"] else "amber")
        return {
            "detected_label": class_name,
            "display_name": meta["label"],
            "category": meta["category"],
            "confidence": round(confidence * 100, 1),
            "is_uncertain": confidence < 0.45,
            "is_edible_candidate": meta["is_edible_candidate"],
            "source": source,
            "handling": meta["handling"],
            "segregation_tip": meta["segregation_tip"],
            "environmental_impact": meta["environmental_impact"],
            "badge_color": badge,
            "rule_basis": "COCO Packaging Class. Mandates physical resin & material check."
        }
        
    # General fallback for any other COCO class (e.g. chair, book, etc.)
    return {
        "detected_label": class_name,
        "display_name": class_name.title(),
        "category": CATEGORY_MANUAL_REVIEW,
        "confidence": round(confidence * 100, 1) if source == "ai" else 100.0,
        "is_uncertain": False if source == "user" else (confidence < 0.45),
        "is_edible_candidate": False,
        "source": source,
        "handling": f"Identified as '{class_name}'. Requires manual review for proper waste stream.",
        "segregation_tip": "Inspect material composition and cleanliness before assigning to organic, recyclable, or general bin.",
        "environmental_impact": "Accurate sorting prevents recycling batch rejection.",
        "badge_color": "gray",
        "rule_basis": "Unclassified object in waste taxonomy. Operator confirmation required."
    }

def synthesize_scan_recommendations(detections: list):
    """
    Aggregates detections and confirmed items from a scan to provide an overarching segregation decision.
    """
    if not detections:
        return {
            "primary_category": "No Supported Objects",
            "summary_heading": "No Recognizable Waste Items Detected",
            "action_recommendation": "The image analysis did not identify any supported food or waste items with sufficient confidence. Try another image or use the manual waste category selector.",
            "environmental_tip": "Good sorting starts with clear visibility. Ensure items are well-lit and unobstructed.",
            "has_food_candidate": False,
            "verification_needed": False
        }
        
    categories = [d.get("category", "") for d in detections]
    has_food = any("Organic" in c for c in categories)
    has_packaging = any("Recyclable" in c or "Container" in c or "General" in c for c in categories)
    has_mixed_container = any("Container" in c for c in categories)
    
    if has_food and has_packaging:
        return {
            "primary_category": "Mixed Waste Stream - Separate First",
            "summary_heading": "Multi-Material Mixed Composition Detected",
            "action_recommendation": "Both food items and containers/packaging were detected. Prioritize separating food residues into the Organic/Compost bin before cleaning containers for material recycling.",
            "environmental_tip": "Grease and food residue are the #1 cause of rejected recycling loads. Always empty containers completely.",
            "has_food_candidate": has_food,
            "verification_needed": True
        }
    elif has_food:
        return {
            "primary_category": CATEGORY_ORGANIC,
            "summary_heading": "Organic / Compostable Biomass",
            "action_recommendation": "Identified items correspond to biodegradable organic food matter. Route to composting or anaerobic digestion. If unconsumed, evaluate for NutriFeast Surplus Redistribution.",
            "environmental_tip": "Composting food waste produces nutrient-dense soil amendments and captures carbon.",
            "has_food_candidate": True,
            "verification_needed": False
        }
    elif has_mixed_container or has_packaging:
        return {
            "primary_category": CATEGORY_RECYCLABLE_VERIFY,
            "summary_heading": "Packaging & Containers (Verification Required)",
            "action_recommendation": "Packaging materials detected. Physically verify resin identification codes (PET #1, HDPE #2, PP #5) or glass/metal content. Rinse clean before recycling.",
            "environmental_tip": "Do not assume every bottle or cup is recyclable without checking resin codes and local rules.",
            "has_food_candidate": False,
            "verification_needed": True
        }
    else:
        return {
            "primary_category": CATEGORY_MANUAL_REVIEW,
            "summary_heading": "Manual Verification Required",
            "action_recommendation": "Objects detected require operator review to ensure proper material segregation according to local regulations.",
            "environmental_tip": "When in doubt, consult local waste management directory to prevent contamination.",
            "has_food_candidate": False,
            "verification_needed": True
        }
