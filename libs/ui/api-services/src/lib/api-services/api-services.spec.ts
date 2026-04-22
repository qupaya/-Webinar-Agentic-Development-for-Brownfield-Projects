import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiServices } from './api-services';

describe('ApiServices', () => {
  let component: ApiServices;
  let fixture: ComponentFixture<ApiServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiServices],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
