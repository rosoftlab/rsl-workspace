import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Configurations } from './configurations';

@NgModule({
  imports: [
    CommonModule
  ],
})
export class RslReactiveDictionaryModule {
  public static forRoot(config: Configurations): ModuleWithProviders<RslReactiveDictionaryModule> {
    return {
      ngModule: RslReactiveDictionaryModule,
      providers: [
        { provide: Configurations, useValue: config },
        provideAnimations(),
      ]
    };
  }
 }
