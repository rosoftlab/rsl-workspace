import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportPluginEditorComponent } from './import-plugin-editor.component';

describe('ImportPluginEditorComponent', () => {
  let component: ImportPluginEditorComponent;
  let fixture: ComponentFixture<ImportPluginEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportPluginEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportPluginEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
