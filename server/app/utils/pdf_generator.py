from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.units import inch
import tempfile, os

def generate_checklist_pdf(vehicle, checklist):
    file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc = SimpleDocTemplate(file.name, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"<b>{vehicle.get('year', '')} {vehicle.get('make', '')} {vehicle.get('model', '')}</b>", styles["Title"]))
    story.append(Spacer(1, 0.25 * inch))

    story.append(Paragraph(f"<b>Fair Market Value:</b> ${checklist.get('fairMarketValue', 'N/A')}", styles["Normal"]))
    story.append(Paragraph(checklist.get("valuationReasoning", ""), styles["BodyText"]))
    story.append(Spacer(1, 0.2 * inch))

    def add_list(title, items):
        if items:
            story.append(Paragraph(f"<b>{title}</b>", styles["Heading3"]))
            story.append(ListFlowable([ListItem(Paragraph(i, styles["BodyText"])) for i in items],
                                      bulletType="bullet"))
            story.append(Spacer(1, 0.2 * inch))

    add_list("Negotiation Tips", checklist.get("negotiationTips"))
    add_list("Inspection Checklist", checklist.get("inspectionChecklist"))
    add_list("Dealer Warning Signs", checklist.get("dealerWarningSigns"))

    story.append(Paragraph(f"<b>Warranty Advice:</b>", styles["Heading3"]))
    story.append(Paragraph(checklist.get("warrantyAdvice", ""), styles["BodyText"]))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph(f"<b>Final Summary:</b>", styles["Heading3"]))
    story.append(Paragraph(checklist.get("finalSummary", ""), styles["BodyText"]))

    doc.build(story)
    return file.name
