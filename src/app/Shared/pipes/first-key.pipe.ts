import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstKey',
  standalone: true
})
export class FirstKeyPipe implements PipeTransform {
  transform(value: any): string | null {
    // Check if value is valid (not null or undefined)
    if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length > 0) {
        return keys[0]; // Return the first key
      }
    }
    return null; // Return null if value is invalid or empty object
  }

}

