import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMarcarOpcion]',
  standalone: true
})
export class MarcarOpcionDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.25)');
    this.renderer.setStyle(this.el.nativeElement, 'background-color', '#434343'); // Oscurecer ligeramente
    this.renderer.setStyle(this.el.nativeElement, 'color', 'white'); // Oscurecer ligeramente
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
    this.renderer.setStyle(this.el.nativeElement, 'background-color', ''); // Restablecer fondo
    this.renderer.setStyle(this.el.nativeElement, 'color', 'black'); // Oscurecer ligeramente
  }

  @HostListener('click') onClick(): void {
    const parent = this.el.nativeElement.parentElement;
    const options = parent.querySelectorAll('.option-item, .card-especialista, .card-especialidad, .card-fecha');
    options.forEach((option: HTMLElement) => {
      this.renderer.setStyle(option, 'background-color', ''); // Restablecer fondo de todos
      this.renderer.setStyle(option, 'color', ''); // Restablecer color de texto de todos
    });

    // Aplicar estilos al elemento seleccionado
    this.renderer.setStyle(this.el.nativeElement, 'background-color', '#007bff'); // Fondo azul
    this.renderer.setStyle(this.el.nativeElement, 'color', 'white'); // Texto blanco
    this.renderer.setStyle(this.el.nativeElement, 'font-weight', 'bold'); // Negrita
  }
}
