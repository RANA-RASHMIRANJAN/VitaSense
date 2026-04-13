import argparse
import json
import os
import sys

import joblib
import numpy as np
import pandas as pd


# When this script is executed directly, Python's sys.path may not include the
# project root. The trained model references functions in the `backend.*` module,
# so ensure imports work during unpickling.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


VITAMIN_COLS = [
    "vitamin_a_percent_rda",
    "vitamin_c_percent_rda",
    "vitamin_d_percent_rda",
    "vitamin_e_percent_rda",
    "vitamin_b12_percent_rda",
    "folate_percent_rda",
    "calcium_percent_rda",
    "iron_percent_rda",
]


def _clean_text(s: str) -> str:
    if s is None:
        return ""
    s = str(s)
    s = s.replace("NaN", "").replace("nan", "")
    # treat common separators as spaces
    for sep in [",", ";", "\n", "\t"]:
        s = s.replace(sep, " ")
    return " ".join(s.split()).strip().lower()


def _map_input_to_model_row(form: dict) -> dict:
    # Frontend keys:
    # age, gender, bmi, smoking, alcohol, exercise, diet, sun, stress (legacy: income)
    # Model expects:
    # ... stress_level, latitude_region, symptoms_list
    gender = form.get("gender", "")
    smoking = form.get("smoking", "")
    alcohol = form.get("alcohol", "")
    exercise = form.get("exercise", "")
    diet = form.get("diet", "")
    sun = form.get("sun", "")
    stress_raw = form.get("stress", form.get("income", ""))

    gender = str(gender).strip().lower()
    if gender == "male":
        gender = "male"
    elif gender == "female":
        gender = "female"
    else:
        gender = "other"

    smoking_status = "current" if str(smoking).strip().lower() == "smoker" else "never"
    alcohol_in = str(alcohol).strip().lower()
    # Training data uses none / moderate / heavy (see vitamin_deficiency_disease_dataset).
    alcohol_consumption = "heavy" if alcohol_in == "alcoholic" else "none"

    exercise_level_in = str(exercise).strip().lower()
    # training script uses: sedentary/light/moderate/active
    if exercise_level_in == "low":
        exercise_level = "sedentary"
    elif exercise_level_in == "medium":
        exercise_level = "moderate"
    elif exercise_level_in == "high":
        exercise_level = "active"
    else:
        exercise_level = "moderate"

    diet_in = str(diet).strip().lower()
    if diet_in == "vegetarian":
        diet_type = "vegetarian"
    elif diet_in == "non-vegetarian":
        diet_type = "omnivore"
    elif diet_in == "vegan":
        diet_type = "vegan"
    else:
        diet_type = diet_in if diet_in else "vegetarian"

    sun_exposure_in = str(sun).strip().lower()
    if sun_exposure_in in ["low", "moderate", "high"]:
        sun_exposure = sun_exposure_in
    else:
        sun_exposure = "moderate"

    stress_in = str(stress_raw).strip().lower()
    if stress_in == "medium":
        stress_level = "middle"
    elif stress_in in ["low", "middle", "high"]:
        stress_level = stress_in
    else:
        stress_level = "middle"

    # Frontend does not collect these; provide safe defaults.
    latitude_region = "middle"
    symptoms_list = ""

    return {
        "age": form.get("age"),
        "bmi": form.get("bmi"),
        "gender": gender,
        "smoking_status": smoking_status,
        "alcohol_consumption": alcohol_consumption,
        "exercise_level": exercise_level,
        "diet_type": diet_type,
        "sun_exposure": sun_exposure,
        "stress_level": stress_level,
        "latitude_region": latitude_region,
        "symptoms_list": _clean_text(symptoms_list),
    }


def _vitamin_name(col: str) -> str:
    mapping = {
        "vitamin_a_percent_rda": "Vitamin A",
        "vitamin_c_percent_rda": "Vitamin C",
        "vitamin_d_percent_rda": "Vitamin D",
        "vitamin_e_percent_rda": "Vitamin E",
        "vitamin_b12_percent_rda": "Vitamin B12",
        "folate_percent_rda": "Folate",
        "calcium_percent_rda": "Calcium",
        "iron_percent_rda": "Iron",
    }
    return mapping.get(col, col)


