call .venv\Scripts\activate

cd backend

uvicorn uvicorn app.main:app --reload