import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  items=[0,1,2,3,4,5,6,7,8,9,10,11]
  option="30rem"

  constructor() {
   }

  ngOnInit(): void {
  }
  
  drop(event: CdkDragDrop<any>) {
    this.items[event.previousContainer.data.index]=event.container.data.item
    this.items[event.container.data.index]=event.previousContainer.data.item
  }

}
