import fitz
import json

doc = fitz.open("backend/app/uploads/template.pdf")
debug_data = {
    "pages": []
}

for page_num, page in enumerate(doc):
    page_info = {
        "page": page_num,
        "annots": [],
        "drawings_count": 0,
        "yellow_drawings": [],
        "text_sample": page.get_text()[:500]
    }
    
    # Check annots
    annots = page.annots()
    if annots:
        for annot in annots:
            page_info["annots"].append({
                "type": annot.type,
                "rect": list(annot.rect),
                "colors": annot.colors
            })
            
    # Check drawings
    drawings = page.get_drawings()
    page_info["drawings_count"] = len(drawings)
    for d in drawings:
        fill = d.get("fill")
        if fill:
            # Log all fills to see what we're missing
            if fill[0] > 0.5 and fill[1] > 0.5: # Roughly yellowish/reddish/greenish
                page_info["yellow_drawings"].append({
                    "fill": fill,
                    "items": len(d["items"]),
                    "rect": list(d["rect"]) if "rect" in d else "no-rect"
                })
                
    debug_data["pages"].append(page_info)

print(json.dumps(debug_data, indent=2))