def _suggest_for_vitamin(vitamin_col: str) -> str:
    v = _vitamin_name(vitamin_col)
    base = {
        "vitamin_d_percent_rda": "Increase safe sun exposure and include vitamin D rich foods (or consult for supplementation).",
        "vitamin_b12_percent_rda": "If you follow a plant-based diet, consider B12 fortified foods or supplements (under medical guidance).",
        "iron_percent_rda": "Include iron-rich foods (and pair with vitamin C sources); consider testing before supplementing.",
        "calcium_percent_rda": "Increase calcium intake through dairy/fortified alternatives and consult for supplementation if needed.",
        "vitamin_c_percent_rda": "Increase vitamin C rich foods (citrus, berries, leafy greens) to support absorption.",
        "vitamin_a_percent_rda": "Include vitamin A rich foods (such as carrots, sweet potatoes, leafy greens).",
        "vitamin_e_percent_rda": "Include vitamin E rich foods (nuts, seeds, vegetable oils) as part of a balanced diet.",
        "folate_percent_rda": "Increase folate sources (leafy greens, legumes) and consider supplementation if advised.",
    }
    return base.get(vitamin_col, f"Consider foods rich in {v} and discuss supplements with a healthcare professional.")


def _severity_band(pct: float) -> str:
    if pct < 60:
        return "high"
    if pct < 80:
        return "medium"
    return "low"


def _lifestyle_nutrient_rules():
    """(predicate on raw form fields, vitamin column id, short note for UI)."""

    def _sun_low(f: dict) -> bool:
        return str(f.get("sun", "")).strip().lower() == "low"

    def _plant_diet(f: dict) -> bool:
        return str(f.get("diet", "")).strip().lower() in ("vegan", "vegetarian")

    def _smoker(f: dict) -> bool:
        return str(f.get("smoking", "")).strip().lower() == "smoker"

    def _alcoholic(f: dict) -> bool:
        return str(f.get("alcohol", "")).strip().lower() == "alcoholic"

    def _stress_high(f: dict) -> bool:
        s = str(f.get("stress", f.get("income", ""))).strip().lower()
        return s in ("high", "medium")

    return [
        (_sun_low, "vitamin_d_percent_rda", "Low sun exposure (supports vitamin D synthesis)."),
        (_plant_diet, "vitamin_b12_percent_rda", "Plant-based diet (monitor B12 intake)."),
        (_smoker, "vitamin_c_percent_rda", "Smoking increases oxidative stress; vitamin C needs may be higher."),
        (_alcoholic, "folate_percent_rda", "Higher alcohol intake is often associated with folate concerns."),
        (_stress_high, "iron_percent_rda", "Stress and fatigue prompts often warrant checking iron status."),
    ]


