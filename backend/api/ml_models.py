import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def load_dataframe(file_path):
    if file_path.endswith('.csv'):
        try:
            return pd.read_csv(file_path, encoding='utf-8')
        except UnicodeDecodeError:
            return pd.read_csv(file_path, encoding='latin1')
    elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        return pd.read_excel(file_path)
    elif file_path.endswith('.json'):
        try:
            return pd.read_json(file_path, encoding='utf-8')
        except UnicodeDecodeError:
            return pd.read_json(file_path, encoding='latin1')
    else:
        raise ValueError("Unsupported file format. Please upload CSV, Excel, or JSON.")

def generate_summary(file_path):
    try:
        df = load_dataframe(file_path)
        stats = df.describe().to_dict()
        
        # Keep numeric stats parsing safe
        for col in list(stats.keys()):
            for k, v in stats[col].items():
                if pd.isna(v) or (isinstance(v, (int, float)) and np.isinf(v)):
                    stats[col][k] = None
                    
        nums = df.select_dtypes(include=['number'])
        correlation = nums.corr().fillna(0).to_dict() if len(nums.columns) > 1 else {}
        
        # Keep numeric stats parsing safe
        for col in list(stats.keys()):
            for k, v in stats[col].items():
                if pd.isna(v) or (isinstance(v, (int, float)) and np.isinf(v)):
                    stats[col][k] = None

        summary = {
            "rows": len(df),
            "columns": len(df.columns),
            "missing_values": df.isnull().sum().to_dict(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "numeric_stats": stats,
            "correlation_matrix": correlation,
            "duplicates": int(df.duplicated().sum())
        }
        
        insights = []
        if summary["duplicates"] > 0:
            insights.append(f"Found {summary['duplicates']} duplicate rows. Consider cleaning data.")
            
        for col, count in summary["missing_values"].items():
            if count > 0:
                insights.append(f"Column '{col}' has {count} missing values.")
                
        if len(df) > 1000:
            insights.append(f"Large dataset with {len(df)} rows detected. Sampling might be optimal.")
            
        metrics = {}
        # --- NEW CONTEXT-AWARE E-COMMERCE LOGIC ---
        columns_lower = {col.lower(): col for col in df.columns}
        
        product_col = next((columns_lower[k] for k in ['product', 'item', 'name'] if k in columns_lower), None)
        category_col = next((columns_lower[k] for k in ['category', 'type', 'department'] if k in columns_lower), None)
        revenue_col = next((columns_lower[k] for k in ['revenue', 'sales', 'total', 'price'] if k in columns_lower and pd.api.types.is_numeric_dtype(df[columns_lower[k]])), None)
        quantity_col = next((columns_lower[k] for k in ['quantity', 'qty', 'count'] if k in columns_lower and pd.api.types.is_numeric_dtype(df[columns_lower[k]])), None)
        date_col = next((columns_lower[k] for k in ['date', 'time', 'month', 'year', 'day'] if k in columns_lower), None)
        customer_col = next((columns_lower[k] for k in ['customer', 'client', 'address', 'user'] if k in columns_lower), None)
        price_col = next((columns_lower[k] for k in ['price', 'unit_price', 'cost'] if k in columns_lower and pd.api.types.is_numeric_dtype(df[columns_lower[k]])), None)
            
        if product_col and revenue_col:
            try:
                best_revenue_prod = df.groupby(product_col)[revenue_col].sum().idxmax()
                insights.append(f"Product '{best_revenue_prod}' generated the highest sales.")
                
                total_rev = df[revenue_col].sum()
                if total_rev > 0:
                    top_5_rev = df.groupby(product_col)[revenue_col].sum().nlargest(5).sum()
                    pct = (top_5_rev / total_rev) * 100
                    insights.append(f"Top 5 products generate {pct:.1f}% of total revenue.")
            except Exception: pass

        if product_col and quantity_col:
            try:
                least_qty_prod = df.groupby(product_col)[quantity_col].sum().idxmin()
                insights.append(f"Product '{least_qty_prod}' has the lowest demand.")
                
                low_stock = df.groupby(product_col)[quantity_col].sum().nsmallest(3)
                insights.append(f"Low stock products alert: {', '.join([str(x) for x in low_stock.index])}.")
            except Exception: pass
            
        if category_col and revenue_col:
            try:
                best_cat = df.groupby(category_col)[revenue_col].sum().idxmax()
                best_cat_rev = df.groupby(category_col)[revenue_col].sum().max()
                total_rev = df[revenue_col].sum()
                if total_rev > 0:
                    cat_pct = (best_cat_rev / total_rev) * 100
                    insights.append(f"'{best_cat}' category represents {cat_pct:.1f}% of revenue.")
            except Exception: pass
            
        if customer_col and revenue_col:
            try:
                top_cust = df.groupby(customer_col)[revenue_col].sum().idxmax()
                insights.append(f"Top customer / region: '{top_cust}'.")
            except Exception: pass
            
        if price_col and quantity_col:
            try:
                corr = df[price_col].corr(df[quantity_col])
                insights.append(f"Price vs quantity correlation is {corr:.2f} (negative implies higher price = lower sales).")
            except Exception: pass
            
        if date_col and revenue_col:
            try:
                df_dates = df.dropna(subset=[date_col]).copy()
                df_dates[date_col] = pd.to_datetime(df_dates[date_col], errors='coerce')
                df_dates = df_dates.dropna(subset=[date_col])
                
                if not df_dates.empty:
                    df_dates['month_period'] = df_dates[date_col].dt.to_period('M')
                    monthly_rev = df_dates.groupby('month_period')[revenue_col].sum()
                    
                    if len(monthly_rev) >= 2:
                        first_m, last_m = monthly_rev.iloc[-2], monthly_rev.iloc[-1]
                        if first_m > 0:
                            growth = ((last_m - first_m) / first_m) * 100
                            direction = "increased" if growth > 0 else "decreased"
                            insights.append(f"Sales {direction} {abs(growth):.0f}% compared to last month.")
                    
                    if len(monthly_rev) >= 3:
                        x = np.arange(len(monthly_rev))
                        y = monthly_rev.values
                        z = np.polyfit(x, y, 1)
                        pred_next = max(0, z[0] * (len(monthly_rev)) + z[1])
                        insights.append(f"Predicted revenue for next month: {pred_next:,.2f}.")
                        
                    if product_col and quantity_col:
                        last_month = df_dates['month_period'].max()
                        df_last_month = df_dates[df_dates['month_period'] == last_month]
                        if not df_last_month.empty:
                            best_prod_month = df_last_month.groupby(product_col)[quantity_col].sum().idxmax()
                            least_prod_month = df_last_month.groupby(product_col)[quantity_col].sum().idxmin()
                            metrics['best_seller'] = best_prod_month
                            metrics['least_seller'] = least_prod_month
                            insights.append(f"Product '{best_prod_month}' is the best selling product in {last_month.strftime('%B')}.")
                            insights.append(f"Product '{least_prod_month}' has the lowest sales this month.")
                            
                        monthly_prod_qty = df_dates.groupby(['month_period', product_col])[quantity_col].sum().unstack(fill_value=0)
                        if len(monthly_prod_qty) >= 3:
                            product_slopes = {}
                            x_prod = np.arange(len(monthly_prod_qty))
                            for prod in monthly_prod_qty.columns:
                                y_prod = monthly_prod_qty[prod].values
                                if sum(y_prod) > 0:
                                    z_prod = np.polyfit(x_prod, y_prod, 1)
                                    product_slopes[prod] = z_prod[0] * len(monthly_prod_qty) + z_prod[1]
                                    
                            if product_slopes:
                                future_best = max(product_slopes, key=product_slopes.get)
                                future_worst = min(product_slopes, key=product_slopes.get)
                                metrics['predicted_best'] = future_best
                                metrics['predicted_worst'] = future_worst
                                insights.append(f"Product '{future_best}' expected to be best seller next month.")
                                insights.append(f"Product '{future_worst}' may have low demand next month.")
            except Exception: pass
            
        summary["insights"] = insights
        summary["metrics"] = metrics
        return summary
    except Exception as e:
        return {"error": str(e)}

def run_kmeans_clustering(file_path, n_clusters=3):
    try:
        df = load_dataframe(file_path)
        numeric_df = df.apply(lambda x: pd.to_numeric(x, errors='coerce'))
        numeric_df = numeric_df.dropna(axis=1, how='all')
        if numeric_df.empty:
            return {"error": "Ensure dataset has numeric features."}
            
        numeric_df = numeric_df.fillna(numeric_df.mean())
            
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(numeric_df)
        
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(scaled_data)
        
        return {
            "status": "success",
            "n_clusters": n_clusters,
            "inertia": round(kmeans.inertia_, 2),
            "cluster_centers": kmeans.cluster_centers_.tolist()
        }
    except Exception as e:
        return {"error": str(e)}

def run_linear_regression(file_path, target_col):
    try:
        df = load_dataframe(file_path)
        numeric_df = df.apply(lambda x: pd.to_numeric(x, errors='coerce'))
        numeric_df = numeric_df.dropna(axis=1, how='all')
        if numeric_df.empty or target_col not in numeric_df.columns:
            return {"error": f"Column '{target_col}' must be numeric and dataset must contain features."}
            
        numeric_df = numeric_df.fillna(numeric_df.mean())
        X = numeric_df.drop(columns=[target_col])
        y = numeric_df[target_col]
        
        if X.empty:
            return {"error": "No numeric feature columns available to predict the target."}
            
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = LinearRegression()
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        
        r2 = r2_score(y_test, predictions)
        mse = mean_squared_error(y_test, predictions)
        
        return {
            "status": "success",
            "model": "Linear Regression",
            "target": target_col,
            "r2_score": round(r2, 4),
            "mse": round(mse, 2),
            "features_used": list(X.columns)
        }
    except Exception as e:
        return {"error": str(e)}

from sklearn.metrics import accuracy_score

def run_logistic_regression(file_path, target_col):
    try:
        df = load_dataframe(file_path)
        numeric_df = df.apply(lambda x: pd.to_numeric(x, errors='coerce'))
        numeric_df = numeric_df.dropna(axis=1, how='all')
        
        if target_col not in df.columns:
            return {"error": f"Column '{target_col}' not found."}
            
        numeric_df = numeric_df.fillna(numeric_df.mean())
        if target_col not in numeric_df.columns:
            numeric_df[target_col] = df[target_col]
             
        df_clean = numeric_df.dropna(subset=[target_col])
        X = df_clean.drop(columns=[target_col])
        y = df_clean[target_col].astype(str) # coerce to categorical classes
        
        if X.empty:
            return {"error": "No features available for classification."}
            
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        
        accuracy = accuracy_score(y_test, predictions)
        
        return {
            "status": "success",
            "model": "Classification (Logistic Regression)",
            "target": target_col,
            "accuracy": round(accuracy, 4),
            "features_used": list(X.columns)
        }
    except Exception as e:
        return {"error": str(e)}

def auto_clean_dataset(file_path):
    try:
        df = load_dataframe(file_path)
        if df.empty: 
            return {"error": "Dataset is already empty"}
        
        # 1. Remove duplicates
        df = df.drop_duplicates()
        
        # 2. Fill missing values
        numeric_cols = df.select_dtypes(include=['number']).columns
        category_cols = df.select_dtypes(exclude=['number']).columns
        
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].mean())
            
        for col in category_cols:
            if not df[col].mode().empty:
                df[col] = df[col].fillna(df[col].mode()[0])
            else:
                df[col] = df[col].fillna("Unknown")
                
        # 3. Detect and handle Outliers (Capping on 3 sigma)
        for col in numeric_cols:
            mean = df[col].mean()
            std = df[col].std()
            if pd.notna(mean) and pd.notna(std) and std > 0:
                upper = mean + 3 * std
                lower = mean - 3 * std
                df[col] = np.where(df[col] > upper, upper, df[col])
                df[col] = np.where(df[col] < lower, lower, df[col])
            
        # 4. Convert dates
        for col in category_cols:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    df[col] = pd.to_datetime(df[col], errors='ignore')
                except Exception:
                    pass
        
        if file_path.endswith('.csv'):
            df.to_csv(file_path, index=False)
        elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
            df.to_excel(file_path, index=False)
        elif file_path.endswith('.json'):
            df.to_json(file_path, orient='records')

        return generate_summary(file_path)
    except Exception as e:
        return {"error": str(e)}
