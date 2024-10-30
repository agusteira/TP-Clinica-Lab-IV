import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavEspecialistaComponent } from './nav-especialista.component';

describe('NavEspecialistaComponent', () => {
  let component: NavEspecialistaComponent;
  let fixture: ComponentFixture<NavEspecialistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavEspecialistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavEspecialistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
