import os
import fitz  # PyMuPDF
from typing import Dict, Any, List
from pathlib import Path
import logging
import time
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("app/uploads")
GENERATED_DIR = Path("app/generated")

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

class PDFService:
    def __init__(self):
        self.template_path = UPLOAD_DIR / "template.pdf"

    def save_template(self, file_content: bytes):
        with open(self.template_path, "wb") as f:
            f.write(file_content)
        logger.info(f"Template saved to {self.template_path}")
        return {"message": "Template uploaded successfully"}

    def extract_highlights(self) -> Dict[str, Any]:
        if not self.template_path.exists():
            return {"count": 0, "placeholders": []}

        doc = fitz.open(self.template_path)
        placeholders = []
        
        for page_num, page in enumerate(doc):
            # 1. Standard Annotations
            for annot in page.annots():
                if annot.type[0] in [8, 9, 10, 11]:
                    rect = annot.rect
                    text = page.get_textbox(rect).strip()
                    placeholders.append({
                        "id": f"ph_{len(placeholders)}",
                        "placeholder_name": text if text else f"field_{len(placeholders)}",
                        "rect": [rect.x0, rect.y0, rect.x1, rect.y1],
                        "page": page_num,
                        "type": "annotation"
                    })

            # 2. Vector Drawings (The yellow boxes)
            for draw in page.get_drawings():
                fill_color = draw.get("fill")
                if fill_color:
                    r, g, b = fill_color
                    # Broad yellow detection
                    if r > 0.8 and g > 0.8 and b < 0.6:
                        rect = draw["rect"]
                        if rect.width < 3 or rect.height < 3 or rect.width > 550:
                            continue
                            
                        text = page.get_textbox(rect).strip()
                        placeholder = {
                            "id": f"ph_{len(placeholders)}",
                            "placeholder_name": text if text else f"field_{len(placeholders)}",
                            "rect": [rect.x0, rect.y0, rect.x1, rect.y1],
                            "page": page_num,
                            "type": "vector"
                        }
                        if not any(abs(p["rect"][0] - rect.x0) < 3 and abs(p["rect"][1] - rect.y0) < 3 and p["page"] == page_num for p in placeholders):
                            placeholders.append(placeholder)
        
        doc.close()
        logger.info(f"Detected {len(placeholders)} placeholders")
        return {"count": len(placeholders), "placeholders": placeholders}

    def generate_pdf(self, client_data: Dict[str, Any], coordinate_map: Dict[str, Any] = None) -> str:
        if not self.template_path.exists():
            raise FileNotFoundError("Template PDF not found.")

        doc = fitz.open(self.template_path)
        extraction = self.extract_highlights()
        placeholders = extraction["placeholders"]

        for page_num in range(len(doc)):
            page = doc[page_num]
            page_placeholders = [p for p in placeholders if p["page"] == page_num]
            
            if not page_placeholders:
                continue

            # Pass 1: Redaction (Cleaning)
            for ph in page_placeholders:
                rect = fitz.Rect(ph["rect"])
                page.add_redact_annot(rect, fill=(1, 1, 1))
            
            page.apply_redactions()

            # Pass 2: Injection (Writing)
            for ph in page_placeholders:
                rect = fitz.Rect(ph["rect"])
                field_name = ph.get("placeholder_name", "")
                
                value = self._get_mapped_value(field_name, page_num, client_data)
                
                if value and str(value).strip():
                    # Align text slightly better in the box
                    # We use a slightly smaller font to ensure it fits the redacted area
                    page.insert_textbox(
                        rect, 
                        str(value), 
                        fontsize=9, 
                        align=0, 
                        fontname="helv", 
                        color=(0, 0, 0)
                    )
                    logger.info(f"P{page_num}: Replaced '{field_name[:20]}...' with '{value}'")

        timestamp = int(time.time())
        output_path = GENERATED_DIR / f"qualiopi_{timestamp}.pdf"
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        
        return str(output_path)

    def _get_mapped_value(self, raw_name: str, page_num: int, client_data: Dict[str, Any]) -> str:
        """Resilient mapping that ignores hidden characters and whitespace"""
        # Clean the string of hidden chars like \u200b and excessive whitespace
        name = re.sub(r'[^\x20-\x7E]', '', str(raw_name)).lower().strip()
        
        # --- PAGE 0: HEADER & CLIENT INFO ---
        if page_num == 0:
            # Client Name: Matches ") Julie Pit" or "Julie Pit"
            if "julie pit" in name:
                return client_data.get("client_name", "")
            # Address: Matches "255 avenue..."
            if any(k in name for k in ["avenue", "83270", "madrague", "siege"]):
                return client_data.get("client_address", "")
            # Siret: Matches "981529753..."
            if "981529753" in name or "siret" in name:
                return client_data.get("client_siret", "")
            # Representative: Matches "r Julie Pit"
            if "r julie pit" in name or "representee" in name:
                return client_data.get("client_representative", "")
            # Title: Matches "Instagram Impact..."
            if any(k in name for k in ["instagram", "impact", "intitule"]):
                return client_data.get("training_title", "")

        # --- PAGE 1: TRAINING DETAILS & FINANCES ---
        if page_num == 1:
            # Duration
            if "21 heures" in name or "duree" in name:
                return client_data.get("training_duration", "")
            # Location
            if any(k in name for k in ["6 avenue", "aubagne", "caniers", "lieu"]):
                return client_data.get("training_location", "")
            # Dates/Hours
            if any(k in name for k in ["9h00", "17h00", "horaires", "dates"]):
                return client_data.get("training_dates_hours", "")
            # Trainee Name in list
            if "julie pit" in name and "fonction" in name:
                return f"{client_data.get('trainee_name', '')}, Fonction : Entrepreneur individuel"
            
            # Financial Block Rebuilding
            if "frais de formation" in name or "900 euros" in name:
                fee = client_data.get("fee", "0")
                return f"Frais de formation : coût unitaire H.T {fee} euros 1 stagiaire(s) = {fee} € HT."
            if "total de :" in name:
                return f"Soit un total de : {client_data.get('fee', '0')} € T.T.C"
            if "sommes versees" in name or "restant dues" in name:
                try:
                    fee = float(client_data.get("fee") or 0)
                    deposit = float(client_data.get("deposit") or 0)
                    balance = fee - deposit
                    return f"Sommes versées par l’entreprise à titre d’acomptes : {deposit} € HT\nSommes restant dues :{balance:.2f} € H.T"
                except: return raw_name
            if "total general" in name:
                return f"TOTAL GENERAL : {client_data.get('fee', '0')} € T.T.C"
            
            # Signature Date (Bottom of page 1/2)
            if "13/02/2026" in name or name.startswith("e "):
                return f"le {client_data.get('signature_date', '')}"

        # --- PAGE 2: SIGNATURES ---
        if page_num == 2:
            # Signature Client Name
            if "pour l" in name or "julie pit" in name:
                return client_data.get("client_name", "")

        # --- UNIVERSAL FALLBACKS ---
        if "siret" in name: return client_data.get("client_siret", "")
        if "adresse" in name or "siege" in name: return client_data.get("client_address", "")
        if "representee" in name: return client_data.get("client_representative", "")
        if "stagiaire" in name: return client_data.get("trainee_name", "")

        return ""

pdf_service = PDFService()
