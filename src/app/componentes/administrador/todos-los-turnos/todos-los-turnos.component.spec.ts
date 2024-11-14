import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosLosTurnosComponent } from './todos-los-turnos.component';

describe('TodosLosTurnosComponent', () => {
  let component: TodosLosTurnosComponent;
  let fixture: ComponentFixture<TodosLosTurnosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosLosTurnosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodosLosTurnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
