import { Directive, HostBinding, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, UrlSegment } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DIALOG_SERVICE_TOKEN } from '../interfaces/dialog.interface';
import { Rule } from '../models/rule';
import { MODEL_SERVICE, MODEL_TOKEN } from '../tokens/dynamic-form-tokens';

@Directive()
export abstract class BaseTableImplementation<T = any, TEditArgs = any, TRemoveArgs = any> implements OnInit, OnDestroy {
  // Access the Router without a constructor
  protected router = inject(Router);
  protected translate = inject(TranslateService);
  // Common Dependency Injection
  protected dataService = inject(MODEL_SERVICE, { optional: true });
  protected modelToken = inject(MODEL_TOKEN, { optional: true });
  protected dialogService = inject(DIALOG_SERVICE_TOKEN, { optional: true });
  public basePath: string = '';
  public title: string = '';
  // --- Configuration Inputs (Your previous snapshot keys) ---
  @Input() model: T | null = null;
  @Input() dictPath: string | null = null; //rdict
  @Input() fileLayout: string = ''; //rdict
  @Input() idProperty: string = 'id';

  // Visibility & UI
  @Input() showHeader: boolean = true;
  @Input() showSearch: boolean = false;
  @Input() searchFields: string[] | null = null;

  // Data & Pagination
  @Input() pageable: boolean = false;
  @Input() pageSizes: number[] = [10, 20, 30, 50, 100];
  @Input() defaultSort: string | null = null;
  @Input() defaultSortDirection: 'asc' | 'desc' | null = null;
  @Input() defaultFilter: any = null;
  @Input() customInclude: string = null;
  // Actions & Rules
  @Input() hasAdd: boolean = true;
  @Input() canDelete: boolean = true;
  @Input() canEdit: boolean = true;
  @Input() deletePropertyName: string = 'name';
  @Input() deleteDisableRule: Rule[];

  // Edit Behavior
  @Input() editOnClick: boolean = false;
  @Input() editOnDblClick: boolean = false;
  @Input() editColumn: string | null = null;
  @Input() useView: boolean = false; //rdict

  @Input() hostClass: string = '';
  ngOnInit(): void {
    const urlTree = this.router.url.split('?')[0];
    const currentUrlSegments: UrlSegment[] = urlTree
      .split('/')
      .filter((segment) => segment !== '')
      .map((segment) => new UrlSegment(segment, {}));

    this.basePath = currentUrlSegments.map((segment) => segment.path).join('/');
  }
  ngOnDestroy(): void {}
  @HostBinding('class')
  get hostClasses(): string {
    return this.hostClass;
  }
  // Mandatory method for every implementation (Kendo, Rdict, etc.)
  abstract loadData(): void;

  protected addHandler(): void {
    this.router.navigate([`${this.basePath}/add`]);
  }
  abstract editHandler(args: TEditArgs): void;
  protected edit(dataItem: any, column?: any): void {
    // 1. Resolve the dynamic ID value from the object
    const idValue = dataItem[this.idProperty];

    if (idValue) {
      // 2. Navigate using the resolved value
      this.router.navigate([`${this.basePath}/edit/${idValue}`]);
    } else {
      console.warn(`Property "${this.idProperty}" not found on data item:`, dataItem);
    }
  }
  /**
   * Abstract contract for removing items.
   * TRemoveArgs allows Kendo to use RemoveEvent, while others might use a simple ID.
   */
  abstract removeHandler(args: TRemoveArgs): void;

  /**
   * Shared delete logic that can be called by any implementation
   */
  protected delete(dataItem: any): void {
    const idValue = Reflect.get(dataItem, this.idProperty);

    const modelName = Reflect.get(dataItem, this.deletePropertyName);
    const message = this.translate.instant('Are you sure you want to delete this {{modelName}}?', { modelName });
    if (this.dialogService) {
      // Use the generic confirm method
      this.dialogService.confirmDelete().subscribe((confirmed) => {
        if (confirmed) this.performDelete(idValue);
      });
    } else if (confirm(message)) {
      // Fallback to browser confirm if no service is provided
      this.performDelete(idValue);
    }
  }
  abstract performDelete(id: any): void;
  abstract getCellValue(item: any, column: any): any;
}
