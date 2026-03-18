from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..models.document import Document
from ..schemas.document import DocumentCreate

def get_document(db: Session, document_id: int):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document

def create_document(db: Session, document: DocumentCreate):
    db_document = Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document