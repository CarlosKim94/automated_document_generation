#!/usr/bin/env bash
set -e
BASE_DIR="/Users/carloskim/Developer/freelance/automated_document_generation"
mkdir -p "$BASE_DIR"
mkdir -p "$BASE_DIR/backend/app"/{api/routers,core,models,schemas,services,templates,static,uploads,generated}
mkdir -p "$BASE_DIR/backend/tests"
mkdir -p "$BASE_DIR/frontend/web/src"/{pages,components,services}
mkdir -p "$BASE_DIR/frontend/web/public"
mkdir -p "$BASE_DIR/scripts" "$BASE_DIR/docs"
# create minimal files (trimmed for brevity)
cat > "$BASE_DIR/backend/app/main.py" <<'PY'
from fastapi import FastAPI
app = FastAPI(title="Automated Document Generation")
@app.get("/health")
def health(): return {"status": "ok"}
PY
echo "Scaffold created at $BASE_DIR"
