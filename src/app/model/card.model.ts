import { Local } from "./local.model";
import { Diciplina } from "./disciplina.model";
import { Professor } from "./professor.model";
export class Card{
    id:string;
    diciplina:Diciplina;
    professores:Array<Professor>;
    local:Array<Local>;
    turma:string;

    constructor(diciplina: Diciplina, turma:string){
        this.id = turma+diciplina.code;
        this.diciplina = diciplina;
        this.turma = turma;
        this.professores =[];
        this.local = []
    }
}