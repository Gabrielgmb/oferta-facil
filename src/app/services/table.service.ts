import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Diciplina } from 'src/app/model/disciplina.model';
import { Local } from '../model/local.model';
import { Card } from '../model/card.model';
import { Turma } from '../model/turma.model';
import { DICIPLINAS } from '../consts/diciplinas';
import { TURMAS } from '../consts/turmas';
import { Table } from '../model/table.model';
import { Professor } from '../model/professor.model';
import { HORARIO } from '../consts/consts';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private diciplinas = DICIPLINAS;
  private turmas = TURMAS;
  private cards: Array<Card>;
  private baseTable:Array<any>;
  private table:Table;
  private tableSubject: Subject<Table>;
  constructor() {
    this.tableSubject = new Subject<Table>();
    this.baseTable = [];
    this.table = {daytime:[],nocturnal:[],teachers:[]};
    this.cards = [];
   }

   public init(){
    const cards= localStorage.getItem('cards');
    if (cards && cards !== 'null' && cards !== undefined && cards !== 'undefined'&& cards && cards !== '') {
      this.cards = JSON.parse(cards);
    }
    this.setBaseHourTable();
    this.setDaytimeTable();
    this.setTeacherTable();
  }

  private setBaseHourTable(){
    this.turmas.forEach(turma => {
      turma.shift.forEach((shift:number)=>{
        let i =0;
        while (i < 10) {
          turma.rows.push({
            dia: i% 5,
            turno:shift,
            hora: (shift*2) + Math.floor(i/5)
          })
          i++;
        }
      })
      this.diciplinas.forEach(diciplina => {
        if(diciplina.semester===turma.semester)
          turma.card.push(new Card(diciplina,turma.code))
      });
      this.baseTable.push(turma);
    });
  }

  private setDaytimeTable(){
    const base = JSON.parse(JSON.stringify(this.baseTable));

    this.table.daytime = base.map((turma:Turma)=>{
      turma.card =turma.card.map((innerCard: Card)=>{
        let card = this.cards.find((card:Card)=>card.turma==turma.code &&innerCard.diciplina.code==card.diciplina.code);
        if(card)
          return  JSON.parse(JSON.stringify(card));
        else
          return innerCard
      });

      turma.rows =turma.rows.map((innerData: any)=>{
        innerData.card = this.cards.find((card:Card)=>{
          if(card.turma==turma.code){
            const result = card.local.some((data:Local)=> data.dia==innerData.dia && data.turno==innerData.turno&& data.hora==innerData.hora);
            if(result){
              return card;
            }else
              return false
          }else
            return false
        });
        !innerData.card?delete innerData['card']:null;
        return innerData
      });
      return turma;
    });
  }

  private updateHourTable(turma:string){
    let base = JSON.parse(JSON.stringify(this.baseTable.find((innerTurma:Turma)=>innerTurma.code==turma)));
    base.card =base.card.map((innerCard: Card)=>{
      let card = this.cards.find((card:Card)=>card.id==innerCard.id);
      if(card)
        return  JSON.parse(JSON.stringify(card));
      else
        return innerCard
    });
    
    base.rows =base.rows.map((innerData: any)=>{
      innerData.card = this.cards.find((card:Card)=>{
        if(card.turma==base.code){
          const result = card.local.some((data:Local)=> data.dia==innerData.dia && data.turno==innerData.turno&& data.hora==innerData.hora);
          if(result){
            return card;
          }else
            return false
        }else
          return false
      });
      !innerData.card?delete innerData['card']:null;
      return innerData
    });
    const index = this.table.daytime.findIndex(innerTurma=>innerTurma.code==turma);
    this.table.daytime[index]=JSON.parse(JSON.stringify(base));
    
  }

  private setTeacherTable(){
    this.cards.forEach((card:Card)=>{
      card.professores.forEach((professor:Professor)=>{
        const index = this.table.teachers.findIndex(data=>data.professor.id==professor.id);
        if(index <0){
          let base = new Array(HORARIO.length*5).fill('');
          card.local.forEach((local:Local)=>{
            console.log(local)
            base[local.dia+(local.hora*5)] = card.diciplina.name;
          });
          this.table.teachers.push({professor:professor,horas:base})
        }else{
          card.local.forEach((local:Local)=>{
            this.table.teachers[index].horas[local.dia+(local.hora*local.turno)] = card.diciplina.name;
          });
        }
      });
    });
  }

  private updateTables(turma:string){
    localStorage.setItem('cards', JSON.stringify(this.cards));
    this.updateHourTable(turma)
    this.publishTable();
  }

  private publishTable() {
    this.tableSubject.next(this.table);
  }

  public getSubjectTable() {
    return this.tableSubject;
  }

  public getTable() {
    return this.table;
  }

  public addTeacher(card:Card){
    const index = this.cards.findIndex(innerCard=>innerCard.id==card.id);
    if(index <0){
      this.cards.push(card)
    }else{
      this.cards[index]=card;
    }
    this.updateTables(card.turma);
  }

  public removeTeacher(){

  }

  public addTime(card:Card){
    if(card.local.length<=card.diciplina.hours/2){
      const index = this.cards.findIndex(innerCard=>innerCard.id==card.id);
      if(index <0){
        this.cards.push(card)
      }else{
        this.cards[index]=card;
      }
    }
    this.updateTables(card.turma);
  }

  public changeTime(oldItem:any,newItem:any){
    this.cards=this.cards.map((card:Card)=>{
      if(card.id==oldItem.card.id){
        card.local = card.local.map((local:Local)=>{
          if(oldItem.dia==local.dia && oldItem.turno==local.turno &&  oldItem.hora==local.hora){
            local.dia=newItem.dia;
            local.turno=newItem.turno;
            local.hora=newItem.hora;
            return local;
          }else {
            return local
          }
        });
      }else if(card.id==newItem.card.id){
        card.local = card.local.map((local:Local)=>{
          if(newItem.dia==local.dia && newItem.turno==local.turno &&  newItem.hora==local.hora){
            local.dia=oldItem.dia;
            local.turno=oldItem.turno;
            local.hora=oldItem.hora;
            return local;
          }else {
            return local
          }
        });
      }
      return card;
    })
    this.updateTables(oldItem.card.turma);
  }

  public changeEmptyTime(oldItem:any,newItem:any){
    this.cards=this.cards.map((card:Card)=>{
      if(card.id==oldItem.card.id){
        card.local = card.local.map((local:Local)=>{
          if(oldItem.dia==local.dia && oldItem.turno==local.turno &&  oldItem.hora==local.hora){
            local.dia=newItem.dia;
            local.turno=newItem.turno;
            local.hora=newItem.hora;
            return local;
          }else {
            return local
          }
        });
      };
      return card;
    })
    this.updateTables(oldItem.card.turma);
  }

  public addLocation(){

  }
}
