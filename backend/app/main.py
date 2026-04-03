from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers.documents import router as document_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document_router, prefix="/documents", tags=["documents"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Qualiopi Document Generation API"}