import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { KENDO_BUTTON } from '@progress/kendo-angular-buttons';
import { KENDO_CALENDAR } from '@progress/kendo-angular-dateinputs';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import { KENDO_SVGICON, SVGIcon } from '@progress/kendo-angular-icons';
import { KENDO_LABEL } from '@progress/kendo-angular-label';
import { KENDO_STEPPER } from '@progress/kendo-angular-layout';
import { KENDO_LISTBOX } from '@progress/kendo-angular-listbox';
import { BreadCrumbItem, KENDO_BREADCRUMB } from "@progress/kendo-angular-navigation";
import { KENDO_SPREADSHEET, SheetDescriptor } from '@progress/kendo-angular-spreadsheet';
import { KENDO_TREEVIEW } from '@progress/kendo-angular-treeview';
import * as svgIcons from '@progress/kendo-svg-icons';
import { ReactiveDictionary, SocketService, WsAuthService } from 'projects/rosoftlab/rdict/src/public-api';
@Component({
    selector: 'app-data-processing',
    templateUrl: './data-processing.component.html',
    styleUrls: ['./data-processing.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        KENDO_DROPDOWNLIST, KENDO_SPREADSHEET, KENDO_STEPPER, KENDO_CALENDAR,
        KENDO_LABEL, KENDO_BUTTON, KENDO_BREADCRUMB,
        KENDO_LISTBOX, KENDO_SVGICON, KENDO_TREEVIEW
    ]
    // ,
    // providers: [
    //   { provide: SOCKET_URL, useValue: 'http://localhost:5100' },
    // ]
})
export class DataProcessingComponent implements OnInit {
  private rdict: ReactiveDictionary | undefined;
  public model: any = {
    date: new Date(),
    selectedLocationId: "",
    selectedDataPrecessingLayoutId: ""
  };

  public locations: any
  public dataPrecessingLayouts: any
  public selections: BreadCrumbItem[] = []



  currentStep = 0;
  public allIcons = svgIcons;
  steps = [
    { label: 'Data și locație' },
    { label: 'Preluare date' },
    { label: 'Selectie coloane' },
    { label: 'Prelucrare' },
  ];

  selectedDate: string | null = null;
  selectedLocation: string | null = null;
  public importList: any | null = [];
  public exportList: any | null = [];

  data: string | null = null;
  availableColumns = ['Column 1', 'Column 2', 'Column 3'];
  selectedColumns: string[] = [];

