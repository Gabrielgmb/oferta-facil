import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Diciplina } from 'src/app/model/disciplina.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  teste=[
    {name:'História do Design',disabled:false,hours:0},
    {name:'Programação I',disabled:false,hours:0},
    {name:'Introdução a Sistemas e Mídias Digitais',disabled:false,hours:0},
    {name:'Autoração Multimídia I',disabled:false,hours:0},
    {name:'Desenho I',disabled:false,hours:0}]
  private table:Array<any>;
  private tableSubject: Subject<any[]>;

  constructor() {
    this.tableSubject = new Subject<any[]>();
    this.table = [];
   }

   public init(){
    const table= localStorage.getItem('table');
    if (table && table !== 'null' && table !== undefined && table !== 'undefined'&& table && table !== '') {
        this.table = JSON.parse(table);
        this.publishTable();
    }else{
      this.setTable();
    }
  }

  private setTable() {
    this.table =[
      {
        id:1,
        title:'1º Semestre',
        disciplinas:this.teste,
        sections:[
          {
            id:1,
            name:'Turma A',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            id:2,
            name:'Turma B',
            rows: new Array(10).fill(new Diciplina())
          },
        ],
      },
      {
        id:2,
        title:'3º Semestre',
        disciplinas:this.teste,
        sections:[
          {
            id:3,
            name:'Turma A',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            id:4,
            name:'Turma B',
            rows: new Array(10).fill(new Diciplina())
          },
        ],
      }
      
    ];
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
}
