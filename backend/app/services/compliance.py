from typing import List, Dict

def check_compliance(document: Dict[str, str], checklist: List[str]) -> Dict[str, bool]:
    compliance_results = {}
    for item in checklist:
        compliance_results[item] = item in document.get('compliance_items', [])
    return compliance_results

def generate_compliance_report(document: Dict[str, str], checklist: List[str]) -> str:
    compliance_results = check_compliance(document, checklist)
    report_lines = ["Compliance Report:"]
    for item, is_compliant in compliance_results.items():
        status = "Compliant" if is_compliant else "Non-Compliant"
        report_lines.append(f"{item}: {status}")
    return "\n".join(report_lines)