  public data2: SheetDescriptor[] = [
    {
      "name": "Sheet1",
      "rows": [
        {
          "cells": [
            {
              "value": "Date",
              "enable": false
            },
            {
              "value": "Hour",
              "enable": false
            },
            {
              "value": "Temperature",
              "enable": false
            },
            {
              "value": "Wind Speed",
              "enable": false
            },
            {
              "value": "Radiation",
              "enable": false
            },
            {
              "value": "Formula"
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "01:00:00",
              "enable": false
            },
            {
              "value": 4.03,
              "enable": false
            },
            {
              "value": 21.744,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            },
            {
              "formula": "CEILING.MATH(C2)"
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "02:00:00",
              "enable": false
            },
            {
              "value": 3.4,
              "enable": false
            },
            {
              "value": 20.556,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            },
            {
              "formula": "CEILING.MATH(C3)"
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "03:00:00",
              "enable": false
            },
            {
              "value": 2.76,
              "enable": false
            },
            {
              "value": 19.44,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            },
            {
              "formula": "CEILING.MATH(C4)"
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "04:00:00",
              "enable": false
            },
            {
              "value": 2.35,
              "enable": false
            },
            {
              "value": 18.072,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "05:00:00",
              "enable": false
            },
            {
              "value": 1.92,
              "enable": false
            },
            {
              "value": 16.452,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "06:00:00",
              "enable": false
            },
            {
              "value": 1.46,
              "enable": false
            },
            {
              "value": 15.444,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "07:00:00",
              "enable": false
            },
            {
              "value": 1.12,
              "enable": false
            },
            {
              "value": 14.148,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "08:00:00",
              "enable": false
            },
            {
              "value": 1.12,
              "enable": false
            },
            {
              "value": 12.78,
              "enable": false
            },
            {
              "value": 38.39,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "09:00:00",
              "enable": false
            },
            {
              "value": 1.6,
              "enable": false
            },
            {
              "value": 12.636,
              "enable": false
            },
            {
              "value": 178.1,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "10:00:00",
              "enable": false
            },
            {
              "value": 2.5,
              "enable": false
            },
            {
              "value": 11.916,
              "enable": false
            },
            {
              "value": 279.85,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "11:00:00",
              "enable": false
            },
            {
              "value": 3.63,
              "enable": false
            },
            {
              "value": 12.168,
              "enable": false
            },
            {
              "value": 352.98,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "12:00:00",
              "enable": false
            },
            {
              "value": 4.83,
              "enable": false
            },
            {
              "value": 13.176,
              "enable": false
            },
            {
              "value": 378.62,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "13:00:00",
              "enable": false
            },
            {
              "value": 5.9,
              "enable": false
            },
            {
              "value": 14.76,
              "enable": false
            },
            {
              "value": 344.52,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "14:00:00",
              "enable": false
            },
            {
              "value": 6.32,
              "enable": false
            },
            {
              "value": 18.936,
              "enable": false
            },
            {
              "value": 254.45,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "15:00:00",
              "enable": false
            },
            {
              "value": 6.14,
              "enable": false
            },
            {
              "value": 19.296,
              "enable": false
            },
            {
              "value": 124.89,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "16:00:00",
              "enable": false
            },
            {
              "value": 5.46,
              "enable": false
            },
            {
              "value": 16.272,
              "enable": false
            },
            {
              "value": 32.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "17:00:00",
              "enable": false
            },
            {
              "value": 4.9,
              "enable": false
            },
            {
              "value": 12.348,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "18:00:00",
              "enable": false
            },
            {
              "value": 4.47,
              "enable": false
            },
            {
              "value": 12.348,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "19:00:00",
              "enable": false
            },
            {
              "value": 4.17,
              "enable": false
            },
            {
              "value": 13.896,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "20:00:00",
              "enable": false
            },
            {
              "value": 3.88,
              "enable": false
            },
            {
              "value": 16.704,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "21:00:00",
              "enable": false
            },
            {
              "value": 3.55,
              "enable": false
            },
            {
              "value": 17.172,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "22:00:00",
              "enable": false
            },
            {
              "value": 3.15,
              "enable": false
            },
            {
              "value": 15.552,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        },
        {
          "cells": [
            {
              "value": "2024-12-23",
              "enable": false
            },
            {
              "value": "23:00:00",
              "enable": false
            },
            {
              "value": 2.72,
              "enable": false
            },
            {
              "value": 17.028,
              "enable": false
            },
            {
              "value": 0.0,
              "enable": false
            }
          ]
        }
      ],
      "columns": [
        {
          "index": 0,
          "width": 200
        },
        {
          "index": 1,
          "width": 200
        }
      ]
    }

  ];


  public columns: any[] = [
    {
      text: "Date",

    },
    {
      text: "Hour",
    },
    {
      text: "Temperature",
    },
    {
      text: "Wind Speed",
    },
    {
      text: "Radiation",
    }
  ];
  public checkedKeys: any[] = ["0", "1", "2", "3", "4"];

  constructor(
    public translate: TranslateService,
    private socketService: SocketService,
    private wsAuthService: WsAuthService) {
  }
  async ngOnInit() {
    this.rdict = ReactiveDictionary.getInstance(this.socketService, this.wsAuthService.Token);
    await this.rdict.asyncInit();
    await this.loadStepData(0)

  }
  private async loadStepData(index: number) {
    switch (index) {
      case 0:
        this.locations = await this.rdict.getTableWithoutGuid('administration.locations')
        break;
      case 1:
        this.importList = await this.rdict.getTableWithoutGuid('administration.import_layout')
        this.exportList = await this.rdict.getTableWithoutGuid('administration.export_layout')
        this.dataPrecessingLayouts = await this.rdict.getTableWithoutGuid('administration.data_processing_layout')
        break;
      case 2:


    }
  }
  async onStepChange(index: number) {
    console.log(index)
    this.currentStep = index;
    await this.loadStepData(index)
  }

  fetchData() {
    // Mock fetching data
    this.data = 'Data fetched for ' + this.selectedLocation;
  }

  async nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      await this.loadStepData(this.currentStep)
      this.selections = [
        ... this.selections,
        {
          text: (new Date()).toDateString(),
          title: "Home",
        }
      ]
    }
  }
  getStatusColor(status: string): string {
    if (status.endsWith('1')) {
      return 'green';
    } else if (status.endsWith('2')) {
      return 'orange';
    } else if (status.endsWith('3')) {
      return 'red';
    } else {
      return 'gray';
    }
  }

  getstatusIcon(status: string): SVGIcon {
    if (status.endsWith('1')) {
      return this.allIcons.checkCircleIcon;
    } else if (status.endsWith('2')) {
      return this.allIcons.infoCircleIcon;
    } else if (status.endsWith('3')) {
      return this.allIcons.warningCircleIcon;
    } else {
      return this.allIcons.alignBottomIcon;
    }
  }
  async prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      await this.loadStepData(this.currentStep)
    }
  }
}
