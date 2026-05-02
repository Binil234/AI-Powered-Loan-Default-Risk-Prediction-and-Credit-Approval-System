from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import os

app = Flask(__name__)

# ---------------------------------------
# LOAD MODEL
# ---------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "f1_model.pkl")
model = joblib.load(model_path)

# ---------------------------------------
# HOME ROUTE — serves the dashboard UI
# ---------------------------------------
@app.route('/')
def home():
    return render_template('index.html')

# ---------------------------------------
# PREDICTION ROUTE
# ---------------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Model was trained on 3 features
        grid            = float(data['grid'])
        driver_avg      = float(data['driver_avg_pos'])
        constructor_avg = float(data['constructor_avg_pos'])

        features = np.array([[grid, driver_avg, constructor_avg]])

        prediction  = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]

        return jsonify({
            "top3_prediction": int(prediction),
            "probability":     float(probability)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------------------------------
if __name__ == '__main__':
    app.run(debug=True)