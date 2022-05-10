import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Diciplina } from 'src/app/model/disciplina.model';
import { Local } from '../model/local.model';
import { Card } from '../model/card.model';
import { Turma } from '../model/turma.model';
import { DICIPLINAS } from '../consts/diciplinas';
import { TURMAS } from '../consts/turmas';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private diciplinas = DICIPLINAS;
  private turmas = TURMAS;
  private cards: Array<Card>;
  private baseTable:any;
  private table:Array<Turma>;
  private tableSubject: Subject<any[]>;
  constructor() {
    this.tableSubject = new Subject<any[]>();
    this.baseTable = [];
    this.table = [];
    this.cards = [];
   }

   public init(){
    const cards= localStorage.getItem('cards');
    if (cards && cards !== 'null' && cards !== undefined && cards !== 'undefined'&& cards && cards !== '') {
      this.cards = JSON.parse(cards);
    }
    this.setBaseHourTable();
    this.setHourTable();
  }

  private setBaseHourTable(){
    this.turmas.forEach(turma => {
      turma.shift.forEach((shift:string)=>{
        let i =0;
        while (i < turma.days*2) {
          turma.rows.push({
            dia: i% turma.days,
            turno:shift,
            hora:i< turma.days?'AB':'CD'
          })
          i++;
        }
      })
      this.diciplinas.forEach(diciplina => {
        if(diciplina.semester===turma.semester)
          turma.card.push(new Card(diciplina,turma.code,))
      });
      this.baseTable.push(turma); 
    });
  }

  private setHourTable(){
    const base = JSON.parse(JSON.stringify(this.baseTable));
    this.table = base.map((turma:Turma)=>{
      turma.card =turma.card.map((innerCard: Card)=>{
        let card = this.cards.find((card:Card)=>card.turma==turma.code &&innerCard.diciplina.code==card.diciplina.code);
        if(card)
          return  JSON.parse(JSON.stringify(card));
        else
          return innerCard
      });
      
      turma.rows =turma.rows.map((innerData: Local)=>{
        let card = this.cards.find((card:Card)=>{
          if(card.turma==turma.code){
            const result = card.local.some((data:Local)=> data.dia==innerData.dia && data.turno==innerData.turno&& data.hora==innerData.hora);
            if(result){
              return card;
            }else
              return false
          }else
            return false
        });
        if(card)
          return JSON.parse(JSON.stringify(card));
        else
          return innerData
      });
      return turma;
    });

  }

  private updateTables(){
    localStorage.setItem('cards', JSON.stringify(this.cards));
    this.setHourTable();
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
    const index = this.cards.findIndex(innerCard=>{
      if(innerCard.turma==card.turma&&innerCard.diciplina.code==card.diciplina.code)
        return true;
      else
        return false;
    });
    
    if(index <0){
      this.cards.push(card)
    }else{
      this.cards[index]=card;
    }
    this.updateTables();
  }

  public removeTeacher(){

  }

  public addTime(card:Card){
    if(card.local.length<=card.diciplina.hours/2){
      const index = this.cards.findIndex(innerCard=>{
        if(innerCard.turma==card.turma&&innerCard.diciplina.code==card.diciplina.code)
          return true;
        else
          return false;
      });
      if(index <0){
        this.cards.push(card)
      }else{
        this.cards[index]=card;
      }
    }
    this.updateTables();
  }

  public changeTime(oldCard:Card,newCard:Card){
    this.cards=this.cards.map((card:Card)=>{
      if(card.turma==oldCard.turma&&card.diciplina.code==oldCard.diciplina.code){
        card.local = card.local.map((local:Local)=>{
          if(oldCard.local[0].dia==local.dia && oldCard.local[0].turno==local.turno && oldCard.local[0].hora==local.hora){
            return newCard.local[0];
          }else
            return local;
        });
      }else if(card.turma==newCard.turma&&card.diciplina.code==newCard.diciplina.code){
        card.local = card.local.map((local:Local)=>{
          if(newCard.local[0].dia==local.dia && newCard.local[0].turno==local.turno&& newCard.local[0].hora==local.hora){
            return oldCard.local[0];
          }else
            return local;
        });
      }
      return card;
    })
    this.updateTables();
  }

  public changeEmptyTime(card:Card,date:Local){
    this.cards=this.cards.map((innerCard:Card)=>{
      if(innerCard.turma==card.turma&&innerCard.diciplina.code==card.diciplina.code){
        innerCard.local = innerCard.local.map((local:Local)=>{
          if(card.local[0].dia==local.dia && card.local[0].turno==local.turno && card.local[0].hora==local.hora){
            return date;
          }else
            return local;
        });
      }
      return innerCard;
    });
    this.updateTables();
  }

  public addLocation(){

  }
}
