import { Component, OnInit } from '@angular/core';
import { CdkDragDrop} from "@angular/cdk/drag-drop";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Turma } from 'src/app/model/turma.model';
import { Card } from 'src/app/model/card.model';
import { Table } from 'src/app/model/table.model';
import { TableService } from 'src/app/services/table.service';
import { PROFESSORES } from 'src/app/consts/professores'; 
import { SEMESTRES, HORARIO } from 'src/app/consts/consts';
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  hold:any;
  table: Table;
  semesters=SEMESTRES;
  hours=HORARIO;
  displayedColumns: string[] = ['Segunda', 'Terca', 'Quarta', 'Quinta','Sexta'];
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
    console.log(this.table)
  }
 
  listenTable() {
     this.tableService.getSubjectTable().subscribe(table => {
        this.getTable();
     })
   }
  
  switch(event: CdkDragDrop<any>) {
    let previousItem = event.previousContainer.data;
    let actualItem = event.container.data; 
    console.log(previousItem,actualItem)  
    if(!actualItem.card)
      this.tableService.changeEmptyTime(previousItem,actualItem);
    else
      if(actualItem.card.id!==previousItem.card.id)
        this.tableService.changeTime(previousItem,actualItem)
  }

  grab(card:Card) {
    this.hold = card;
  }

  drop(data:any,turma:any) {
    if(this.hold && this.hold.turma==turma && !data.card){
      delete data['card'];
      this.hold.local.push(data);
      this.tableService.addTime(this.hold);
      this.hold = undefined;
    }

  }

  addTeacher(card:Card){
    const dialogRef = this.dialog.open(DialogSelect, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        card.professores.push(result)
        this.tableService.addTeacher(card)
      }
    });
  }
}

@Component({
  selector: 'dialog-select',
  templateUrl: 'dialog-select.html',
})
export class DialogSelect {
  teachers=PROFESSORES;
  selected:any;
  constructor(
    public dialogRef: MatDialogRef<DialogSelect>
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}