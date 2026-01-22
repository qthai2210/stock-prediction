# 🎉 Stock Prediction Project - Quick Start Guide

## ✅ Setup Complete!

Your virtual environment with Python 3.10 is now set up and ready to use!

## 📝 How to Run the Project

### 1. Activate Virtual Environment

Every time you open a new terminal, activate the virtual environment first:

```powershell
cd d:\stock-prediction
.\venv\Scripts\Activate.ps1
```

You'll see `(venv)` appear in your terminal prompt.

### 2. Train the Model

```powershell
python ai\model_training.py
```

**What it does:**
- Fetches 2 years of historical data for VCB stock
- Calculates technical indicators (SMA5, SMA20)
- Trains a Linear Regression model
- Saves the model to `models/model_VCB.pkl`
- Shows MAE and RMSE metrics
- Predicts tomorrow's closing price

**Example output:**
```
Loading libraries...
Fetching data for VCB from 2024-01-19 to 2026-01-19...
Model trained successfully!
MAE: 2.45
RMSE: 3.12
Model saved to models/model_VCB.pkl
Latest Close: 73.00
Predicted Next Close: 72.44
```

### 3.  Test the Model

```powershell
python ai\test_model.py
```

**What it does:**
- Loads the saved model
- Runs a test prediction
- Verifies everything works correctly

## 🔧 Customization

### Change Stock Symbol

Edit line 83 in `ai\model_training.py`:
```python
symbol = "VCB"  # Try: VNM, HPG, FPT, VIC, etc.
```

### Adjust Training Period

Edit lines 84-85 in `ai\model_training.py`:
```python
end_date = datetime.now().strftime('%Y-%m-%d')
start_date = (datetime.now() - timedelta(days=365*2)).strftime('%Y-%m-%d')  # 2 years
```

## 📁 Files Created

```
d:\stock-prediction\
├── venv\                    # Virtual environment (Python 3.10)
├── models\
│   └── model_VCB.pkl        # Trained model
├── ai\
│   ├── model_training.py    # Training script
│   ├── test_model.py        # Testing script
│   └── requirements-training.txt
└── README.md                # Documentation
```

## 🎯 Next Steps

1. **Try different stocks**: Edit the `symbol` variable
2. **Add more features**: Include more technical indicators
3. **Try advanced models**: Switch from Linear Regression to LSTM or Gradient Boosting
4. **Create a web interface**: Build a Flask/Streamlit app to visualize predictions

## 💡 Tips

- Always activate the virtual environment before running scripts
- The model is retrained every time you run `model_training.py`
- Internet connection is required to fetch stock data
- Data is fetched from VCI source (Vietnam stocks only)

## ⚠️  Troubleshooting

**If you see import errors:**
```powershell
python -m pip install --upgrade -r ai\requirements-training.txt
```

**To deactivate virtual environment:**
```powershell
deactivate
```

**To delete and recreate virtual environment:**
```powershell
Remove-Item -Recurse -Force venv
py -3.10 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r ai\requirements-training.txt
```

## 🚀 Have Fun Building!

Your stock prediction AI is ready to go. Happy coding! 📈
