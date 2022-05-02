import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Diciplina } from 'src/app/model/disciplina.model';
import { DICIPLINAS } from 'src/app/consts/diciplinas';
import { NumberSymbol } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private diciplinas = DICIPLINAS;
  private table:Array<any>;
  private tableSubject: Subject<any[]>;
  private simpleTable:Array<Diciplina>;
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
      //this.simpleTable = new Array(180).fill(new Diciplina());
      //console.log(this.simpleTable)
      this.setTable();
    }
  }

  private setTable() {
    this.table =[
      {
        title:'1º Semestre',
        disciplinas:[],
        sections:[
          {
            name:'Turma A',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Turma B',
            rows: new Array(10).fill(new Diciplina())
          },
        ],
      },    
      {
        title:'2º Semestre',
        disciplinas:[],
        sections:[
          {
            name:'Turma A',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Turma B',
            rows: new Array(10).fill(new Diciplina())
          },
        ],
      }, 
      {
        title:'3º Semestre',
        disciplinas:[],
        sections:[
          {
            name:'Turma A',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Turma B',
            rows: new Array(10).fill(new Diciplina())
          },
        ],
      }, 
      {
        title:'4º Semestre',
        disciplinas:[],
        sections:[
          {
            name:'Turma A',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Turma B',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Trilha Design Digital',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Trilha Desenvolvimento de Sistemas Web',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Trilha Animação e Audiovisual',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Trilha Jogos',
            rows: new Array(10).fill(new Diciplina())
          },
        ],
      }, 
      {
        title:'5º Semestre',
        disciplinas:[],
        sections:[
          {
            name:'Turma A',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Turma B',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Trilha Design Digital',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Trilha Desenvolvimento de Sistemas Web',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Trilha Animação e Audiovisual',
            rows: new Array(10).fill(new Diciplina())
          },
          {
            name:'Trilha Jogos',
            rows: new Array(10).fill(new Diciplina())
          },
        ],
      }, 
    ];
    this.setDisciplinas();
    this.publishTable();
  }

  private setDisciplinas(){
    this.diciplinas.forEach(diciplina => {
      this.table[diciplina.semester-1].disciplinas.push(diciplina)
    });
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

  public addDiciplina(i:number,j:number,y:number,diciplina:Diciplina){
    const counts:any = {};
    this.table[i].sections[j].rows.forEach((item:Diciplina)=>{ 
      counts[item.code] = (counts[item.code] || 0) + 1; 
    });
    console.log(counts)
    if(Object.keys(this.table[i].sections[j].rows[y]).length === 0){
      if(counts[diciplina.code]<2 || !counts[diciplina.code])
        this.table[i].sections[j].rows[y]=diciplina;
    }

  }
}
