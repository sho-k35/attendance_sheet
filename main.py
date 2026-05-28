from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import pandas as pd
from datetime import datetime
import os

# FastAPIアプリの立ち上げ
app = FastAPI(title="塾管理システムAPI")

# CORS の設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. データ検証用のモデル
# 型を定義
class RecordCreate(BaseModel):
    student_id: str
    category: str
    value: str

#2. 生徒一覧取得API (GET method)
@app.get("/students")
def get_target_students(grade: Optional[str] = None, class_name: Optional[str] = None, school: Optional[str] = None):
    try:
        df_students = pd.read_csv('data/students.csv', dtype=str)
        # 指定された学年、クラス、学校の生徒を抽出
        if grade:
            df_students = df_students[df_students['grade'] == grade]
        if class_name:
            df_students = df_students[df_students['class_name'] == class_name]
        if school:
            df_students = df_students[df_students['school'] == school]

        return df_students.to_dict(orient='records')
    except FileNotFoundError:
        raise HTTPException(status_code=500, detai="File Not Found.")
    
@app.post("/records")
def add_record(record: RecordCreate):
    try:
        today_str = datetime.today().strftime('%Y-%m-%d')

        if os.path.exists('data/records.csv'):
            df_records = pd.read_csv('data/records.csv', dtype=str)
            new_id = str(int(df_records['record_id'].max()) + 1) if not df_records.empty else "1"
        
        else:
            df_records = pd.DataFrame(columns=['record_id', 'date', 'student_id', 'category', 'value'])
            new_id = 1
        
        # ブラウザから送られてきたデータ（record）を使って新しい行を作成
        new_row = pd.DataFrame([{
            'record_id': new_id,
            'date': today_str,
            'student_id': record.student_id,
            'category': record.category,
            'value': record.value
        }])

        # 結合して保存
        df_records = pd.concat([df_records, new_row], ignore_index=True)
        df_records.to_csv('data/records.csv', index=False)

        return {"message": "記録を保存しました", "added_data": record.model_dump()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save.: {str(e)}")

app.mount("/",StaticFiles(directory="static", html=True), name="static")