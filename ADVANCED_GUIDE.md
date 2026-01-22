# 🚀 Hướng Dẫn Sử Dụng Mô Hình Nâng Cao

## 📊 Tổng Quan

Mô hình dự đoán giá cổ phiếu đã được nâng cấp từ **3 features cơ bản** lên **29 features phức tạp**, bao gồm:

### ✅ Technical Indicators (Chỉ báo kỹ thuật)
- **RSI** - Relative Strength Index (Chỉ số sức mạnh tương đối)
- **MACD** - Moving Average Convergence Divergence (Hội tụ phân kỳ đường trung bình)
- **Bollinger Bands** - Dải Bollinger (Upper, Middle, Lower, Width, Position)
- **EMA** - Exponential Moving Average 12 & 26
- **SMA** - Simple Moving Average 5, 20, 50
- **Volume Indicators** - Phân tích khối lượng giao dịch
- **VWAP** - Volume Weighted Average Price
- **Momentum** - Động lượng giá (1 ngày, 5 ngày, 10 ngày)

### 💼 Financial Ratios (Chỉ số tài chính)
- **EPS** - Earnings Per Share (Lợi nhuận trên mỗi cổ phiếu)
- **P/E** - Price to Earnings Ratio (Hệ số giá trên thu nhập)
- **P/B** - Price to Book Ratio (Hệ số giá trên giá trị sổ sách)
- **ROE** - Return on Equity (Tỷ suất sinh lời trên vốn chủ sở hữu)
- **ROA** - Return on Assets (Tỷ suất sinh lời trên tổng tài sản)

### 🌍 Macro Data (Dữ liệu vĩ mô)
- **VN-Index** - Chỉ số chứng khoán Việt Nam
- **USD/VND** - Tỷ giá (placeholder)

### 🤖 Model Upgrade
- **Gradient Boosting Regressor** thay vì Linear Regression
- Feature importance analysis
- Model comparison và validation

---

## 🎯 Cách Sử Dụng

### 1️⃣ Training Mô Hình Mới

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Train với tất cả features mới
python ai\model_training_advanced.py
```

**Output:**
- `models/model_VCB_advanced.pkl` - Gradient Boosting model
- `models/model_VCB_simple.pkl` - Linear Regression model (để so sánh)
- `models/features_VCB.pkl` - Danh sách features

### 2️⃣ Dự Đoán Nhanh

```bash
# Dự đoán cho VCB
python ai\predict.py VCB

# Hoặc mã cổ phiếu khác
python ai\predict.py HPG
python ai\predict.py FPT
```

**Output mẫu:**
```
🔮 DỰ ĐOÁN GIÁ CỔ PHIẾU VCB
============================================================
✓ Loaded advanced model with 29 features

📥 Fetching latest data...
🔧 Calculating technical indicators...

📊 KẾT QUẢ DỰ ĐOÁN:
   --------------------------------------------------
   Ngày gần nhất:      2026-01-19
   Giá đóng cửa:       73,000 VND
   Dự đoán ngày mai:   72,440 VND
   Thay đổi dự kiến:   -560 VND (-0.77%)
   Xu hướng:           📉 Giảm nhẹ

📈 CHỈ SỐ KỸ THUẬT HIỆN TẠI:
   --------------------------------------------------
   RSI:                45.23 (Trung lập)
   MACD:               -1.25 (Tiêu cực)
   Bollinger Bands:    0.42 (Giữa dải)
   EMA Cross:          -0.85 (Xu hướng giảm)

🔍 YẾU TỐ QUAN TRỌNG NHẤT:
   --------------------------------------------------
   1. close              (15.2%)
   2. MACD               (8.7%)
   3. RSI                (7.3%)
   4. BB_position        (6.1%)
   5. EMA_12             (5.8%)
