import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureTodos } from './feature-todos';

describe('FeatureTodos', () => {
  let component: FeatureTodos;
  let fixture: ComponentFixture<FeatureTodos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureTodos],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureTodos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
