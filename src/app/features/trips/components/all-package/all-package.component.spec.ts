import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllParcelComponent } from './all-parcel.component';

describe('AllParcelComponent', () => {
  let component: AllParcelComponent;
  let fixture: ComponentFixture<AllParcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllParcelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllParcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
