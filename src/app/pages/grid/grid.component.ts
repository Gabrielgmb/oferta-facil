import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Diciplina } from 'src/app/model/disciplina.model';
import { Table } from 'src/app/model/table.model';
import { TableService } from 'src/app/services/table.service';
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  hold:Diciplina =new Diciplina();
  table: Table[]=[];
  constructor(
    private dialog: MatDialog,
    private tableService :TableService
    ) {
   }

  ngOnInit(): void {
    this.getTable();
    this.listenTable();
  }

  getTable(){
    this.table = this.tableService.getTable();
  }
 
  listenTable() {
     this.tableService.getSubjectTable().subscribe(table => {
        this.getTable();
     })
   }
  
  switch(event: CdkDragDrop<any>) {
    let previousItem = event.previousContainer.data;
    let actualItem = event.container.data;
    this.table[previousItem.semesterIndex].sections[previousItem.sectionIndex].rows[previousItem.rowIndex]=event.container.data.item;
    this.table[actualItem.semesterIndex].sections[actualItem.sectionIndex].rows[actualItem.rowIndex]=event.previousContainer.data.item;
    localStorage.setItem('table', JSON.stringify(this.table));
  }

  grab(diciplina:Diciplina) {
    this.hold=diciplina;
  }

  drop(i:number,j:number,y:number) {
    if(Object.keys(this.hold).length !== 0){
      this.tableService.addDiciplina(i,j,y,this.hold)
      this.hold=new Diciplina();
    }
  }

  addTeacher(disciplina:Diciplina,i:number,j:number){
    const dialogRef = this.dialog.open(DialogSelect, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

     var test = result;
    });
  }
}

@Component({
  selector: 'dialog-select',
  templateUrl: 'dialog-select.html',
})
export class DialogSelect {
  constructor(
    public dialogRef: MatDialogRef<DialogSelect>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}