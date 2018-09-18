import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';

/**
 * Generated class for the TarefasAddSubtarefaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:'add-subtarefa'
})
@Component({
  selector: 'page-tarefas-add-subtarefa',
  templateUrl: 'tarefas-add-subtarefa.html',
})
export class TarefasAddSubtarefaPage {
  
  public subtarefaForm: any; 
  subtarefa:any = [];
  usuarios = null;
  usuariosPesq = [];
  modulo;
  addPart = false;
  participantes:any = [];
  sub:any = null;
  deleteU:any = [];
  Status:any =["iniciada","parada","não iniciada","concluida","arquivada"]
  @ViewChild('myInput') myInput: ElementRef;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private formBuilder: FormBuilder,
              private viewCtrl: ViewController,
              private firebaseProvider: FirebaseProvider,
              private toastCtrl: ToastController,
              private platform: Platform) {

                this.platform.ready().then(() => {
                  this.platform.registerBackButtonAction(() => {
                    if(this.addPart == true){
                      this.modo();
                      this.usuariosPesq = [];
                    }else{
                      this.viewCtrl.dismiss();
                    }
                  })
                });
                this.usuariosON();
                this.moduloOn();
                this.subtarefaForm = this.formBuilder.group({
                  titulo: ["",
                        Validators.compose([Validators.maxLength(30), Validators.required])
                      ],
                  desc: ["",
                        Validators.compose([Validators.maxLength(300), Validators.required])
                      ],
                  dataI: ["",
                        Validators.compose([Validators.minLength(1), Validators.required])
                      ],
                  dataF: ["",
                      Validators.compose([Validators.minLength(1), Validators.required])
                    ],
                  status: ["",
                    Validators.compose([Validators.minLength(1), Validators.required])
                  ]
                });
                this.sub = this.navParams.get("sub");
                if(this.sub != undefined){
                  this.sub.idT = this.navParams.get("idT");
                  if(this.sub.participantes){
                    this.getParticipantes();
                  }
                }
                console.log("sub: ",this.sub);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TarefasAddSubtarefaPage');
  }

  usuariosON(){
    this.firebaseProvider.refOn("func_perfil/").on("value",(usuariosSnap:any)=>{
      this.firebaseProvider.TransformList(usuariosSnap).then((usuarios:any)=>{
        this.usuarios = usuarios;
      });
    });
  }

  moduloOn(refresher?:any){
    this.firebaseProvider.getuser().then(user=>{ 
      this.firebaseProvider.refOn("/func_perfil/"+user+"/modulos/1").on("value",(resp:any)=>{
        this.modulo = resp.val();
        if(refresher){refresher.complete();}
        console.log("moduloOn/adm:");
      });
    });
  }

  modo(){
    this.addPart = !this.addPart;
  }

  getParticipantes(){
    console.log("getParticipantes/add-sub:");
      console.log("participantes: ",this.sub.participantes);
      for (let i = 0; i < this.sub.participantes.length; i++) {
        this.firebaseProvider.refOn("func_perfil/"+this.sub.participantes[i]).once("value",user=>{
          this.participantes.push(user.val());
        });
      }
  }

  AddPart(participante){
  if(this.participantes.length != 0){
    for (let i = 0; i < this.participantes.length; i++) {
      console.log("participante.id / this.participantes[i].id: ",participante.id ,"/", this.participantes[i].id);
      if(participante.id == this.participantes[i].id){
        let toast = this.toastCtrl.create({
          message:"Usuário já adicionado",
          duration:2000
        });
        toast.present();
        break;
      }
      if(i == this.participantes.length-1){
        for (let j = 0; j < this.deleteU.length; j++) {
          if (this.deleteU[j] == participante.id) {
            this.deleteU.splice(j,1);
            console.log("deleteU: ",this.deleteU);
            break;
          }
        }
        console.log("participante "+participante.id+" adicionadao: ");
        this.participantes.push(participante);
        this.usuariosPesq = [];
        this.modo();
        break;
      }
    }
  }else{
    for (let j = 0; j < this.deleteU.length; j++) {
      if (this.deleteU[j] == participante.id) {
        this.deleteU.splice(j,1);
        console.log("deleteU: ",this.deleteU);
        break;
      }
    }
    this.participantes.push(participante);
    this.usuariosPesq = [];
    this.modo();
  }
  }

  voltar(){
    if (this.addPart == true) {
      this.modo();
      this.usuariosPesq = [];
    }else{
      this.viewCtrl.dismiss();
    }
  }

  resize() {
    this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
  }

  getUsers(ev: any) {

    console.log('usuarios/gusuarios', this.usuarios);
    this.usuariosPesq = this.usuarios; 
    const val = ev.target.value; 
    if(val && val.trim() != ''){ 
      this.usuariosPesq = this.usuariosPesq.filter((usuario) => {
        return (usuario.nome.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
      console.log("cautPesq: ",this.usuariosPesq);
    if(this.usuariosPesq.length == 0) {
      this.usuariosPesq = this.usuarios;
      this.usuariosPesq = this.usuariosPesq.filter((usuario) => {
        return (usuario.setor.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
    if(this.usuariosPesq.length == 0) {
      this.usuariosPesq = this.usuarios;
      this.usuariosPesq = this.usuariosPesq.filter((usuario) => {
        return (usuario.cargo.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
    if(this.usuariosPesq.length == 0) {
      this.usuariosPesq = this.usuarios;
      this.usuariosPesq = this.usuariosPesq.filter((usuario) => {
        return (usuario.email.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
    }else{
      this.usuariosPesq = [];
    }
  }
  
  criarSubTarefa(){
    console.log("sub: ",this.sub);
    if (this.subtarefaForm.valid){
      let dataFt = this.subtarefaForm.value.dataF;
      dataFt = dataFt.split("-");
      let dataF = dataFt[2]+"-"+dataFt[1]+"-"+dataFt[0];
      let dataIt = this.subtarefaForm.value.dataI;
      dataIt = dataIt.split("-");
      let dataI = dataIt[2]+"-"+dataIt[1]+"-"+dataIt[0];
      this.subtarefaForm.value.dataF = dataF;
      this.subtarefaForm.value.dataI = dataI;
      if(this.sub != undefined){
        this.subtarefaForm.value.id = this.sub.id;
      }else{
        this.subtarefaForm.value.id = this.generateUUID();
      }
      console.log("subtarefaForm: ",this.subtarefaForm.value);
      this.subtarefa = this.subtarefaForm.value;
      console.log("subtarefa: ",this.subtarefa);
      console.log("sub: ",this.sub);
      console.log("participantes: ",this.participantes);
      this.subtarefa.participantes = [];
      if(this.sub != undefined && this.sub.participantes.length != 0 && this.deleteU.length != 0){
        let subP = [];
        for (let i = 0; i < this.deleteU.length; i++) {
          for (let j = 0; j < this.sub.participantes.length; j++) {
            if (this.deleteU[i] == this.sub.participantes[j]) {
              subP.push(this.deleteU[i]);
            }
          }
          if (i == this.deleteU.length-1) {
            this.deleteU = subP;
            console.log("subP: ",subP);
            console.log("deleteU: ",this.deleteU);
            this.criSubtarefa();
          }
        }
      }else{
        this.criSubtarefa();
      }
    }else{

    }
  }

  criSubtarefa(){
      if(this.participantes.length > 0){
        for (let i = 0; i < this.participantes.length; i++) {
          this.subtarefa.participantes.push(this.participantes[i].id);
          if (i == this.participantes.length - 1) {
            if(this.sub != undefined){
              console.log("editando: ",this.deleteU);
              this.viewCtrl.dismiss({sub:this.subtarefa,deleteU:this.deleteU});
            }else{
              console.log("criando");
              this.viewCtrl.dismiss({sub:this.subtarefa});
            }
          }
        }
      }else{
        if(this.sub != undefined){
          console.log("editando: ",this.deleteU);
          this.viewCtrl.dismiss({sub:this.subtarefa,deleteU:this.deleteU});
        }else{
          console.log("criando");
          this.viewCtrl.dismiss({sub:this.subtarefa});
        }
      }
  }

  rmParticipante(part){
    this.firebaseProvider.getuser().then(user=>{
      for(let i = 0; i < this.participantes.length; i++){
        if(part == this.participantes[i]){
          this.participantes.splice(i,1);
          console.log("Item removido: ", this.participantes);
          console.log("Item removido/sub: ", part);
          if (this.sub != undefined) {
            if(this.deleteU.length > 0 ){
            for (let j = 0; j < this.deleteU.length; j++) {
              if (this.deleteU[j] == part.id) {
                break;
              }
              if (j == this.deleteU.length-1) {
                if(part.id != user){
                  this.deleteU.push(part.id);
                }
                console.log("Item removido/deleteU: ", this.deleteU);
              }
            }}else{
              if(part.id != user){
                this.deleteU.push(part.id);
              }
              console.log("Item removido/deleteU: ", this.deleteU);
            }
          }
          break;
        }
      }
    });
  }

  private generateUUID(): any {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }
}
