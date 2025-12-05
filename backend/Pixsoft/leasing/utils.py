from decimal import Decimal
from datetime import date

def calculate_rental_cost(plan, start_date: date, end_date: date):
    """
    Calcula el costo total de un arrendamiento basado en el plan y las fechas.
    Retorna (total_cost, duration_days, duration_units)
    """
    duration_days = (end_date - start_date).days
    
    if duration_days <= 0:
        return Decimal('0.00'), 0, 0
    
    # Calcular cantidad de periodos
    period_multiplier = {
        'DAILY': 1,
        'WEEKLY': 7,
        'MONTHLY': 30,  # Simplificado
        'ANNUAL': 365   # Simplificado
    }
    
    multiplier = period_multiplier.get(plan.period, 30)
    duration_units = max(1, duration_days // multiplier)
    
    # Si la división no es exacta, ¿cobramos fracción o periodo completo?
    # Por simplicidad ahora: si pasa de 1 periodo, cobramos el siguiente entero? 
    # O usamos prorrateo? El código original usaba división entera. Mantengamos eso por ahora pero asegurando mínimo 1.
    if duration_days % multiplier > 0:
       # Opcional: cobrar proporcional o dia extra. 
       # Por ahora mantengamos la logica de la vista: duration_days // multiplier
       pass

    # Recalculamos unidades basado en logica original de vista
    # duration_units = max(1, duration_days // period_multiplier.get(period, 30))
    
    base_cost = plan.base_price * Decimal(duration_units)
    maintenance_cost = plan.maintenance_price * Decimal(duration_units)
    total_cost = base_cost + maintenance_cost
    
    return total_cost, duration_days, duration_units
