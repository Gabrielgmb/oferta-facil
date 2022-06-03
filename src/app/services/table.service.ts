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
import { PROFESSORES } from '../consts/professores'

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private turmas = TURMAS;
  private cards: Array<Card>;
  private baseTable:Array<any>;
  private baseTeacherTable:Array<any>;
  private table:Table;
  private tableSubject: Subject<Table>;
  constructor() {
    this.tableSubject = new Subject<Table>();
    this.baseTable = [];
    this.table = {daytime:[],nocturnal:[],teachers:[],allTeachers:[]};
    this.cards = [];
   }

   public init(){
    const cards= localStorage.getItem('cards');
    if (cards && cards !== 'null' && cards !== undefined && cards !== 'undefined'&& cards && cards !== '') {
      this.cards = JSON.parse(cards);
    }
    this.setBaseHourTable();
    this.setBaseTeacherTable();
    this.setTeacherTable();
    //this.conflict();
  }

  //Função que cria a tabela base do diurno e noturno, é usada para definir as posições dos cartões
  private setBaseHourTable(){
    this.turmas.forEach(turma => {
      turma.shift.forEach((shift:number)=>{
        let i =0;
        let rows:any = [[],[]]
        while (i < 10) {
          rows[Math.floor(i/5)].push({
            dia: i% 5,
            turno:shift,
            hora: (shift*2) + Math.floor(i/5)
          })
          i++;
        }
        turma.rows = turma.rows.concat(rows) 
      })
      DICIPLINAS.forEach(diciplina => {
        if(diciplina.semester===turma.semester)
          turma.card.push(new Card(diciplina,turma.code))
      });
      this.baseTable.push(turma);
    });
    this.setDaytimeTable();
  }

  //Função que cria a tabela base dos professores
  private setBaseTeacherTable(){
    this.baseTeacherTable =PROFESSORES.map((professor:Professor)=>{
      return {professor:professor,diciplinas:[]}
    });
    this.setAllTeacherTable();
  }

  //Função que cria a tabela a oferta de turmas do diurno
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

      turma.rows =turma.rows.map((rows: any)=>{
        rows =rows.map((innerData: any)=>{
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
        return rows;
      });
      return turma;
    });
  }

  //Função responsável por atualizar a tabela tanto do diurno quanto do noturno, ela atualiza somente a turma que sofreu alterações
  private updateHourTable(turma:string){
    let base = JSON.parse(JSON.stringify(this.baseTable.find((innerTurma:Turma)=>innerTurma.code==turma)));
    base.card =base.card.map((innerCard: Card)=>{
      let card = this.cards.find((card:Card)=>card.id==innerCard.id);
      if(card)
        return  JSON.parse(JSON.stringify(card));
      else
        return innerCard
    });
    
    base.rows =base.rows.map((rows: any)=>{
      rows =rows.map((innerData: any)=>{
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
      return rows;
    });
    const index = this.table.daytime.findIndex(innerTurma=>innerTurma.code==turma);
    this.table.daytime[index]=JSON.parse(JSON.stringify(base));
    
  }

  //Função responsável por criar a tabela de horário de professores
  private setTeacherTable(){
    this.table.teachers=[];
    this.cards.forEach((card:Card)=>{
      card.professores.forEach((professor:Professor)=>{
        const index = this.table.teachers.findIndex(data=>data.professor.id==professor.id);
        if(index <0){
          let base:any = [];
          HORARIO.forEach((horas:any)=>{
            base.push([[],[],[],[],[]])
          });
          card.local.forEach((local:Local)=>{
            base[local.hora][local.dia].push(card.diciplina.name);
          });
          this.table.teachers.push({professor:professor,horas:base})
        }else{
          card.local.forEach((local:Local)=>{
            this.table.teachers[index].horas[local.hora][local.dia].push(card.diciplina.name);
          });
        }
      });
    });
  }

    //Função responsável por checar conflitos nas tabelas
    private conflict(){
      let base = JSON.parse(JSON.stringify(this.cards));
      while (base.length > 0) {
        let card = base.shift();
        base.forEach((baseCard:Card)=>{
          card.professores.forEach((professor:Professor)=>{
            card.professores.forEach((professor:Professor)=>{

            });
          });
        });
      }
      /*
      this.cards.forEach((card:Card)=>{
        card.professores.forEach((professor:Professor)=>{
          const index = this.table.teachers.findIndex(data=>data.professor.id==professor.id);
          if(index <0){
            let base:any = [];
            HORARIO.forEach((horas:any)=>{
              base.push([[],[],[],[],[]])
            });
            card.local.forEach((local:Local)=>{
              base[local.hora][local.dia].push(card.diciplina.name);
            });
            this.table.teachers.push({professor:professor,horas:base})
          }else{
            card.local.forEach((local:Local)=>{
              this.table.teachers[index].horas[local.hora][local.dia].push(card.diciplina.name);
            });
          }
        });
      });*/
    }

  //Função responsável por criar a tabela de todos os professores
  private setAllTeacherTable(){
    const base = JSON.parse(JSON.stringify(this.baseTeacherTable));
    this.table.allTeachers = base.map((item:any)=>{
      this.cards.forEach((card:Card)=>{
        if(card.professores.some((professor:Professor)=> professor.id==item.professor.id)){
          item.diciplinas.push(
            {diciplina:card.diciplina,
              turno:card.local[0].turno!=2?'diurno':'noturno'
            });
        }
      });
      return item;
    });
  }

  //Função responsável por iniciar a atualização das tabelas
  private updateTables(card:Card){
    localStorage.setItem('cards', JSON.stringify(this.cards));
    this.setTeacherTable();
    this.updateHourTable(card.turma);
    this.setAllTeacherTable();
    this.publishTable();
  }

  //Função responsável por alterar os professores de um cartão, sendo adicionando ou excluindo ele
  public changeTeacher(card:Card){
    const index = this.cards.findIndex(innerCard=>innerCard.id==card.id);
    if(index <0){
      this.cards.push(card)
    }else{
      this.cards[index]=card;
    }
    this.updateTables(card);
  }

  //Função responsável por adicionar um cartão a tabela
  public addTime(card:Card){
    if(card.local.length<=card.diciplina.hours/2){
      const index = this.cards.findIndex(innerCard=>innerCard.id==card.id);
      if(index <0){
        this.cards.push(card)
      }else{
        this.cards[index]=card;
      }
    }
    this.updateTables(card);
  }

  //Função responsável por trocar o tempo de um cartão
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
    this.updateTables(oldItem.card);
  }

  //Função responsável por trocar o tempo de um cartão com um espaço vazio
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
    this.updateTables(oldItem.card);
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
