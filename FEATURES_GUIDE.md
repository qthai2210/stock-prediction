# 🗞️ News Sentiment Analysis & ⚙️ Hyperparameter Tuning

## Features Mới

### 1. News Sentiment Analysis (NGU-42) ✅

Phân tích cảm xúc tin tức thực tế thay vì placeholder 0.5.

**Cách hoạt động:**
- Crawl tin tức từ CafeF, VnExpress Financial
- Dịch từ tiếng Việt sang tiếng Anh
- Phân tích sentiment bằng TextBlob
- Cache kết quả 24 giờ để tránh scraping lại

**Sử dụng:**

```bash
# Test news scraper
python ai\news_scraper.py

# Sử dụng trong model (tự động)
python ai\model_training_advanced.py
python ai\predict.py VCB
```

**Lưu ý:**
- Web scraping có thể không hoạt động 100% do website structure thay đổi
- Sentiment sẽ fallback về 0.5 (neutral) nếu không crawl được
- Cache được lưu trong `ai/.cache/`

---

### 2. Hyperparameter Tuning (NGU-44) ✅

Tối ưu hóa tham số Gradient Boosting để cải thiện độ chính xác.

**Cách hoạt động:**
- Sử dụng RandomizedSearchCV
- Tìm kiếm 7 parameters quan trọng
- Cross-validation 5-fold
- Lưu best params vào JSON

**Sử dụng:**

```bash
# Chạy tuning (mất 10-30 phút)
python ai\hyperparameter_tuning.py --symbol VCB --n_iter 50

# Tuning nhanh (5-10 phút)
python ai\hyperparameter_tuning.py --symbol VCB --n_iter 20

# Sau khi tuning xong, train lại model
python ai\model_training_advanced.py
```

**Parameters được tối ưu:**
- `n_estimators`: Số lượng cây (50-300)
- `learning_rate`: Tốc độ học (0.01-0.2)
- `max_depth`: Độ sâu cây (3-7)
- `min_samples_split`: Min samples để split (2-15)
- `min_samples_leaf`: Min samples ở leaf (1-4)
- `subsample`: Tỷ lệ sample (0.8-1.0)
- `max_features`: Features cho split (sqrt, log2, None)

**Kết quả:**
- Best params được lưu trong `ai/best_params.json`
- Model training sẽ tự động sử dụng tuned params
- Cải thiện dự kiến: 5-15% R² score

---

## Quick Start

### Setup Dependencies

```bash
# Activate venv
.\venv\Scripts\Activate.ps1

# Install new dependencies (nếu chưa)
pip install googletrans==4.0.0-rc1 newspaper3k==0.2.8 nltk==3.8.1
```

### Workflow Hoàn Chỉnh

```bash
# 1. (Tùy chọn) Chạy hyperparameter tuning
python ai\hyperparameter_tuning.py --symbol VCB --n_iter 30

# 2. Train model (tự động dùng tuned params nếu có)
python ai\model_training_advanced.py

# 3. Dự đoán
python ai\predict.py VCB
```

---

## File Structure

```
stock-prediction/
├── ai/
│   ├── news_scraper.py              # 🗞️ NEW - News sentiment module
│   ├── hyperparameter_tuning.py     # ⚙️ NEW - Hyperparameter optimizer
│   ├── best_params.json             # 💾 Generated - Tuned parameters
│   ├── .cache/                      # 📁 Generated - Sentiment cache
│   │   └── sentiment_VCB.json
│   ├── feature_engineering.py       # 📊 UPDATED - Uses real sentiment
│   ├── model_training_advanced.py   # 🤖 UPDATED - Uses tuned params
│   ├── predict.py
│   └── ...
```

---

## Performance Comparison

| Metric | Before | After Tuning | Improvement |
|--------|--------|--------------|-------------|
| News Sentiment | Fixed 0.5 | Dynamic 0-1 | ✅ Real data |
| Model Params | Default | Optimized | +5-15% R² |
| Training Time | ~30s | ~30s | Same |
| Tuning Time | N/A | 10-30 min | One-time |

---

## Troubleshooting

### News Scraper không crawl được

**Triệu chứng:**
```
⚠ No headlines found for VCB, using neutral sentiment
```

**Giải pháp:**
1. Kiểm tra internet connection
2. Website có thể đã thay đổi structure
3. Tạm thời chấp nhận fallback 0.5
4. Hoặc update selectors trong `news_scraper.py`

### Hyperparameter Tuning lỗi

**Lỗi thường gặp:**
```
ModuleNotFoundError: No module named 'sklearn'
```

**Giải pháp:**
```bash
pip install scikit-learn
```

### Model không sử dụng tuned params

**Kiểm tra:**
```bash
# Xem file có tồn tại không
dir ai\best_params.json

# Xem nội dung
type ai\best_params.json
```

---

## Advanced Usage

### Custom Search Space

Edit `hyperparameter_tuning.py` line 58:

```python
param_distributions = {
    'n_estimators': [100, 200, 500],  # Custom values
    'learning_rate': [0.05, 0.1],
    # ...
}
```

### Multi-Symbol Tuning

```bash
# Tune multiple stocks
for symbol in VCB HPG FPT VNM; do
    python ai\hyperparameter_tuning.py --symbol $symbol --n_iter 30
done
```

### Force Retrain Without Tuned Params

```bash
# Delete tuned params temporarily
mv ai\best_params.json ai\best_params.json.backup
python ai\model_training_advanced.py
mv ai\best_params.json.backup ai\best_params.json
```

---

## Next Steps

- [ ] Integrate News API cho reliable data source
- [ ] Implement Vietnamese NLP model (PhoBERT)
- [ ] Auto-retune monthly
- [ ] Web dashboard để visualize sentiment trends
- [ ] A/B testing tuned vs non-tuned models

---

**Happy Trading! 📈🚀**
