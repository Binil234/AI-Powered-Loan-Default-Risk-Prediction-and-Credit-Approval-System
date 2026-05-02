from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import os
import pandas as pd

app = Flask(__name__)

# ---------------------------------------
# LOAD MODEL
# ---------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "f1_model.pkl"))

# ---------------------------------------
# LOAD DATA
# ---------------------------------------
DATA_PATH = os.path.join(BASE_DIR, "data")

drivers_df = pd.read_csv(os.path.join(DATA_PATH, "drivers.csv"))
results_df = pd.read_csv(os.path.join(DATA_PATH, "results.csv"))
constructors_df = pd.read_csv(os.path.join(DATA_PATH, "constructors.csv"))

# Create full name
drivers_df['name'] = drivers_df['forename'] + " " + drivers_df['surname']

# Driver list
driver_list = sorted(drivers_df['name'].unique())

# ---------------------------------------
# HOME
# ---------------------------------------
@app.route('/')
def home():
    return render_template('index.html')

# ---------------------------------------
# GET DRIVERS
# ---------------------------------------
@app.route('/drivers', methods=['GET'])
def get_drivers():
    return jsonify(driver_list)

# ---------------------------------------
# DRIVER STATS (REAL)
# ---------------------------------------
@app.route('/driver_stats/<driver_name>', methods=['GET'])
def driver_stats(driver_name):
    try:
        driver = drivers_df[drivers_df['name'] == driver_name]

        if driver.empty:
            return jsonify({"error": "Driver not found"})

        driver_id = driver.iloc[0]['driverId']

        driver_results = results_df[results_df['driverId'] == driver_id]

        if driver_results.empty:
            return jsonify({"error": "No data found"})

        # Last 5 races avg
        last5 = driver_results.sort_values(by="raceId").tail(5)
        driver_avg = last5['positionOrder'].replace(0, np.nan).mean()

        # Constructor
        constructor_id = driver_results.iloc[-1]['constructorId']
        constructor_name = constructors_df[
            constructors_df['constructorId'] == constructor_id
        ]['name'].values[0]

        # Constructor avg
        cons_results = results_df[results_df['constructorId'] == constructor_id]
        cons_avg = cons_results['positionOrder'].replace(0, np.nan).mean()

        # Form
        if driver_avg <= 4:
            form = "🔥 Strong"
        elif driver_avg <= 8:
            form = "📊 Average"
        else:
            form = "📉 Weak"

        return jsonify({
            "name": driver_name,
            "team": constructor_name,
            "avg": round(driver_avg, 2),
            "cons": round(cons_avg, 2),
            "form": form
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# ---------------------------------------
# PREDICT
# ---------------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        grid = float(data['grid'])
        driver_avg = float(data['driver_avg_pos'])
        constructor_avg = float(data['constructor_avg_pos'])

        features = np.array([[grid, driver_avg, constructor_avg]])

        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]

        return jsonify({
            "top3_prediction": int(prediction),
            "probability": float(probability)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)