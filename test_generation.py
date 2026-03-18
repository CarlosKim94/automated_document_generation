import fitz
import os
from pathlib import Path

# Setup
template_path = Path("backend/app/uploads/template.pdf")
output_path = Path("test_output.pdf")
client_data = {
    "client_name": "ACME TEST CORP",
    "trainee_name": "JOHN DOE TEST",
    "start_date": "2026-01-01",
    "end_date": "2026-01-03",
    "fee": "1234.56"
}

doc = fitz.open(template_path)
placeholders = []

# 1. Extract (same logic as service)
for page_num, page in enumerate(doc):
    for draw in page.get_drawings():
        fill_color = draw.get("fill")
        if fill_color:
            r, g, b = fill_color
            if r > 0.8 and g > 0.8 and b < 0.5:
                rect = draw["rect"]
                if rect.width < 5 or rect.height < 5 or rect.width > 500:
                    continue
                text = page.get_textbox(rect).strip()
                placeholders.append({"placeholder_name": text, "rect": list(rect), "page": page_num})

# 2. Fill (same logic as service)
for ph in placeholders:
    page = doc[ph["page"]]
    rect = fitz.Rect(ph["rect"])
    field_name = ph["placeholder_name"].lower()
    
    value = ""
    if any(k in field_name for k in ["entreprise", "client", "company"]):
        value = client_data["client_name"]
    elif any(k in field_name for k in ["stagiaire", "trainee", "nom", "julie", "pit"]):
        value = client_data["trainee_name"]
    elif any(k in field_name for k in ["début", "start"]):
        value = client_data["start_date"]
    elif any(k in field_name for k in ["fin", "end"]):
        value = client_data["end_date"]
    elif any(k in field_name for k in ["frais", "fee", "prix", "€", "total", "coût"]):
        value = f"{client_data['fee']} €"

    if value:
        # Cover
        page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
        # Insert
        page.insert_textbox(rect, str(value), fontsize=10, align=1, fontname="helv")

doc.save(output_path)
doc.close()
print(f"Test PDF saved to {output_path} with {len(placeholders)} modifications attempted.")
