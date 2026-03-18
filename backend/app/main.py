from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import documents

app = FastAPI(title="Automated Document Generation")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/documents", tags=["documents"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Qualiopi Document Generation API"}

@app.get("/health")
def health():
    return {"status": "ok"}
