// src/utils/formatters.ts
export class Formatters {
  /**
   * Formatear número a moneda chilena
   * 3000000 -> "$3.000.000"
   */
  static formatCLP(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Remover formato de string a número
   * "$3.000.000" -> "3000000"
   */
  static unformatCLP(value: string): string {
    return value.replace(/[^0-9]/g, '');
  }

  /**
   * Formatear input mientras se escribe
   * "3000000" -> "3.000.000"
   */
  static formatCLPInput(value: string): string {

    const cleaned = this.unformatCLP(value);
if (!cleaned) return '';

    const num = parseInt(cleaned, 10);
    return num.toLocaleString('es-CL');
  }

  /**
   * Formatear fecha a formato chileno
   * Date -> "08-10-2025"
   */
  static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Calcular duración en meses entre dos fechas
   */
  static getDurationInMonths(startDate: Date, endDate: Date): number {
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return Math.max(0, months);
  }
}
