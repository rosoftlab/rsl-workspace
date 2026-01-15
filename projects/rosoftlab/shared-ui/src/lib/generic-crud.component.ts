import { NgComponentOutlet } from '@angular/common';
import { Component, inject, Injector, OnInit, Provider, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CRUD_IMPLEMENTATIONS_TOKEN,
  MODEL_SERVICE,
  MODEL_TOKEN
} from '@rosoftlab/core';

@Component({
  selector: 'rsl-generic-crud',
  imports: [NgComponentOutlet], // [3] Add it here
  standalone: true,
  template: `
      <ng-container 
        *ngComponentOutlet="selectedComponent; 
                            inputs: allInputs; 
                            injector: tableInjector">
      </ng-container>
  `
})
export class GenericCrudComponent implements OnInit {
  // State for the dynamic outlet
  selectedComponent!: Type<any>;
  allInputs: Record<string, any> = {};
  tableInjector!: Injector;

  private route = inject(ActivatedRoute);
  private parentInjector = inject(Injector);
  
  // Injected from your App Config (Plug-in architecture)
  private crudMap = inject(CRUD_IMPLEMENTATIONS_TOKEN);

  ngOnInit(): void {
    const snapshot = this.route.snapshot;
    const { data, params } = snapshot;

    // 1. Resolve which library component to show (e.g., 'KENDO')
    const implKey = data['impl'] as string;
    this.selectedComponent = this.crudMap[implKey];

    if (!this.selectedComponent) {
      throw new Error(`Implementation for "${implKey}" not found in Table Map.`);
    }

    // 2. Filter out keys that should NOT be passed as @Inputs
    // We remove 'impl', 'modelService', and 'modelToken' because 
    // they are used for configuration, not UI properties.
    const { impl, modelService, modelToken, ...componentInputs } = data;

    this.allInputs = {
      ...params,
      ...componentInputs
    };

    // 3. Setup Dynamic Injection for MODEL_SERVICE and MODEL_TOKEN
    const dynamicProviders: Provider[] = [];

    if (data['modelService']) {
      dynamicProviders.push({ 
        provide: MODEL_SERVICE, 
        useExisting: data['modelService'] 
      });
    }

    if (data['modelToken']) {
      dynamicProviders.push({ 
        provide: MODEL_TOKEN, 
        useValue: data['modelToken'] 
      });
    }

    // 4. Create the Injector specifically for this component instance
    this.tableInjector = Injector.create({
      providers: dynamicProviders,
      parent: this.parentInjector
    });
  }
}