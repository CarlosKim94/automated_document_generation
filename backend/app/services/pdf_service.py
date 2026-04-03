import os
import re
import time
import logging
import markdown
from pathlib import Path
from typing import Dict, Any
from bs4 import BeautifulSoup
from jinja2 import Template

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, ListFlowable, ListItem
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent  # Points to 'backend/app/'
GENERATED_DIR = BASE_DIR / "generated"
UPLOAD_DIR = BASE_DIR / "uploads"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

class PDFService:
    def __init__(self):
        self.template_path = UPLOAD_DIR / "template.md"
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        # Main Title
        self.styles.add(ParagraphStyle(
            name='MD_H1', parent=self.styles['Heading1'],
            fontSize=22, spaceAfter=1, alignment=1, fontName='Helvetica-Bold', leading=24
        ))
        # Subtitle
        self.styles.add(ParagraphStyle(
            name='MD_H2', parent=self.styles['Heading2'],
            fontSize=10, spaceAfter=1, alignment=1, fontName='Helvetica-Bold', leading=11
        ))
        # Legal Mention
        self.styles.add(ParagraphStyle(
            name='MD_H3_Legal', parent=self.styles['Normal'],
            fontSize=8, spaceAfter=4, alignment=1, fontName='Helvetica-Bold', leading=9
        ))
        # Article Header
        self.styles.add(ParagraphStyle(
            name='ArticleHeader', parent=self.styles['Normal'],
            fontSize=11, spaceBefore=10, spaceAfter=6, fontName='Helvetica-Bold', leading=13
        ))
        # Body Text
        self.styles.add(ParagraphStyle(
            name='MD_Body', parent=self.styles['Normal'],
            fontSize=10, leading=12, fontName='Helvetica'
        ))
        # Signature Style (Tighter leading)
        self.styles.add(ParagraphStyle(
            name='SigStyle', parent=self.styles['Normal'],
            fontSize=10, leading=11, fontName='Helvetica'
        ))

    def save_template(self, file_content: bytes):
        return {"message": "Markdown template mode active"}

    def extract_highlights(self) -> Dict[str, Any]:
        return {"count": 0, "placeholders": []}

    def _header_footer(self, canvas, doc):
        canvas.saveState()
        line1 = "DIGITBSPARTNER | 780 chemin du bois sauvaire 13400 Aubagne Siret: 88119011000026"
        line2 = "Tel:0650147383 | Email: digitbspartner@gmail.com"
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(colors.grey)
        canvas.drawCentredString(A4[0]/2, 1.5*cm, f"{doc.page}")
        # Generate "Février 2026" dynamically
        import datetime
        # Mapping for French months
        months_fr = {
            1: "Janvier", 2: "Février", 3: "Mars", 4: "Avril", 
            5: "Mai", 6: "Juin", 7: "Juillet", 8: "Août", 
            9: "Septembre", 10: "Octobre", 11: "Novembre", 12: "Décembre"
        }
        now = datetime.datetime.now()
        month_str = months_fr.get(now.month, "Janvier")
        dynamic_date = f"Document actualisé le {month_str} {now.year}"
        
        # Draw on the right side (A4[0] is the total width, minus 1.5cm margin)
        canvas.drawRightString(A4[0] - 1.5*cm, 1.5*cm, dynamic_date)
        canvas.drawCentredString(A4[0]/2, 1.0*cm, line1)
        canvas.drawCentredString(A4[0]/2, 0.6*cm, line2)
        canvas.restoreState()

    def _html_to_reportlab(self, html_str):
        """Converts standard HTML tags to ReportLab Paragraph markup"""
        s = str(html_str)
        s = s.replace('<strong>', '<b>').replace('</strong>', '</b>')
        s = s.replace('<em>', '<i>').replace('</em>', '</i>')
        s = s.replace('<p>', '').replace('</p>', '')
        # Remove any remaining nested tags that ReportLab doesn't support
        s = re.sub(r'<(?!/?(b|i|u|br|font))[^>]*>', '', s)
        return s.strip()

    def _process_ul(self, ul_element, story, level=1):
        """Fixed recursive processor using dynamic ParagraphStyles"""
        bullets = {1: '&bull;', 2: 'o', 3: '-'}
        bullet_char = bullets.get(level, '•')
        
        # 1. Create a dynamic style for this specific indentation level
        # This copies 'MD_Body' and adds the requested indentation
        level_style = ParagraphStyle(
            name=f'Level{level}Style',
            parent=self.styles['MD_Body'],
            leftIndent=level * 20,    # Indent based on level
            firstLineIndent=-10,      # "Hang" the bullet to the left
            spaceBefore=1,
            spaceAfter=1
        )
        
        items = ul_element.find_all('li', recursive=False)
        
        for li in items:
            # Flatten <p> tags inside <li> to avoid empty bullets
            for p in li.find_all('p'):
                p.unwrap()

            temp_li = BeautifulSoup(str(li), 'html.parser').li
            nested_list = temp_li.find(['ul', 'ol'])
            if nested_list:
                nested_list.decompose()
            
            clean_text = self._html_to_reportlab(temp_li.decode_contents())

            if not clean_text.strip():
                clean_text = li.get_text(strip=True)
                if "•" in clean_text or "○" in clean_text:
                    clean_text = clean_text.split('•')[0].split('○')[0].strip()

            # 2. Use the 'level_style' instead of passing leftIndent as an argument
            story.append(Paragraph(
                f"{bullet_char} &nbsp; {clean_text}", 
                level_style
            ))
            
            nested = li.find(['ul', 'ol'], recursive=False)
            if nested:
                self._process_ul(nested, story, level + 1)

    def generate_pdf(self, data: Dict[str, Any], template_name: str = "template.md"):
        # 1. Use the requested template_name
        target_path = UPLOAD_DIR / template_name

        if not target_path.exists():
            raise FileNotFoundError(f"Markdown template '{template_name}' not found in {UPLOAD_DIR}")

        # 1. Prepare Data
        context = {k.upper(): v for k, v in data.items()}
        
        # Force DD/MM/YYYY
        raw_date = data.get('signature_date')
        if raw_date and '-' in str(raw_date):
            parts = str(raw_date).split('-')
            if len(parts) == 3:
                context['DATE_OF_SIGNATURE'] = f"{parts[2]}/{parts[1]}/{parts[0]}"
        elif not raw_date:
            context['DATE_OF_SIGNATURE'] = "13/02/2026"

        # Calculate Finances
        try:
            # Get values from data (sent from frontend)
            fee_val = float(data.get('fee') or 0)
            dep_val = float(data.get('deposit') or 0)
            
            # Map these to the EXACT keys in your template.md
            context['UNIT_COST_HT'] = f"{fee_val:.2f}"
            context['TOTAL_HT'] = f"{fee_val:.2f}"
            context['TOTAL_TTC'] = f"{fee_val:.2f}"
            context['TOTAL_GENERAL'] = f"{fee_val:.2f}"
            context['DEPOSIT_AMOUNT'] = f"{dep_val:.2f}"
            context['BALANCE_DUE'] = f"{fee_val - dep_val:.2f}"
            
            logger.info(f"Financials Calculated: Fee={fee_val}, Deposit={dep_val}")
        except Exception as e:
            logger.error(f"Financial calculation error: {e}")
            # Fallbacks to prevent blank PDFs
            for k in ['UNIT_COST_HT', 'TOTAL_HT', 'TOTAL_TTC', 'TOTAL_GENERAL', 'DEPOSIT_AMOUNT', 'BALANCE_DUE']:
                context.setdefault(k, "0.00")

        # 2. Render Markdown
        target_path = UPLOAD_DIR / template_name
        with open(target_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        template = Template(md_content)
        rendered_md = template.render(context)

        # 3. Convert MD to HTML (Sane lists is key)
        html_content = markdown.markdown(rendered_md, extensions=['extra', 'sane_lists'])

        # 4. Build Story
        timestamp = int(time.time())
        output_path = GENERATED_DIR / f"qualiopi_vfinal_{timestamp}.pdf"
        
        doc = SimpleDocTemplate(
            str(output_path), pagesize=A4, 
            rightMargin=1.5*cm, leftMargin=1.5*cm,
            topMargin=1.5*cm, bottomMargin=2.5*cm
        )
        story = []
        soup = BeautifulSoup(html_content, 'html.parser')
        
        for element in soup.contents:
            if not element.name: continue
            
            if element.name == 'h1':
                story.append(Paragraph(self._html_to_reportlab(element.decode_contents()), self.styles['MD_H1']))
            elif element.name == 'h2':
                story.append(Paragraph(self._html_to_reportlab(element.decode_contents()), self.styles['MD_H2']))
            elif element.name == 'h3':
                text = element.get_text()
                if "Actions avec un financement" in text:
                    story.append(Paragraph(f"<b>{text}</b>", self.styles['MD_H3_Legal']))
                elif "Entre les soussign" in text:
                    story.append(Paragraph(text, self.styles['ArticleHeader']))
                else:
                    story.append(Paragraph(f"<u><b>{text}</b></u>", self.styles['ArticleHeader']))
            elif element.name == 'p':
                text = self._html_to_reportlab(element.decode_contents())
                
                if "SIGNATURE_AREA" in text:
                    trainee_name = data.get('CLIENT_TRAINEE_NAME')
                    sig_data = [[
                        Paragraph(f"Pour l'entreprise<br/><b>{trainee_name}</b>", self.styles['SigStyle']),
                        Paragraph(f"Pour l'organisme<br/><b>Cynthia Bailly, Gérante</b>", self.styles['SigStyle'])
                    ]]
                    t = Table(sig_data, colWidths=[doc.width/2.0]*2)
                    t.setStyle(TableStyle([
                        ('ALIGN', (0,0), (-1,-1), 'LEFT'), ('VALIGN', (0,0), (-1,-1), 'TOP'),
                        ('LEFTPADDING', (0,0), (-1,-1), 0), ('TOPPADDING', (0,0), (-1,-1), 0),
                    ]))
                    story.append(t)
                    continue

                if "Fait en double exemplaire" in text:
                    text = f"<b>{text}</b>"
                
                story.append(Paragraph(text, self.styles['MD_Body']))
            elif element.name == 'hr':
                story.append(Spacer(1, 0.1*cm))
            elif element.name == 'ul':
                self._process_ul(element, story)

            elif element.name == 'table':
                table_data = []
                rows = element.find_all('tr')
                for row in rows:
                    cols = row.find_all(['td', 'th'])
                    # Convert cell content to Paragraphs so text wraps correctly
                    row_content = [
                        Paragraph(self._html_to_reportlab(c.decode_contents()), self.styles['MD_Body']) 
                        for c in cols
                    ]
                    table_data.append(row_content)
                
                if table_data:
                    # Adjust colWidths to fit an A4 page (roughly 18cm total)
                    t = Table(table_data, hAlign='LEFT', colWidths=[2*cm, 4*cm, 3*cm, 3*cm, 3*cm, 3*cm])
                    t.setStyle(TableStyle([
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke), # Header row background
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('TOPPADDING', (0,0), (-1,-1), 3),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                    ]))
                    story.append(t)
                    story.append(Spacer(1, 0.1*cm))

        doc.build(story, onFirstPage=self._header_footer, onLaterPages=self._header_footer)
        logger.info(f"Generated FINAL PDF at {output_path}")
        return str(output_path)

pdf_service = PDFService()
