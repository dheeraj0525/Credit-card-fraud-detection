import os
import pandas as pd

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "ml", "data", "creditcard.csv")
TEST_DATA_DIR = os.path.join(BASE_DIR, "tests", "data")
OUTPUT_PATH = os.path.join(TEST_DATA_DIR, "test_sample.csv")

os.makedirs(TEST_DATA_DIR, exist_ok=True)

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Credit card dataset not found at: {DATA_PATH}")

# Read first 35 rows to ensure we have enough data (at least 30 rows)
df = pd.read_csv(DATA_PATH, nrows=35)

# Drop "Class" target column if present, since schema expects only feature columns
if "Class" in df.columns:
    df = df.drop("Class", axis=1)

# Ensure correct column order: Time, V1-V28, Amount
FEATURE_COLUMNS = [
    "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7",
    "V8", "V9", "V10", "V11", "V12", "V13", "V14",
    "V15", "V16", "V17", "V18", "V19", "V20", "V21",
    "V22", "V23", "V24", "V25", "V26", "V27", "V28",
    "Amount"
]
df = df[FEATURE_COLUMNS]

# Save to output location
df.to_csv(OUTPUT_PATH, index=False)
print(f"Generated valid test sample CSV at {OUTPUT_PATH}")
print(f"Number of rows: {len(df)}")
print(f"Columns: {list(df.columns)}")
