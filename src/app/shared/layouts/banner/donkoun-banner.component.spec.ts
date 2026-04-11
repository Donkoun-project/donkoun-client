import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonkounBannerComponent } from './donkoun-banner.component';

describe('BannerComponent', () => {
  let component: DonkounBannerComponent;
  let fixture: ComponentFixture<DonkounBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonkounBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DonkounBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
