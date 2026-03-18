import fitz
import os
from pathlib import Path

template_path = Path("backend/app/uploads/template.pdf")
doc = fitz.open(template_path)
placeholders = []

for page_num, page in enumerate(doc):
    # 1. Annots
    for annot in page.annots():
        if annot.type[0] in [8, 9, 10, 11]:
            rect = annot.rect
            text = page.get_textbox(rect).strip()
            placeholders.append({"name": text, "type": "annot", "page": page_num})

    # 2. Drawings
    for draw in page.get_drawings():
        fill_color = draw.get("fill")
        if fill_color:
            r, g, b = fill_color
            if r > 0.8 and g > 0.8 and b < 0.5:
                rect = draw["rect"]
                if rect.width < 5 or rect.height < 5 or rect.width > 500:
                    continue
                text = page.get_textbox(rect).strip()
                placeholders.append({"name": text, "type": "vector", "page": page_num, "color": fill_color})

print(f"Detected {len(placeholders)} placeholders")
for p in placeholders:
    print(p)