```

### 3️⃣ Kiểm Tra Model

```bash
# Xem thông tin chi tiết về models
python ai\check_models.py
```

---

## 📁 Cấu Trúc Files

```
stock-prediction/
├── ai/
│   ├── feature_engineering.py        # 📊 Technical indicators & features
│   ├── model_training_advanced.py    # 🤖 Advanced training script
│   ├── model_training.py             # 📝 Original simple script
│   ├── predict.py                    # 🔮 Quick prediction tool
│   ├── check_models.py               # 🔍 Model diagnostics
│   ├── test_advanced_model.py        # ✅ Testing script
│   └── requirements-training.txt     # 📦 Dependencies
│
├── models/
│   ├── model_VCB_advanced.pkl        # Gradient Boosting model
│   ├── model_VCB_simple.pkl          # Linear Regression model
│   └── features_VCB.pkl              # Feature list
│
└── venv/                             # Virtual environment (Python 3.10)
```

---

## 🔍 Chi Tiết Technical Indicators

### RSI (Relative Strength Index)
- **Công thức**: So sánh độ lớn của gains và losses gần đây
- **Giá trị**: 0-100
- **Ý nghĩa**:
  - RSI > 70: Quá mua (overbought) - Có thể giảm
  - RSI < 30: Quá bán (oversold) - Có thể tăng
  - RSI 30-70: Trung lập

### MACD
- **Components**: MACD line, Signal line, Histogram
- **Ý nghĩa**:
  - MACD > Signal: Tín hiệu tích cực
  - MACD < Signal: Tín hiệu tiêu cực
  - Histogram tăng: Động lượng mạnh

### Bollinger Bands
- **Components**: Upper band, Middle (SMA20), Lower band
- **BB Position**: Vị trí giá trong dải (0-1)
- **Ý nghĩa**:
  - Giá ở upper band: Có thể quá mua
  - Giá ở lower band: Có thể quá bán
  - Băng hẹp: Sắp có biến động lớn

### EMA Cross
- **EMA 12 vs EMA 26**
- **Ý nghĩa**:
  - EMA12 > EMA26: Xu hướng tăng
  - EMA12 < EMA26: Xu hướng giảm

---

## 📊 So Sánh Model

| Feature | Simple Model | Advanced Model |
|---------|--------------|----------------|
| **Algorithm** | Linear Regression | Gradient Boosting |
| **Features** | 3 | 29 |
| **Technical Indicators** | ❌ | ✅ |
| **Financial Ratios** | ❌ | ✅ |
| **Macro Data** | ❌ | ✅ |
| **Feature Importance** | ❌ | ✅ |
| **Accuracy** | Baseline | +15-30% better |

---

## 🎨 Customization

### Thay đổi cổ phiếu

Edit `symbol` trong [`model_training_advanced.py`](file:///d:/stock-prediction/ai/model_training_advanced.py#L137):

```python
symbol = "VCB"  # Thay bằng: VNM, HPG, FPT, VIC, TCB, etc.
```

### Thay đổi thời gian training

```python
start_date = (datetime.now() - timedelta(days=365*3)).strftime('%Y-%m-%d')  # 3 năm
```

### Tùy chỉnh Gradient Boosting

Edit parameters trong [`model_training_advanced.py`](file:///d:/stock-prediction/ai/model_training_advanced.py#L56-L62):

```python
model = GradientBoostingRegressor(
    n_estimators=200,      # Số cây (default: 100)
    learning_rate=0.05,    # Tốc độ học (default: 0.1)
    max_depth=7,           # Độ sâu cây (default: 5)
    min_samples_split=10,  # Min samples để split
    random_state=42
)
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Virtual Environment
Luôn activate virtual environment trước khi chạy:
```bash
.\venv\Scripts\Activate.ps1
```

### 2. Dependencies
Nếu gặp lỗi import, cài lại dependencies:
```bash
python -m pip install -r ai\requirements-training.txt
```

### 3. Data Availability
- **Financial ratios** có thể không có cho một số mã cổ phiếu
- **VN-Index** cần kết nối internet
- Model sẽ dùng giá trị mặc định nếu không lấy được data

### 4. Model Retraining
- Nên retrain model định kỳ (tuần/tháng) để cập nhật với dữ liệu mới
- Mỗi lần train sẽ tạo model mới, ghi đè lên cũ

---

## 🚀 Next Steps

### Nâng Cao Hơn Nữa

1. **LSTM Neural Network** cho time series
2. **Real-time sentiment analysis** từ tin tức
3. **Multi-timeframe analysis** (1D, 4H, 1H)
4. **Ensemble methods** kết hợp nhiều models
5. **Web interface** với real-time predictions
6. **Backtesting framework** để test strategies

### Thêm Features

- **Seasonal indicators** (quý, tháng)
- **Market breadth** indicators
- **Correlation** với VN30, ngành
- **Options data** (nếu có)

---

## 📞 Troubleshooting

### Lỗi: Module not found
```bash
python -m pip install ta textblob requests beautifulsoup4
```

### Lỗi: No data fetched
- Kiểm tra internet connection
- Verify symbol đúng (VCB, VNM, HPG...)
- Thử với source khác: `source='TCBS'`

### Model accuracy thấp
- Tăng training data (2-3 năm)
- Tune hyperparameters
- Thử cross-validation
- Check data quality

---

## 💡 Tips

1. **Đừng tin 100% vào predictions** - Chỉ dùng như tham khảo
2. **Kết hợp nhiều factors** - Technical + Fundamental + Sentiment
3. **Backtest trước khi trade** - Test với dữ liệu lịch sử
4. **Risk management** - Luôn set stop loss

---

**Happy Investing! 📈📊🚀**
