import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonkounHeaderComponent } from './donkoun-header.component';

describe('HeaderComponent', () => {
  let component: DonkounHeaderComponent;
  let fixture: ComponentFixture<DonkounHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonkounHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DonkounHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
