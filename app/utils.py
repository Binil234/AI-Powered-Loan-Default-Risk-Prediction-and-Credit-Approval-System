import os, joblib, numpy as np, pandas as pd

# Resolve Models directory from multiple possible launch locations
_HERE = os.path.dirname(os.path.abspath(__file__))
_CANDIDATES = [
    os.path.join(_HERE, '..', 'Models'),          # launched from project root
    os.path.join(_HERE, 'Models'),                 # launched from app/
    os.path.join(os.getcwd(), 'Models'),           # cwd fallback
    os.path.join(os.getcwd(), '..', 'Models'),     # parent cwd fallback
]
MODEL_DIR = next((p for p in _CANDIDATES if os.path.isdir(p)), _CANDIDATES[0])

def load_artifacts():

    print("MODEL_DIR:", MODEL_DIR)

    print(os.listdir(MODEL_DIR))

    model_path = os.path.join(MODEL_DIR, 'xgboost_loan_model.pkl')

    cols_path = os.path.join(MODEL_DIR, 'model_columns.pkl')

    thr_path = os.path.join(MODEL_DIR, 'threshold.pkl')

    print(model_path)

    model = joblib.load(model_path)

    cols = joblib.load(cols_path)

    thr = float(joblib.load(thr_path))

    return model, cols, thr

def preprocess(inputs: dict, model_cols: list) -> pd.DataFrame:

    df = pd.DataFrame([inputs])

    # Convert employment length text to numeric
    if 'emp_length' in df.columns:

        emp_map = {
            '< 1 year': 0,
            '1 year': 1,
            '2 years': 2,
            '3 years': 3,
            '4 years': 4,
            '5 years': 5,
            '6 years': 6,
            '7 years': 7,
            '8 years': 8,
            '9 years': 9,
            '10+ years': 10
        }

        df['emp_length'] = df['emp_length'].map(emp_map)

    # One-hot encoding
    df = pd.get_dummies(df)

    # Match training columns
    df = df.reindex(columns=model_cols, fill_value=0)

    return df

def predict(inputs: dict, model, model_cols: list, threshold: float):
    X    = preprocess(inputs, model_cols)
    prob = float(model.predict_proba(X)[0][1])
    pred = int(prob >= threshold)
    print(X.T)
    return prob, pred

def risk_label(prob: float, inputs: dict):

    # Business rule overrides
    if (
        inputs['fico_range_low'] < 620 or
        inputs['pub_rec_bankruptcies'] >= 1 or
        inputs['delinq_2yrs'] >= 5 or
        inputs['dti'] >= 35 or
        inputs['int_rate'] >= 25
    ):
        return "High Risk", "#ef4444", "🔴"

    # ML probability logic
    if prob < 0.35:
        return "Low Risk", "#10b981", "🟢"

    if prob < 0.65:
        return "Medium Risk", "#f59e0b", "🟡"

    return "High Risk", "#ef4444", "🔴"

def recommendation(prob: float, inputs: dict):

    # High-risk rule overrides
    if (
        inputs['fico_range_low'] < 620 or
        inputs['pub_rec_bankruptcies'] >= 1 or
        inputs['delinq_2yrs'] >= 5
    ):
        return "❌ REJECTED", "error"

    # ML-based recommendation
    if prob < 0.35:
        return "✅ APPROVED", "success"

    if prob < 0.65:
        return "⚠️ MANUAL REVIEW", "warning"

    return "❌ REJECTED", "error"
