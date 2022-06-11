import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Sala } from '../model/sala.model';
import { Diciplina } from '../model/disciplina.model';
import { Professor } from '../model/professor.model';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private TURMAS:any[];
  private SALAS:Sala[];
  private DICIPLINAS:Diciplina[];
  private PROFESSORES:Professor[];
  constructor(
    private httpClient: HttpClient
    ) { }

  public init(){
    return new Promise<any[]>((resolve, reject)=>{
      this.httpClient.get("assets/turmas.JSON").subscribe((data:any) =>{
        this.TURMAS=data;
      })
      this.httpClient.get("assets/diciplinas.JSON").subscribe((data:any) =>{
        this.TURMAS=data;
      })
      this.httpClient.get("assets/salas.JSON").subscribe((data:any) =>{
        this.TURMAS=data;
      })
      this.httpClient.get("assets/professores.JSON").subscribe((data:any) =>{
        this.TURMAS=data;
      })
      resolve([])
    })
  }

  public getTurmas() {
    return this.TURMAS;
  }
  public getSalas() {
    return this.SALAS;
  }
  public getDiciplinas() {
    return this.DICIPLINAS;
  }
  public getProfessores() {
    return this.PROFESSORES;
  }
}
