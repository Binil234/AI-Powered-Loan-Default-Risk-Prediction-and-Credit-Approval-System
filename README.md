# 🏎️ F1 Winner Prediction System

A machine learning-based system that predicts whether a Formula 1 driver will finish in the **Top 3 (podium)** using historical race data.

---

## 🚀 Overview

This project uses historical Formula 1 data to build a predictive model that estimates the probability of a driver finishing on the podium. The model is deployed using a Flask API, allowing real-time predictions.

---

## 🧠 Features

* 📊 Machine Learning model using XGBoost
* ⚡ Real-time prediction via Flask API
* 📈 Probability-based output (not just Yes/No)
* 🧩 Clean data preprocessing and feature engineering
* 🏁 Podium (Top 3) prediction system

---

## 📥 Input Features

The model uses the following inputs:

* Grid Position
* Driver Average Position (recent performance)
* Constructor Average Position

---

## 📤 Output

* `top3_prediction` → 1 (Yes) or 0 (No)
* `probability` → Likelihood of finishing in Top 3

---

## 🛠️ Tech Stack

* Python
* Pandas
* Scikit-learn
* XGBoost
* Flask

---

## ▶️ How to Run Locally

### 1. Clone the repository

```
git clone https://github.com/YOUR-USERNAME/F1_winner_prediction.git
cd F1_winner_prediction
```

### 2. Create virtual environment

```
python -m venv f1env
f1env\Scripts\activate   # Windows
```

### 3. Install dependencies

```
pip install -r requirements.txt
```

### 4. Run the Flask app

```
python app.py
```

### 5. Open in browser

```
http://127.0.0.1:5000
```

---

## 🧪 API Usage

### Endpoint:

```
POST /predict
```

### Example Request:

```json
{
  "grid": 2,
  "driver_avg_pos": 3,
  "constructor_avg_pos": 2
}
```

### Example Response:

```json
{
  "top3_prediction": 1,
  "probability": 0.91
}
```

---

## 📌 Future Improvements

* Driver-based predictions (auto feature extraction)
* Integration with real-time F1 APIs
* Interactive frontend dashboard
* Enhanced feature engineering (qualifying, lap times, etc.)

---

## 👨‍💻 Author

**Binil John**

---

## 📄 License

This project is for educational purposes.
