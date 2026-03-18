from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(Integer)
    updated_at = Column(Integer)

    # Define relationships if needed
    # user_id = Column(Integer, ForeignKey('users.id'))
    # user = relationship("User", back_populates="documents")