def predict_and_format(model, input_form: dict) -> dict:
    row = _map_input_to_model_row(input_form)
    df_in = pd.DataFrame([row])

    pred = model.predict(df_in)
    pred = np.asarray(pred)
    if pred.ndim != 2 or pred.shape[1] != len(VITAMIN_COLS):
        raise RuntimeError(f"Unexpected model output shape: {pred.shape}")

    pred_row = pred[0].astype(float)
    rda_threshold = 100.0
    # Include lifestyle-linked nutrients when model % is not comfortably above RDA.
    lifestyle_band = 112.0

    by_col = {VITAMIN_COLS[i]: float(pred_row[i]) for i in range(len(VITAMIN_COLS))}
    rows_by_id = {}

    for col in VITAMIN_COLS:
        val = by_col[col]
        if val < rda_threshold:
            rows_by_id[col] = {
                "id": col,
                "name": _vitamin_name(col),
                "predicted_percent": round(val, 2),
                "deficiency_score": round(rda_threshold - val, 2),
                "adequacy_score": round(max(0.0, min(100.0, val)), 2),
                "severity": _severity_band(val),
                "below_target": True,
                "lifestyle_notes": [],
            }

    for check, col, note in _lifestyle_nutrient_rules():
        if not check(input_form):
            continue
        val = by_col[col]
        if col in rows_by_id:
            if note not in rows_by_id[col]["lifestyle_notes"]:
                rows_by_id[col]["lifestyle_notes"].append(note)
            continue
        if val < lifestyle_band:
            gap = round(max(1.0, lifestyle_band - val), 2)
            rows_by_id[col] = {
                "id": col,
                "name": _vitamin_name(col),
                "predicted_percent": round(val, 2),
                "deficiency_score": gap,
                "adequacy_score": round(max(0.0, min(100.0, val)), 2),
                "severity": _severity_band(val) if val < rda_threshold else "low",
                "below_target": val < rda_threshold,
                "lifestyle_notes": [note],
            }

    deficiencies = sorted(rows_by_id.values(), key=lambda d: d["deficiency_score"], reverse=True)
    below = [d for d in deficiencies if d["below_target"]]

    overall_nutrient_score = round(float(np.mean(pred_row)), 2)

    disclaimer = (
        "Educational screening only — not a medical diagnosis. "
        "Vitamin deficiency is confirmed with clinical context and (often) lab testing. "
        "If you have symptoms or risk factors, consult a qualified clinician."
    )

    if not deficiencies:
        prediction = "Screening: no major shortfalls detected"
        risk = "low"
        suggestion = "Maintain a balanced diet. If symptoms persist, consider discussing lab testing with a clinician."
    elif len(below) == 1 and len(deficiencies) == 1:
        w = below[0]
        prediction = f"Screening: possible {w['name']} shortfall"
        risk = w["severity"]
        suggestion = _suggest_for_vitamin(w["id"])
    elif len(below) >= 2:
        names = ", ".join(d["name"] for d in below[:5])
        if len(below) > 5:
            names += f", +{len(below) - 5} more"
        prediction = f"Screening: possible multiple nutrient shortfalls ({names})"
        if any(d["predicted_percent"] < 60 for d in below):
            risk = "high"
        elif any(d["predicted_percent"] < 80 for d in below):
            risk = "medium"
        else:
            risk = "low"
        top_s = [_suggest_for_vitamin(d["id"]) for d in below[:4]]
        suggestion = "\n\n".join(dict.fromkeys(top_s))
    elif len(below) == 1 and len(deficiencies) > 1:
        w = below[0]
        other = [d["name"] for d in deficiencies if not d["below_target"]]
        prediction = f"Screening: possible {w['name']} shortfall + linked nutrients ({', '.join(other[:4])})"
        risk = w["severity"]
        top_s = [_suggest_for_vitamin(w["id"])] + [_suggest_for_vitamin(d["id"]) for d in deficiencies if d["id"] != w["id"]][:2]
        suggestion = "\n\n".join(dict.fromkeys(top_s))
    else:
        names = ", ".join(d["name"] for d in deficiencies[:5])
        prediction = f"Screening: lifestyle-linked nutrient focus ({names})"
        risk = "medium" if any(d["predicted_percent"] < 90 for d in deficiencies) else "low"
        top_s = [_suggest_for_vitamin(d["id"]) for d in deficiencies[:4]]
        suggestion = "\n\n".join(dict.fromkeys(top_s))

    return {
        "prediction": prediction,
        "risk": risk,
        "suggestion": suggestion,
        "disclaimer": disclaimer,
        "deficiency_count": len(below),
        "concern_row_count": len(deficiencies),
        "deficiencies": deficiencies,
        "overall_nutrient_score": overall_nutrient_score,
        "vitamin_predictions": {
            VITAMIN_COLS[i]: round(float(pred_row[i]), 2) for i in range(len(VITAMIN_COLS))
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="backend/models/vitamin_model.pkl", help="Path to .pkl model")
    args = parser.parse_args()

    model_path = args.model
    if not os.path.exists(model_path):
        # Keep response structure to avoid breaking frontend.
        print(
            json.dumps(
                {
                    "error": "MODEL_NOT_FOUND",
                    "message": f"Missing model file: {model_path}",
                }
            )
        )
        sys.exit(0)

    model = joblib.load(model_path)

    raw = sys.stdin.read()
    if not raw.strip():
        raise RuntimeError("No input JSON received on stdin")

    form = json.loads(raw)
    out = predict_and_format(model, form)
    print(json.dumps(out))


if __name__ == "__main__":
    main()

