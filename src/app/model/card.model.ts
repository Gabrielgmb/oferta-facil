import { Horario } from "./horario.model";
import { Diciplina } from "./disciplina.model";
import { Professor } from "./professor.model";
import { Sala } from "./sala.model";
export class Card{
    id:string;
    diciplina:Diciplina;
    professores:Array<Professor>;
    horarios:Array<Horario>;
    turma:string;
    conflitos:Array<any>;
    sala:Sala;

    constructor(diciplina: Diciplina, turma:string){
        this.id = turma+diciplina.code;
        this.diciplina = diciplina;
        this.turma = turma;
        this.professores =[];
        this.horarios = [];
        this.conflitos = [];
    }
}