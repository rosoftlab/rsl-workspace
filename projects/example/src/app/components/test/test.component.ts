import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Define a custom injection token
import { InjectionToken } from '@angular/core';
import { BaseService } from '@rosoftlab/core';

export const CLASS_NAME_TOKEN = new InjectionToken<any>('className');

@Component({
  selector: 'app-your-component',
  template: '<h1>Your Component</h1>',
})
export class TestComponent implements OnInit {
  instance: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    // @Inject(CLASS_NAME_TOKEN) private instance: any
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(
      ({ modelInstance, serviceInstance }) => {
        this.instance = modelInstance
        console.log(modelInstance)
        console.log(serviceInstance)
        const baseService = new BaseService<typeof modelInstance>(serviceInstance);
        console.log(baseService)
        // do something with your resolved data ...
      });
  }

}

