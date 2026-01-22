# 📈 Stock Prediction AI Project

A machine learning project for predicting Vietnamese stock prices using historical data and technical indicators.

---

## 🚀 QUICK START - Advanced Model (RECOMMENDED)

The project now includes an **advanced model with 29 features** including technical indicators, financial ratios, and macro data!

### Prerequisites
- **Python 3.10 - 3.12** (in virtual environment)
- Internet connection for fetching stock data

### Installation & Usage

```bash
# 1. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 2. Make a quick prediction
python ai\predict.py VCB

# 3. Train new model (optional)
python ai\model_training_advanced.py

# 4. View summary
python ai\summary.py
```

### 📊 What's Included

**29 Features:**
- ✅ **20 Technical Indicators**: RSI, MACD, Bollinger Bands, EMA, SMA, Volume, VWAP, Momentum
- ✅ **5 Financial Ratios**: EPS, P/E, P/B, ROE, ROA  
- ✅ **2 Macro Data**: VN-Index, USD/VND
- ✅ **2 Base Features**: Close price, News sentiment

**Models:**
- 🤖 **Gradient Boosting** (Advanced) - ~29% better accuracy
- 📝 **Linear Regression** (Simple) - For comparison

📖 **Full Guide**: [ADVANCED_GUIDE.md](file:///d:/stock-prediction/ADVANCED_GUIDE.md)

---

## 📋 Original Quick Start

### Prerequisites
- **Python 3.10 - 3.12** recommended (Python 3.14 has compatibility issues with some dependencies)
- Internet connection for fetching stock data

### Installation

1. **Navigate to the AI directory:**
   ```bash
   cd d:\stock-prediction\ai
   ```

2. **Install dependencies:**
   ```bash
   python -m pip install -r requirements-training.txt
   ```

### Running the Project

#### 1️⃣ Train the Model
```bash
python model_training.py
```

**What it does:**
- Fetches 2 years of historical data for VCB (Vietcombank) stock
- Calculates technical indicators (5-day SMA, 20-day SMA)
- Trains a Linear Regression model
- Saves the model to `models/model_VCB.pkl`
- Displays evaluation metrics (MAE, RMSE)
- Makes a prediction for tomorrow's closing price

#### 2️⃣ Test the Model
```bash
python test_model.py
```

**What it does:**
- Loads the saved model
- Runs a test prediction with dummy data
- Verifies the model works correctly

## 📊 Example Output

```
Loading libraries...
Fetching data for VCB from 2024-01-19 to 2026-01-19...
Model trained successfully!
MAE: 2.45
RMSE: 3.12
Model saved to models/model_VCB.pkl
Latest Close: 95.50
Predicted Next Close: 96.20
```

## ⚙️ Customization

### Change Stock Symbol
Edit line 80 in `model_training.py`:
```python
symbol = "VCB"  # Change to any Vietnamese stock (e.g., "VNM", "HPG", "FPT")
```

### Adjust Training Period
Edit lines 81-82 in `model_training.py`:
```python
end_date = datetime.now().strftime('%Y-%m-%d')
start_date = (datetime.now() - timedelta(days=365*2)).strftime('%Y-%m-%d')  # 2 years
```

## 🐛 Troubleshooting

### Python 3.14 Compatibility Issue
If you're using Python 3.14 and encounter import deadlock errors:

**Solution:** Downgrade to Python 3.10-3.12:
```bash
# Download Python 3.12 from python.org
# Or use pyenv/conda to manage versions
```

### No Data Fetched
- Check your internet connection
- Verify the stock symbol is valid (Vietnamese stocks)
- Ensure vnstock is properly installed

### Import Errors
Reinstall dependencies:
```bash
python -m pip install --upgrade -r requirements-training.txt
```

## 📁 Project Structure

```
stock-prediction/
└── ai/
    ├── model_training.py          # Main training script
    ├── test_model.py              # Model testing script
    ├── requirements-training.txt  # Dependencies
    └── models/                    # Saved models directory
        └── model_VCB.pkl          # Trained model (generated)
```

## 🔮 Features

- ✅ Fetches real-time Vietnamese stock data using vnstock
- ✅ Technical indicators (SMA5, SMA20)
- ✅ Linear Regression for price prediction
- ✅ Model evaluation metrics (MAE, RMSE)
- ✅ Model persistence (save/load)

## 📈 Future Enhancements

- Add more technical indicators (RSI, MACD, Bollinger Bands)
- Implement advanced models (LSTM, Gradient Boosting)
- Create a web interface for predictions
- Add sentiment analysis from news
- Support multiple stock symbols

## 📝 License

MIT License - Feel free to use and modify!
