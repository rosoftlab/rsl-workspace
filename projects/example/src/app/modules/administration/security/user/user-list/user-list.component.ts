import { HttpClient } from '@angular/common/http';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Rule } from '@rosoftlab/core';
// import { Rule } from '@rosoftlab/core';
import { EmployeeService } from 'projects/example/src/app/services';

export interface Data {
  movies: string;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserListComponent {
  public data: Data;
  public columns: any;
  public rows: any;
  constructor(
    public userService: EmployeeService,
    private router: Router,
    private http: HttpClient) {
    this.columns = [
      { name: 'Name' },
      { name: 'Company' },
      { name: 'Genre' },
      { name: 'Name' },
      { name: 'Company' },
      { name: 'Genre' },
      { name: 'Name' },
      { name: 'Company' },
      { name: 'Genre' },
      { name: 'Name' },
      { name: 'Company' },
      { name: 'Genre' }
    ];
    this.http.get<Data>('../../assets/movies.json')
      .subscribe((res) => {
        console.log(res)
        this.rows = res.movies;
      });
  }

  addForm() {
    this.router.navigate(['administration/security/user/add']);
  }
  disableDeleteRule(): Rule[] {
    const rules = [];
    const rule = new Rule();
    rule.order = 0;
    rule.rule = {
      '==': [{ var: 'systemUser' }, 'true']
    };
    rule.parameters = ['systemUser'];
    rules.push(rule)
    return rules;
  }
}
