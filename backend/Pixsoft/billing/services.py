import stripe
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
from django.core.files.base import ContentFile

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment_intent(amount, currency='usd', metadata=None):
    """
    Crea un PaymentIntent en Stripe.
    amount: El monto en centavos (ej. $10.00 = 1000).
    """
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100), # Stripe espera centavos
            currency=currency,
            metadata=metadata or {},
            automatic_payment_methods={
                'enabled': True,
            },
        )
        return intent
    except Exception as e:
        print(f"Error creating payment intent: {e}")
        return None

def generate_invoice_pdf(invoice):
    """
    Genera un archivo PDF para la factura dada y lo guarda en el modelo.
    """
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Encabezado
    p.setFont("Helvetica-Bold", 20)
    p.drawString(50, height - 50, f"Factura #{invoice.invoice_number}")

    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Fecha: {invoice.issued_at.strftime('%Y-%m-%d %H:%M')}")
    p.drawString(50, height - 100, f"Cliente: {invoice.user.username}")
    p.drawString(50, height - 120, f"Email: {invoice.user.email}")

    # Detalles
    y = height - 160
    p.drawString(50, y, "Descripción")
    p.drawString(400, y, "Monto")
    y -= 20
    p.line(50, y, 500, y)
    y -= 20

    # Si es una orden
    if invoice.order:
        for item in invoice.order.items.all():
            p.drawString(50, y, f"{item.product.name} (x{item.quantity})")
            p.drawString(400, y, f"${item.total_price}")
            y -= 20
    
    # Si es un contrato de alquiler
    if invoice.rental_contract:
        p.drawString(50, y, f"Alquiler: {invoice.rental_contract.product.name}")
        p.drawString(400, y, f"${invoice.rental_contract.total_cost}")
        y -= 20

    # Total
    y -= 20
    p.line(50, y, 500, y)
    y -= 30
    p.setFont("Helvetica-Bold", 14)
    p.drawString(300, y, f"Total: ${invoice.amount}")

    # Estado
    y -= 40
    p.setFont("Helvetica-Oblique", 12)
    if invoice.status == 'PAID':
        p.setFillColorRGB(0, 0.6, 0) # Verde
        p.drawString(50, y, "ESTADO: PAGADO")
    else:
        p.setFillColorRGB(0.8, 0, 0) # Rojo
        p.drawString(50, y, f"ESTADO: {invoice.get_status_display().upper()}")

    p.showPage()
    p.save()

    pdf_content = buffer.getvalue()
    buffer.close()

    # Guardar en el campo FileField
    filename = f"invoice_{invoice.invoice_number}.pdf"
    invoice.pdf_file.save(filename, ContentFile(pdf_content), save=True)
    
    return invoice.pdf_file.url
