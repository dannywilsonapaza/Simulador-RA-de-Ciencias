import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // Convertir markdown básico a HTML
    let html = value
      // Negritas con **texto**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Saltos de línea
      .replace(/\n/g, '<br>');

    return this.sanitizer.sanitize(1, html) || '';
  }
}
