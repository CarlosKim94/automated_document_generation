from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DocumentBase(BaseModel):
    title: str
    content: str
    author: str

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    title: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int

    class Config:
        from_attributes = True

class DocumentList(BaseModel):
    documents: List[DocumentResponse]

class Placeholder(BaseModel):
    id: str
    placeholder_name: Optional[str] = None
    rect: Optional[List[float]] = None
    page: Optional[int] = None

class HighlightResponse(BaseModel):
    count: int
    placeholders: List[Placeholder]

class GenerateRequest(BaseModel):
    client_data: Dict[str, Any]
    coordinate_map: Optional[Dict[str, Any]] = None
