import { Component, OnInit, Inject } from '@angular/core';
import { CdkDragDrop} from "@angular/cdk/drag-drop";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Card } from 'src/app/model/card.model';
import { Table } from 'src/app/model/table.model';
import { TableService } from 'src/app/services/table.service';
import { PROFESSORES } from 'src/app/consts/professores'; 
import { SEMESTRES, HORARIO } from 'src/app/consts/consts';
import { Professor } from 'src/app/model/professor.model';
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
    if(this.hold){
      this.hold = undefined;
    }else{
      this.hold = undefined;
      if(card.local.length*2 < card.diciplina.hours){
        this.hold = card;
      }
    }

  }

  drop(data:any,turma:any) {
    if(this.hold && this.hold.turma==turma && !data.card){
      delete data['card'];
      this.hold.local.push(data);
      this.tableService.addTime(this.hold);
      this.hold = undefined;
    }

  }

  changeTeacher(card:Card,type:string){
    const dialogRef = this.dialog.open(DialogSelect, {
      width: '300px',
      data: {
        professores:card.professores,
        type:type
      },
      
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if(type=='add'){
          card.professores.push(result)
          this.tableService.changeTeacher(card)
        }else if(type=='sub'){
          const index = card.professores.findIndex(professor=>professor.id==result.id);
          card.professores.splice(index,1);
          this.tableService.changeTeacher(card)
        }
      }
    });
  }
}
@Component({
  selector: 'dialog-select',
  templateUrl: 'dialog-select.html',
  styleUrls: ['./dialog-select.scss']
})
export class DialogSelect implements OnInit{
  professores:Array<Professor>;
  selecionado:any;
  constructor(
    public dialogRef: MatDialogRef<DialogSelect>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

  }

  ngOnInit(): void {
    console.log(this.data)
    if(this.data.type=='add'){
      this.professores = PROFESSORES.filter((professor:Professor)=>{
        const result = this.data.professores.some((injectProfessor:Professor)=> injectProfessor.id==professor.id);
        if(result){
          return false;
        }else
          return true
      });
      this.professores.sort((a, b) => a.name.localeCompare(b.name))
    }else if(this.data.type=='sub'){
      this.professores = this.data.professores;
      this.professores.sort((a, b) => a.name.localeCompare(b.name))
    }
    
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}