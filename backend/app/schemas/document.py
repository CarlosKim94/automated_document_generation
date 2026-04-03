from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict

class DocumentBase(BaseModel):
    client_name: str
    trainee_name: Optional[str] = None
    fee: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class DocumentCreate(BaseModel):
    # This matches the JSON body from your frontend's generatePack()
    client_data: Dict[str, Any]
    # Ensure these match what you send in the 'body' of your React fetch
    template_name: Optional[str] = "template.md" 
    coordinate_map: Optional[Dict[str, Any]] = None

class DocumentResponse(DocumentBase):
    id: int
    # In Pydantic V2, we use this instead of "class Config"
    model_config = ConfigDict(from_attributes=True)

class DocumentUpdate(BaseModel):
    client_name: Optional[str] = None
    trainee_name: Optional[str] = None
    fee: Optional[float] = None