import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {
  transform(minutes: number): string {
    if (!minutes || minutes <= 0) return '';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    let result = '';
    
    if (hours > 0) {
      result += `${hours} שעות`;
    }
    
    if (remainingMinutes > 0) {
      if (hours > 0) result += ' ו-';
      result += `${remainingMinutes} דקות`;
    }
    
    return result;
  }
}