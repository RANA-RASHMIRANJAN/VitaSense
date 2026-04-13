import argparse
import os
import random

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, OrdinalEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from xgboost import XGBRegressor
from backend.ml.text_utils import to_1d_array


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


ORDINAL_COLS = ["exercise_level", "sun_exposure", "stress_level"]
ORDINAL_CATEGORIES = [
    ["sedentary", "light", "moderate", "active"],
    ["low", "moderate", "high"],
    ["low", "middle", "high"],
]

NOMINAL_COLS = [
    "gender",
    "smoking_status",
    "alcohol_consumption",
    "diet_type",
    "latitude_region",
]

TEXT_COL = "symptoms_list"
DEFAULT_TEXT = ""


def _clean_text_series(s: pd.Series) -> pd.Series:
    s = s.fillna(DEFAULT_TEXT).astype(str)
    # remove literal string "NaN"/"nan"
    s = s.replace(["NaN", "nan"], DEFAULT_TEXT)
    # clean separators into spaces
    s = s.str.replace(r"[,\;]", " ", regex=True)
    # remove extra spaces and normalize case
    s = s.str.strip().str.lower()
    return s


def _normalize_categoricals(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    for c in cols:
        if c in df.columns:
            df[c] = df[c].astype(str).str.strip().str.lower()
    return df


def build_pipeline(feature_columns: list[str]) -> Pipeline:
    # Anything not explicitly handled goes into numeric preprocessing.
    # Keep it robust across different dataset schemas.
    numeric_cols = [c for c in feature_columns if c not in set(ORDINAL_COLS + NOMINAL_COLS + [TEXT_COL])]

    ordinal_preprocess = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="most_frequent"),
            ),
            (
                "ord",
                OrdinalEncoder(
                    categories=ORDINAL_CATEGORIES,
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
            ),
        ]
    )

    nominal_preprocess = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("nom", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    numeric_preprocess = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler(with_mean=False)),
        ]
    )

    text_preprocess = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value=DEFAULT_TEXT)),
            # ColumnTransformer provides text as shape (n_samples, 1).
            # TfidfVectorizer expects an iterable of strings, so flatten first.
            ("to_1d", FunctionTransformer(to_1d_array, validate=False)),
            ("txt", TfidfVectorizer()),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("ord", ordinal_preprocess, [c for c in ORDINAL_COLS if c in feature_columns]),
            ("nom", nominal_preprocess, [c for c in NOMINAL_COLS if c in feature_columns]),
            ("txt", text_preprocess, [c for c in [TEXT_COL] if c in feature_columns]),
            ("num", numeric_preprocess, numeric_cols),
        ],
        remainder="drop",
    )

    base_model = XGBRegressor(
        n_estimators=200,
        learning_rate=0.06,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=1,
    )
    model = MultiOutputRegressor(base_model)

    return Pipeline([("preprocessing", preprocessor), ("model", model)])


