import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Diciplina } from 'src/app/model/disciplina.model';
import { Horario } from '../model/horario.model';
import { Card } from '../model/card.model';
import { Turma } from '../model/turma.model';
import { DICIPLINAS } from '../consts/diciplinas';
import { TURMAS } from '../consts/turmas';
import { Table } from '../model/table.model';
import { Professor } from '../model/professor.model';
import { HORARIO } from '../consts/consts';
import { PROFESSORES } from '../consts/professores';
import { SALAS } from '../consts/salas';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private turmas = TURMAS;
  private cards: Array<Card>;
  private baseTable:Array<any>;
  private baseTeacherTable:Array<any>;
  private baseRoomTable:Array<any>;
  private table:Table;
  private tableSubject: Subject<Table>;
  constructor() {
    this.tableSubject = new Subject<Table>();
    this.baseTable = [];
    this.baseRoomTable = [];
    this.table = {daytime:[],nocturnal:[],teachers:[],allTeachers:[],rooms:[]};
    this.cards = [];
   }

   public init(){
    const cards= localStorage.getItem('cards');
    if (cards && cards !== 'null' && cards !== undefined && cards !== 'undefined'&& cards && cards !== '') {
      this.cards = JSON.parse(cards);
    }
    this.getConflicts();
    this.setBaseRoomTable();
    this.setBaseHourTable();
    this.setBaseTeacherTable();
    this.setTeacherTable();

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

  private setBaseRoomTable(){
    let base:any =[];
    SALAS.forEach((sala:any)=>{
      let innerSala:any={sala:sala,horas:[]};
      innerSala.horas = HORARIO.map((hora:any)=>{
        return [];
      });
      base.push(innerSala)
    });
    this.baseRoomTable= [base,base,base,base,base]
    this.setRoomTable();        
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
          let card= this.cards.find((card:Card)=>{
            if(card.turma==turma.code){
              const result = card.horarios.some((data:Horario)=> data.dia==innerData.dia && data.turno==innerData.turno&& data.hora==innerData.hora);
              if(result){
                return card;
              }else
                return false
            }else
              return false
          });
          if(card){
            innerData.card = JSON.parse(JSON.stringify(card));
            innerData.card.conflitos =innerData.card.conflitos.filter((data:any)=>data.horario.dia == innerData.dia && data.horario.turno == innerData.turno && data.horario.hora == innerData.hora)
          }else{
            delete innerData['card'];
          }
          return innerData
        });
        return rows;
      });
      return turma;
    });
  }
  
  //Função responsável por atualizar a tabela tanto do diurno quanto do noturno, ela atualiza somente a turma que sofreu alterações
  /*
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
        let card = this.cards.find((card:Card)=>{
          if(card.turma==base.code){
            const result = card.local.some((data:Local)=> data.dia==innerData.dia && data.turno==innerData.turno&& data.hora==innerData.hora);
            if(result){
              return card;
            }else
              return false
          }else
            return false
        });
        if(card){
          innerData.card = JSON.parse(JSON.stringify(card));
          innerData.card.conflitos =innerData.card.conflitos.filter((data:any)=>data.local.dia == innerData.dia && data.local.turno == innerData.turno && data.local.hora == innerData.hora)
        }else{
          delete innerData['card'];
        }
        return innerData
      });
      return rows;
    });
    const index = this.table.daytime.findIndex(innerTurma=>innerTurma.code==turma);
    this.table.daytime[index]=JSON.parse(JSON.stringify(base));
    
  }*/

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
          card.horarios.forEach((horario:Horario)=>{
            base[horario.hora][horario.dia].push(card.diciplina.name);
          });
          this.table.teachers.push({professor:professor,horas:base})
        }else{
          card.horarios.forEach((horario:Horario)=>{
            this.table.teachers[index].horas[horario.hora][horario.dia].push(card.diciplina.name);
          });
        }
      });
    });
  }

  private setRoomTable(){
    const base = JSON.parse(JSON.stringify(this.baseRoomTable));
    this.cards.forEach((card:Card)=>{
      if(card.sala){
        card.horarios.forEach((horario:Horario)=>{
          const index = base[horario.dia].findIndex((data:any)=>data.sala.id==card.sala.id);
          base[horario.dia][index].horas[horario.hora].push(card);
        });
      }
    });
    this.table.rooms=base;
  }

  //Função responsável por criar a tabela de todos os professores
  private setAllTeacherTable(){
    const base = JSON.parse(JSON.stringify(this.baseTeacherTable));
    this.table.allTeachers = base.map((item:any)=>{
      this.cards.forEach((card:Card)=>{
        if(card.professores.some((professor:Professor)=> professor.id==item.professor.id)){
          item.diciplinas.push(
            {diciplina:card.diciplina,
              turno:card.horarios[0].turno!=2?'diurno':'noturno'
            });
        }
      });
      return item;
    });
  }

    //Função responsável por checar conflitos nas tabelas
    private getConflicts(){
      this.cards = this.cards.map((card:Card)=>{
        card.conflitos=[];
        card.professores.forEach((professor:Professor)=>{
          this.cards.forEach((innerCard:Card)=>{
            if(card.id!==innerCard.id){
              const result = innerCard.professores.some((innerProfessor:Professor)=> professor.id==innerProfessor.id);
              if(result){
                card.horarios.forEach((horario:Horario)=>{
                  const result = innerCard.horarios.some((innerHorario:Horario)=> horario.dia==innerHorario.dia && horario.turno==innerHorario.turno&& horario.hora==innerHorario.hora);
                  if(result)
                    card.conflitos.push({cardId:innerCard.id,horario:horario,type:'professor'});
                });
              }
            }
          })
        });
        if(card.sala){
          this.cards.forEach((innerCard:Card)=>{
            if(card.id!==innerCard.id && innerCard.sala){
              card.horarios.forEach((horario:Horario)=>{
                const result = innerCard.horarios.some((innerHorario:Horario)=> horario.dia==innerHorario.dia && horario.turno==innerHorario.turno&& horario.hora==innerHorario.hora);
                if(result && card.sala.id ==innerCard.sala.id)
                  card.conflitos.push({cardId:innerCard.id,horario:horario,type:'sala'});
              });
            }
          })
        }
        return card
      });
    }

  //Função responsável por iniciar a atualização das tabelas
  private updateTables(){
    this.getConflicts();
    localStorage.setItem('cards', JSON.stringify(this.cards));
    this.setRoomTable();
    this.setTeacherTable();
    this.setDaytimeTable();
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
    this.updateTables();
  }

  //Função responsável por adicionar um cartão a tabela
  public addTime(card:Card){
    if(card.horarios.length<=card.diciplina.hours/2){
      const index = this.cards.findIndex(innerCard=>innerCard.id==card.id);
      if(index <0){
        this.cards.push(card)
      }else{
        this.cards[index]=card;
      }
    }
    this.updateTables();
  }

  //Função responsável por trocar o tempo de um cartão
  public changeTime(oldItem:any,newItem:any){
    this.cards=this.cards.map((card:Card)=>{
      if(card.id==oldItem.card.id){
        card.horarios = card.horarios.map((horario:Horario)=>{
          if(oldItem.dia==horario.dia && oldItem.turno==horario.turno &&  oldItem.hora==horario.hora){
            horario.dia=newItem.dia;
            horario.turno=newItem.turno;
            horario.hora=newItem.hora;
          }
          return horario
        });
      }else if(card.id==newItem.card.id){
        card.horarios = card.horarios.map((horario:Horario)=>{
          if(newItem.dia==horario.dia && newItem.turno==horario.turno &&  newItem.hora==horario.hora){
            horario.dia=oldItem.dia;
            horario.turno=oldItem.turno;
            horario.hora=oldItem.hora;
          }
          return horario
        });
      }
      return card;
    })
    this.updateTables();
  }

  //Função responsável por trocar o tempo de um cartão com um espaço vazio
  public changeEmptyTime(oldItem:any,newItem:any){
    this.cards=this.cards.map((card:Card)=>{
      if(card.id==oldItem.card.id){
        card.horarios = card.horarios.map((horario:Horario)=>{
          if(oldItem.dia==horario.dia && oldItem.turno==horario.turno &&  oldItem.hora==horario.hora){
            horario.dia=newItem.dia;
            horario.turno=newItem.turno;
            horario.hora=newItem.hora;
          }
          return horario;
        });
      };
      return card;
    })
    this.updateTables();
  }

  public changeRoom(card:Card){
    if(card.horarios.length<=card.diciplina.hours/2){
      const index = this.cards.findIndex(innerCard=>innerCard.id==card.id);
      if(index <0){
        this.cards.push(card)
      }else{
        this.cards[index]=card;
      }
    }
    this.updateTables();
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
