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
  private table:Array<Turma>;
  private tableSubject: Subject<any[]>;
  constructor() {
    this.tableSubject = new Subject<any[]>();
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
    this.table =[];
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
          turma.card.push(new Card(diciplina,turma.code))
      });
      this.table.push(turma); 
    });
  }

  private setHourTable(){
    this.cards.forEach((card:Card)=>{
      
      const index = this.table.findIndex(turma=>{
        if(turma.code==card.turma)
          return true;
        else
          return false;
      });
      
      const newCards =this.table[index].card.map((innerCard: Card)=>{
        if(innerCard.diciplina.code==card.diciplina.code)
          return  Object.assign({}, card);
        else
          return innerCard;
      });
      this.table[index].card=newCards;

      const newHours =this.table[index].rows.map((innerData: Local)=>{
        const result = card.local.some((data:Local)=> data.dia==innerData.dia && data.turno==innerData.turno&& data.hora==innerData.hora);
        if(result)
          return Object.assign({}, card);
        else
          return innerData;
      });
      this.table[index].rows=newHours;

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
    if(card.local.length<card.diciplina.hours/2){
      console.log('entrou')
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

  public changeTime(){

  }

  public addLocation(){

  }
}
