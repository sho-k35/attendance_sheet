import pandas as pd
from datetime import datetime

# 1. import data
df_students = pd.read_csv('data/students.csv', dtype=str)
df_records = pd.read_csv('data/records.csv', dtype=str)

print(df_students)

# 2. Join the data and export
df_merged = pd.merge(df_records, df_students, on='student_id', how='left')
target_class_records = df_merged[(df_merged['grade']=='2') & (df_merged['class_name'] == 'A')]

print(target_class_records[['date', 'name', 'category', 'value']])

# 3. add records
today_str = datetime.today().strftime('%Y-%m-%d')
# generate new record_id
new_id = str(int(df_records['record_id'].max()) + 1) if not df_records.empty else "1"

new_record = pd.DataFrame([{
    'record_id': new_id,
    'date': today_str,
    'student_id': '001',
    'category': '出席',
    'value': '出席'
}])
# add new line by using concat
df_records = pd.concat([df_records, new_record], ignore_index=True)

print(df_records.tail())

# 4. write into csv
df_records.to_csv('data/records.csv', index=False)
