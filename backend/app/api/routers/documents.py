from fastapi import APIRouter, HTTPException, UploadFile, File, Response
from typing import List, Dict, Any
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentResponse, HighlightResponse, GenerateRequest
from app.services.compliance import check_compliance
from app.services.pdf_service import pdf_service
from fastapi.responses import FileResponse
import os
import time

router = APIRouter()

@router.get("/", response_model=List[DocumentResponse])
async def get_documents():
    # Logic to retrieve all documents
    documents = []  # Replace with actual retrieval logic
    return documents

@router.delete("/{document_id}", response_model=dict)
async def delete_document(document_id: int):
    try:
        # Logic to delete the document by ID
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/upload-template")
async def upload_template(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    content = await file.read()
    pdf_service.save_template(content)
    return {"message": "Template uploaded successfully"}

@router.post("/extract-highlights", response_model=HighlightResponse)
async def extract_highlights():
    try:
        result = pdf_service.extract_highlights()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate(request: GenerateRequest):
    try:
        output_path = pdf_service.generate_pdf(request.client_data, request.coordinate_map)
        
        # Use a timestamped filename to force browser to treat it as a new file
        download_name = f"qualiopi_{int(time.time())}.pdf"
        
        return FileResponse(
            path=output_path,
            filename=download_name,
            media_type="application/pdf"
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
