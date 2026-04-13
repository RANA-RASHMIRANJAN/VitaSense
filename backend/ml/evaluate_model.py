import argparse
import os
from dataclasses import dataclass

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import KFold, train_test_split

from backend.ml.train_model import VITAMIN_COLS, build_pipeline


@dataclass(frozen=True)
class EvalResult:
    mae_overall: float
    r2_overall: float
    per_target: pd.DataFrame


def _load_dataset(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    # Align with training convention: UI uses stress; dataset uses income_level.
    if "stress_level" not in df.columns and "income_level" in df.columns:
        df = df.rename(columns={"income_level": "stress_level"})
    if "latitude_region" in df.columns:
        df["latitude_region"] = df["latitude_region"].astype(str).str.strip().str.lower().replace({"mid": "middle"})
    if "stress_level" in df.columns:
        df["stress_level"] = df["stress_level"].astype(str).str.strip().str.lower().replace({"medium": "middle"})

    # Keep only the columns used by the training pipeline (avoids non-numeric leakage like disease labels).
    needed = set(
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
            "latitude_region",
            "symptoms_list",
        ]
        + VITAMIN_COLS
    )
    keep = [c for c in df.columns if c in needed]
    df = df[keep].copy()
    return df


def _prepare_xy(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    missing_targets = [c for c in VITAMIN_COLS if c not in df.columns]
    if missing_targets:
        raise ValueError(f"Dataset missing target columns: {missing_targets}")
    feature_columns = [c for c in df.columns if c not in VITAMIN_COLS]
    return df[feature_columns].copy(), df[VITAMIN_COLS].copy()


def evaluate_holdout(csv_path: str, test_size: float = 0.2, seed: int = 42) -> EvalResult:
    df = _load_dataset(csv_path)
    X, y = _prepare_xy(df)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=seed)
    pipeline = build_pipeline(list(X.columns))
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    mae_overall = float(mean_absolute_error(y_test, y_pred))
    r2_overall = float(r2_score(y_test, y_pred, multioutput="uniform_average"))

    per = []
    for i, col in enumerate(VITAMIN_COLS):
        per.append(
            {
                "target": col,
                "mae": float(mean_absolute_error(y_test[col], y_pred[:, i])),
                "r2": float(r2_score(y_test[col], y_pred[:, i])),
            }
        )
    per_df = pd.DataFrame(per).sort_values("mae", ascending=False).reset_index(drop=True)
    return EvalResult(mae_overall=mae_overall, r2_overall=r2_overall, per_target=per_df)


def evaluate_kfold(csv_path: str, k: int = 5, seed: int = 42) -> EvalResult:
    df = _load_dataset(csv_path)
    X, y = _prepare_xy(df)

    kf = KFold(n_splits=k, shuffle=True, random_state=seed)
    y_true_all = []
    y_pred_all = []

    for train_idx, test_idx in kf.split(X):
        X_train = X.iloc[train_idx]
        y_train = y.iloc[train_idx]
        X_test = X.iloc[test_idx]
        y_test = y.iloc[test_idx]

        pipeline = build_pipeline(list(X.columns))
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        y_true_all.append(y_test.to_numpy())
        y_pred_all.append(np.asarray(y_pred))

    y_true = np.vstack(y_true_all)
    y_pred = np.vstack(y_pred_all)

    mae_overall = float(mean_absolute_error(y_true, y_pred))
    r2_overall = float(r2_score(y_true, y_pred, multioutput="uniform_average"))

    per = []
    for i, col in enumerate(VITAMIN_COLS):
        per.append(
            {
                "target": col,
                "mae": float(mean_absolute_error(y_true[:, i], y_pred[:, i])),
                "r2": float(r2_score(y_true[:, i], y_pred[:, i])),
            }
        )
    per_df = pd.DataFrame(per).sort_values("mae", ascending=False).reset_index(drop=True)
    return EvalResult(mae_overall=mae_overall, r2_overall=r2_overall, per_target=per_df)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--csv",
        default=os.path.join(os.path.dirname(__file__), "..", "data", "vitamin_deficiency_disease_dataset_20260123.csv"),
        help="Path to vitamin dataset CSV.",
    )
    parser.add_argument("--kfold", type=int, default=0, help="If >0, run K-Fold CV with this many splits.")
    args = parser.parse_args()

    if args.kfold and args.kfold > 1:
        res = evaluate_kfold(args.csv, k=int(args.kfold))
        title = f"K-Fold (k={args.kfold})"
    else:
        res = evaluate_holdout(args.csv)
        title = "Holdout (80/20)"

    print(f"== Model evaluation: {title} ==")
    print(f"Overall MAE: {res.mae_overall:.4f}")
    print(f"Overall R2 : {res.r2_overall:.4f}")
    print("")
    print("Per-target metrics (higher MAE is worse):")
    print(res.per_target.to_string(index=False))


if __name__ == "__main__":
    main()

