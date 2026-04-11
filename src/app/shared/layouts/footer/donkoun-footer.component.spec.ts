import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonkounFooterComponent } from './donkoun-footer.component';

describe('FooterComponent', () => {
  let component: DonkounFooterComponent;
  let fixture: ComponentFixture<DonkounFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonkounFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DonkounFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
