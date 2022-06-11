import { Component, OnInit } from '@angular/core';
import { TableService } from 'src/app/services/table.service';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'smd-management';
  constructor(
    private tableService :TableService,
    private dataService :DataService
    ) {
      this.dataService.init().then(succes=>{
        this.tableService.init();
      });

   }

  ngOnInit(): void {

  }
 
}
