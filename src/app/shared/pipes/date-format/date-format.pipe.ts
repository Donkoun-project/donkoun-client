import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const iso = value.toString().split('T')[0]; // "2024-04-15"
    const [year, month, day] = iso.split('-');
    return `${day} ${this.getMonth(month)} ${year}`;
  }

  private getMonth(month: string): string {
    const months: { [key: string]: string } = {
      '01': 'Jan', '02': 'Fév', '03': 'Mars',
      '04': 'Avr', '05': 'Mai', '06': 'Juin',
      '07': 'Juil', '08': 'Août', '09': 'Sep',
      '10': 'Oct', '11': 'Nov', '12': 'Déc'
    };
    return months[month] ?? '—';
  }
}
