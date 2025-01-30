import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyKendoModule } from '@ngx-formly/kendo';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveDictionary } from '../../reactive-dictionary';
import { SocketService, WsAuthService } from '../../services';
import { CrudFormlyTransaltionModule } from './rsl-reactive-dictionary.module';
;
@Component({
  selector: 'app-rdict-crud',
  templateUrl: './rdict-crud.component.html',
  styleUrls: ['./rdict-crud.component.scss'],
  imports: [
    FormlyModule,
    ReactiveFormsModule,
    FormlyKendoModule,
    TranslateModule,
    CrudFormlyTransaltionModule
  ]
})
export class RdictCrudComponent implements OnInit {
  title: string;

  rdict: ReactiveDictionary | undefined;
  basePath: string;
  dictPath: string;
  rdictModel: string;


  baseForm = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];
  // = [
  //   {
  //     key: 'name',
  //     type: 'input',
  //     props: {
  //       label: 'General.Name',
  //       translate: true,
  //       required: true,
  //     }
  //   },
  // ];


  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public translate: TranslateService,
    private socketService: SocketService,
    private wsAuthService: WsAuthService,
  ) {

  }

  async ngOnInit() {
    const currentUrlSegments: UrlSegment[] = this.router.url.split('/').map(segment => new UrlSegment(segment, {}));
    this.basePath = currentUrlSegments.map(segment => segment.path).join('/');
    const filteredSegments = currentUrlSegments.filter(segment => segment.path !== '');
    this.dictPath = filteredSegments.map(segment => segment.path).join('.');
    this.rdictModel = filteredSegments.length > 0 ? filteredSegments[filteredSegments.length - 2].path : ''; // Default to empty string if no valid segments
    this.rdict = ReactiveDictionary.getInstance(this.socketService, this.wsAuthService.Token);
    if (this.rdict.size == 0)
      await this.rdict.asyncInit();
    await this.getModelFields();
  }
  onSubmit(model) {
  }
  async getModelFields() {
    if (this.rdictModel) {
      const formLayout = await this.rdict.asyncGet("config.models." + this.rdictModel + ".formLayout");
      // const tableLayout = await this.rdict.asyncGet("config.models." + this.rdictModel + ".tableLayout");
      console.log(formLayout);
      // console.log(tableLayout);
      if (formLayout) {
        this.title = this.translate.instant(formLayout["title"]);
        this.fields = formLayout["fields"]
      }
    }
  }
}
