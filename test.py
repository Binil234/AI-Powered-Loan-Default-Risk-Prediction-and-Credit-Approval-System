import requests

url = "http://127.0.0.1:5000/predict"

data = {
    "grid": 2,
    "quali_pos": 1,
    "driver_avg_pos": 3,
    "constructor_avg_pos": 2
}

response = requests.post(url, json=data)

print(response.json())