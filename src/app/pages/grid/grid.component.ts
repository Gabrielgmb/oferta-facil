import { Component, OnInit, Inject } from '@angular/core';
import { CdkDragDrop} from "@angular/cdk/drag-drop";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Card } from 'src/app/model/card.model';
import { Table } from 'src/app/model/table.model';
import { TableService } from 'src/app/services/table.service';
import { PROFESSORES } from 'src/app/consts/professores'; 
import { SEMESTRES, HORARIO, DIAS } from 'src/app/consts/consts';
import { Professor } from 'src/app/model/professor.model';
import { SALAS } from 'src/app/consts/salas';
import { Horario } from 'src/app/model/horario.model';

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
  days=DIAS;
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
    if(!actualItem.card)
      this.tableService.changeEmptyTime(previousItem,actualItem);
    else
      if(actualItem.card.id!==previousItem.card.id)
        this.tableService.changeTime(previousItem,actualItem)
  }

  grab(card:Card) {
    if(this.hold&&this.hold.id==card.id){
      this.hold = undefined;
    }else{
      if(card.horarios.length*2 < card.diciplina.hours){
        this.hold = card;
      }
    }
  }

  drop(data:any,turma:any) {
    if(this.hold && this.hold.turma==turma && !data.card){
      delete data['card'];
      this.hold.horarios.push(data);
      this.tableService.addTime(this.hold);
      if(this.hold.horarios.length*2 >= this.hold.diciplina.hours){
        this.hold = undefined;
      }
    }
  }

  removeTime(date:any) {

    const index = date.card.horarios.findIndex((horario:Horario)=>date.dia==horario.dia && date.turno==horario.turno &&  date.hora==horario.hora);
    date.card.horarios.splice(index,1);
    this.tableService.removeTime(date.card)
  }

  openModal(card:Card,type:string,item:string){
    const dialogRef = this.dialog.open(DialogSelect, {
      width: '300px',
      data: {
        card:card,
        type:type,
        item:item
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if(item=='sala'){
          card.sala=result
          this.tableService.changeRoom(card)
        }else if(item=='professor'){
          if(type=='add'){
            card.professores.push(result)
            this.tableService.changeTeacher(card)
          }else if(type=='sub'){
            const index = card.professores.findIndex(professor=>professor.id==result.id);
            card.professores.splice(index,1);
            this.tableService.changeTeacher(card)
          }
        }else if(item=='vagas'){
          card.vagas=result
          this.tableService.changeVacancy(card)
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
  lista:Array<any>;
  selecionado:any;
  constructor(
    public dialogRef: MatDialogRef<DialogSelect>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

  }
  ngOnInit(): void {
    console.log(this.data)
    if(this.data.item=='professor')
      this.setTeacherSelect();
    else if(this.data.item=='sala')
      this.setRoomSelect();
    else if(this.data.item=='vagas')
      this.setVagasSelect();
  }
  setTeacherSelect(): void {
    if(this.data.type=='add'){
      this.lista = PROFESSORES.filter((professor:Professor)=>{
        const result = this.data.card.professores.some((injectProfessor:Professor)=> injectProfessor.id==professor.id);
        if(result){
          return false;
        }else
          return true
      });
      console.log(this.lista)
    }else if(this.data.type=='sub'){
      this.lista = this.data.card.professores;
    }
    this.lista.sort((a, b) => a.name.localeCompare(b.name))
  }

  setRoomSelect(): void {
    this.lista = SALAS;
    this.lista.sort((a, b) => a.name.localeCompare(b.name))
  }

  setVagasSelect(): void {
    this.lista = SALAS;
    this.selecionado = this.data.card.vagas;
    this.lista.sort((a, b) => a.name.localeCompare(b.name))
    console.log(this.selecionado)
  }



  onNoClick(): void {
    this.dialogRef.close();
  }
}