def make_synthetic_dataset(n: int = 600, seed: int = 42) -> pd.DataFrame:
    random.seed(seed)
    np.random.seed(seed)

    genders = ["male", "female", "other"]
    smoking_statuses = ["never", "current"]
    alcohol_consumptions = ["non-alcoholic", "alcoholic"]
    exercise_levels = ["sedentary", "light", "moderate", "active"]
    diet_types = ["vegetarian", "non-vegetarian", "vegan"]
    sun_exposures = ["low", "moderate", "high"]
    stress_levels = ["low", "middle", "high"]
    latitude_regions = ["low", "middle", "high"]
    symptom_pool = [
        "fatigue",
        "bone pain",
        "weakness",
        "dizziness",
        "tingling",
        "cramps",
        "blurred vision",
        "joint pain",
    ]

    def pick_symptoms() -> str:
        k = np.random.randint(0, 3)
        if k == 0:
            return ""
        return " ".join(np.random.choice(symptom_pool, size=k, replace=False))

    age = np.random.randint(18, 80, size=n)
    bmi = np.round(np.random.uniform(16, 38, size=n), 1)

    gender = np.random.choice(genders, size=n)
    smoking_status = np.random.choice(smoking_statuses, size=n)
    alcohol_consumption = np.random.choice(alcohol_consumptions, size=n)
    exercise_level = np.random.choice(exercise_levels, size=n)
    diet_type = np.random.choice(diet_types, size=n)
    sun_exposure = np.random.choice(sun_exposures, size=n)
    stress_level = np.random.choice(stress_levels, size=n)
    latitude_region = np.random.choice(latitude_regions, size=n)
    symptoms_list = [pick_symptoms() for _ in range(n)]

    # Synthetic target generation: lower sun => lower vitamin D, vegan => lower B12, etc.
    # Outputs are "percent of RDA" (higher is better).
    def clip(v: np.ndarray, lo: float = 10, hi: float = 160) -> np.ndarray:
        return np.clip(v, lo, hi)

    sun_factor = np.array([1.0 if s == "high" else 0.8 if s == "moderate" else 0.5 for s in sun_exposure])
    diet_factor_b12 = np.array([0.7 if d == "vegan" else 0.85 if d == "vegetarian" else 1.0 for d in diet_type])
    alcohol_factor = np.array([1.0 if a == "non-alcoholic" else 0.85 for a in alcohol_consumption])
    smoking_factor = np.array([0.9 if s == "current" else 1.0 for s in smoking_status])
    exercise_factor = np.array(
        [0.85 if e == "sedentary" else 0.95 if e == "light" else 1.0 if e == "moderate" else 1.05 for e in exercise_level]
    )
    stress_factor = np.array([0.9 if i == "low" else 1.0 if i == "middle" else 1.05 for i in stress_level])

    noise = np.random.normal(0, 8, size=(n, len(VITAMIN_COLS)))

    vitamin_a = clip(120 * exercise_factor * stress_factor * alcohol_factor * smoking_factor * (0.9 + 0.2 * np.random.rand(n)))
    vitamin_c = clip(110 * stress_factor * (0.8 + 0.2 * exercise_factor) * alcohol_factor * (0.9 + 0.2 * np.random.rand(n)))
    vitamin_d = clip(100 * sun_factor * (0.9 + 0.2 * np.random.rand(n)))
    vitamin_e = clip(105 * stress_factor * (0.9 + 0.2 * exercise_factor) * alcohol_factor * (0.9 + 0.2 * np.random.rand(n)))
    vitamin_b12 = clip(115 * diet_factor_b12 * stress_factor * (0.9 + 0.2 * np.random.rand(n)))
    folate = clip(108 * stress_factor * (0.9 + 0.2 * np.random.rand(n)))
    calcium = clip(102 * sun_factor * (0.9 + 0.2 * exercise_factor) * (0.9 + 0.2 * np.random.rand(n)))
    iron = clip(98 * stress_factor * (0.95 + 0.1 * exercise_factor) * (0.9 + 0.2 * np.random.rand(n)))

    y = np.stack([vitamin_a, vitamin_c, vitamin_d, vitamin_e, vitamin_b12, folate, calcium, iron], axis=1) + noise
    y = clip(y, lo=10, hi=160)

    df = pd.DataFrame(
        {
            "age": age,
            "bmi": bmi,
            "gender": gender,
            "smoking_status": smoking_status,
            "alcohol_consumption": alcohol_consumption,
            "exercise_level": exercise_level,
            "diet_type": diet_type,
            "sun_exposure": sun_exposure,
            "stress_level": stress_level,
            "latitude_region": latitude_region,
            "symptoms_list": symptoms_list,
        }
    )
    for idx, c in enumerate(VITAMIN_COLS):
        df[c] = y[:, idx]

    return df


