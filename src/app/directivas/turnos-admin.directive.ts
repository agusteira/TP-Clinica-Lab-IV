
import { Directive, OnChanges, Input, ElementRef, Renderer2, SimpleChanges } from "@angular/core";

@Directive({
  selector: '[appTurnosAdmin]',
  standalone: true,
})
export class TurnosAdminDirective implements OnChanges {
  @Input() appTurnosAdmin: string | null = null; // Cambiar a appTurnosAdmin

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appTurnosAdmin']) { // Cambiar aquí también
      this.applyHighlight();
    }
  }

  private applyHighlight(): void {
    const estado = this.appTurnosAdmin; // Usar la propiedad correcta

    // Limpia clases previas
    this.renderer.removeClass(this.el.nativeElement, 'estado-cancelado');
    this.renderer.removeClass(this.el.nativeElement, 'estado-realizado');
    this.renderer.removeClass(this.el.nativeElement, 'estado-pendiente');

    // Aplica la clase según el estado
    if (estado === 'cancelado') {
      this.renderer.addClass(this.el.nativeElement, 'estado-cancelado');
    } else if (estado === 'realizado') {
      this.renderer.addClass(this.el.nativeElement, 'estado-realizado');
    } else if (estado === 'pendiente') {
      this.renderer.addClass(this.el.nativeElement, 'estado-pendiente');
    }
  }
}