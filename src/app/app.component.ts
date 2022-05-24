import { Component, OnInit } from '@angular/core';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'smd-management';
  constructor(
    private tableService :TableService
    ) {
      this.tableService.init();
   }

  ngOnInit(): void {

  }
 
}
