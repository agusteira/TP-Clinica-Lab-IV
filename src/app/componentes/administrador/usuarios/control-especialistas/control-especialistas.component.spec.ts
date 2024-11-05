import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlEspecialistasComponent } from './control-especialistas.component';

describe('ControlEspecialistasComponent', () => {
  let component: ControlEspecialistasComponent;
  let fixture: ComponentFixture<ControlEspecialistasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlEspecialistasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlEspecialistasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
