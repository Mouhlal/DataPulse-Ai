# AI Data Analyst 🤖📊

**AI Data Analyst** is an intelligent web application designed to democratize Data Science and Artificial Intelligence. It allows non-technical users to upload raw datasets (CSV, Excel, JSON) and automatically transforms them into actionable business intelligence, interactive visualizations, and predictive analytics without requiring a single line of code.

## 🚀 Key Features

### 1. Universal Data Ingestion & Auto-Cleaning
- **Format Support:** Easily upload `.csv`, `.xlsx`, `.xls`, and `.json` files.
- **Automatic Curation:** One-click "Fix automatically" pipeline that handles:
  - Missing values imputation.
  - Duplicate row deletion.
  - Outlier capping using the 3-Sigma Z-Score rule.
  - Date format standardization.

### 2. Context-Aware Business Intelligence
- **Semantic Detection:** The AI engine scans your columns to understand the context of your data (e.g., detecting E-commerce variables like Price, Quantity, Product).
- **Time-Series Forecasting:** Automatically groups data by months, calculates growth, and extrapolates trends using mathematical models (`numpy.polyfit`).
- **AI Insights Generation:** Generates human-readable sentences in real-time on your dashboard:
  - *"Product X is the best selling product in March."*
  - *"Predicted revenue for next month: $XX,XXX."*
  - *"Product Y expected to be best seller next month."*

### 3. Machine Learning Hub
Access raw predictive power directly from the UI:
- **K-Means Clustering:** Unsupervised segmentation of your customers or products.
- **Linear Regression:** Predict continuous target variables (e.g., future sales or pricing).
- **Logistic Regression:** Supervised classification for binary outcomes.

### 4. Advanced Visualizations & Reporting
- **Interactive Dashboards:** Area charts, Recharts Pie charts, and dynamic distribution graphs.
- **Correlation Heatmap:** CSS-based thermal matrix to visualize feature relationships instantly.
- **Export Capabilities:** Download the cleaned dataset as a pristine CSV or extract the entire dashboard as a beautifully formatted PDF report.

## 🛠️ Tech Stack

### Backend (Data Engine & AI)
- **Python 3**
- **Django & Django REST Framework (DRF):** Robust API architecture.
- **Pandas & Numpy:** Core data manipulation and mathematical forecasting.
- **Scikit-Learn:** Machine Learning models implementation.

### Frontend (User Interface)
- **React.js:** Component-based reactive UI.
- **Vite:** Next-generation ultra-fast frontend tooling.
- **Tailwind CSS:** Utility-first framework for the modern "Glassmorphism" aesthetic.
- **Recharts:** Composable charting library.
- **Axios & Lucide-React:** For API communications and beautiful iconography.

## 🚦 Getting Started

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.