def train_and_save(csv_path: str | None, output_path: str, synthetic_if_missing: bool) -> None:
    if csv_path and os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
    else:
        if not synthetic_if_missing:
            raise FileNotFoundError(f"Dataset not found: {csv_path}")
        df = make_synthetic_dataset()

    # Keep only columns we understand. If the dataset is a superset, this avoids surprises.
    needed_cols = set(
        [
            "age",
            "bmi",
            "gender",
            "smoking_status",
            "alcohol_consumption",
            "exercise_level",
            "diet_type",
            "sun_exposure",
            "stress_level",
            "income_level",
            "latitude_region",
            "symptoms_list",
        ]
        + VITAMIN_COLS
    )
    df = df[[c for c in df.columns if c in needed_cols]].copy()

    # UI collects stress; historical CSV uses income_level — same ordinal scale for training.
    if "stress_level" not in df.columns and "income_level" in df.columns:
        df = df.rename(columns={"income_level": "stress_level"})

    missing = [c for c in ["age", "bmi", "symptoms_list", "gender"] if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset missing required columns: {missing}")

    # Targets
    missing_vits = [c for c in VITAMIN_COLS if c not in df.columns]
    if missing_vits:
        raise ValueError(f"Dataset missing vitamin target columns: {missing_vits}")

    # Clean + normalize
    if "alcohol_consumption" in df.columns:
        df["alcohol_consumption"] = df["alcohol_consumption"].fillna("none").astype(str).str.strip().str.lower()
        df["alcohol_consumption"] = df["alcohol_consumption"].replace({"nan": "none", "": "none"})
    df["symptoms_list"] = _clean_text_series(df["symptoms_list"]) if "symptoms_list" in df.columns else ""

    df = _normalize_categoricals(df, NOMINAL_COLS + ORDINAL_COLS)
    if "stress_level" in df.columns:
        df["stress_level"] = df["stress_level"].replace({"medium": "middle"})
    if "latitude_region" in df.columns:
        df["latitude_region"] = df["latitude_region"].replace({"mid": "middle"})
    if "exercise_level" in df.columns:
        # dataset naming may vary; keep common synonyms.
        df["exercise_level"] = df["exercise_level"].replace({"moderate ": "moderate"}).astype(str).str.strip()

    feature_columns = [c for c in df.columns if c not in VITAMIN_COLS]
    X = df[feature_columns]
    y = df[VITAMIN_COLS]

    pipeline = build_pipeline(feature_columns)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred, multioutput="uniform_average")
    print(f"MAE: {mae:.4f}")
    print(f"R2 Score: {r2:.4f}")

    # Per-target reporting (useful for monitoring which nutrients are weakest).
    per_target = []
    for i, col in enumerate(VITAMIN_COLS):
        per_target.append(
            {
                "target": col,
                "mae": float(mean_absolute_error(y_test[col], y_pred[:, i])),
                "r2": float(r2_score(y_test[col], y_pred[:, i])),
            }
        )
    per_target = sorted(per_target, key=lambda x: x["mae"], reverse=True)
    print("Per-target metrics (higher MAE is worse):")
    for row in per_target:
        print(f"  - {row['target']}: MAE={row['mae']:.4f} R2={row['r2']:.4f}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(pipeline, output_path)
    print(f"Saved model to: {output_path}")

    # Save metrics JSON next to model for the app to display.
    metrics_path = os.path.splitext(output_path)[0] + "_metrics.json"
    metrics = {
        "type": "screening_regression",
        "note": "Educational screening model; not a medical diagnostic device.",
        "overall": {"mae": float(mae), "r2": float(r2)},
        "per_target": per_target,
        "targets": VITAMIN_COLS,
        "features": feature_columns,
    }
    with open(metrics_path, "w", encoding="utf-8") as f:
        import json

        json.dump(metrics, f, indent=2)
    print(f"Saved metrics to: {metrics_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default=None, help="Path to vitamin dataset CSV (optional).")
    parser.add_argument("--output", default="backend/models/vitamin_model.pkl", help="Where to save the trained model.")
    parser.add_argument("--synthetic-if-missing", action="store_true", help="Use synthetic data if CSV is missing.")
    args = parser.parse_args()

    default_csv = os.path.join(os.path.dirname(__file__), "..", "data", "vitamin_deficiency_disease_dataset_20260123.csv")
    csv_path = args.csv if args.csv is not None else (default_csv if os.path.exists(default_csv) else None)

    train_and_save(
        csv_path=csv_path,
        output_path=args.output,
        synthetic_if_missing=args.synthetic_if_missing,
    )

