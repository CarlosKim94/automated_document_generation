from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.schemas.document import DocumentCreate
from app.services.pdf_service import pdf_service
import os

router = APIRouter()

@router.post("/generate")
async def create_document(document: DocumentCreate):
    try:
        # Accessing Pydantic fields
        client_data = document.client_data
        template_name = document.template_name or "template.md"
        
        # Pass to service
        path = pdf_service.generate_pdf(client_data, template_name=template_name)
        
        if not os.path.exists(path):
            raise HTTPException(status_code=500, detail="File not created")

        # Dynamic naming
        prefix = "Deroule" if "roadmap" in template_name else "Convention"
        safe_name = client_data.get('CLIENT_NAME', 'Client').replace(" ", "_")
        
        return FileResponse(
            path, 
            media_type='application/pdf', 
            filename=f"{prefix}_{safe_name}.pdf"
        )
    except Exception as e:
        print(f"Error: {e}") # Check your terminal for this!
        raise HTTPException(status_code=500, detail=str(e))