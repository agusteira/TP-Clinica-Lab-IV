import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavPacienteComponent } from './nav-paciente.component';

describe('NavPacienteComponent', () => {
  let component: NavPacienteComponent;
  let fixture: ComponentFixture<NavPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavPacienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
