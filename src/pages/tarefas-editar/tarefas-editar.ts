import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, LoadingController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';

/**
 * Generated class for the TarefasEditarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:"tarefasEditar"
})
@Component({
  selector: 'page-tarefas-editar',
  templateUrl: 'tarefas-editar.html',
})
export class TarefasEditarPage {
  signupForm:any;
  tarefa:any;
  participantes:any = null ;
  modulo;
  tar:any;
  subtarefas:any = null;
  subtarefas2:any = [];
  deleteU:any = [];
  @ViewChild('myInput') myInput: ElementRef;
  @ViewChild('Recurso') Recurso: ElementRef;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private formBuilder: FormBuilder, 
              private platform: Platform,
              private viewCtrl: ViewController,
              private loadingCtrl: LoadingController,
              private firebaseProvider: FirebaseProvider,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController) {
  this.platform.registerBackButtonAction(() => {
    this.viewCtrl.dismiss();
  });

  this.tar = this.navParams.get("tarefa");
  console.log("tar: ",this.tar);
  this.tarefaON();
  this.signupForm = this.formBuilder.group({
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
    recurso: ["",
          Validators.compose([Validators.maxLength(300), Validators.required])
      ]
  });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TarefasEditarPage');
  }

  moduloOn(){
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOn("/func_perfil/"+user+"/modulos/2").on("value",(resp:any)=>{
        this.modulo = resp.val();
        console.log("modulo: ",this.modulo);
      });
    });
  }
  
  resize() {
    this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
  }

  resizeRecurso() {
    this.Recurso.nativeElement.style.height = this.Recurso.nativeElement.scrollHeight + 'px';
  }

  tarefaON(){
    ///*
    this.firebaseProvider.refOn("geral/tarefas/"+this.tar.id).on("value",(tarefa:any)=>{
      if(tarefa.val()){
        this.tarefa = tarefa.val();
        console.log("tarefa: ",tarefa.val());
        if(tarefa.val().subtarefas){
          this.subtarefas2 = tarefa.val().subtarefas;
          this.firebaseProvider.list("geral/tarefas/"+this.tar.id+"/subtarefas").then((subtarefas:any)=>{
            console.log("subtarefasSnap: ",subtarefas);
            this.subtarefas = subtarefas;
            let part = false;
            this.participantes = [];
            for (let i = 0; i < subtarefas.length; i++) {
              console.log("subtarefa: ",subtarefas[i].titulo);
              if(subtarefas[i].participantes){
                console.log("subtarefas[i].participantes.length: ",subtarefas[i].participantes.length);
                for (let j = 0; j < subtarefas[i].participantes.length; j++) {
                  console.log("subtarefas[i].participantes: ",subtarefas[i].participantes[j]);
                  this.firebaseProvider.refOn("func_perfil/"+subtarefas[i].participantes[j]).once("value",(perfilSnap:any)=>{
                    let perfil:any = perfilSnap.val();
                    perfil.sub = [];
                    if(this.participantes.length != 0){
                    for (let k = 0; k < this.participantes.length; k++) {
                      console.log("participante: ",this.participantes[k].nome,"/",subtarefas[i].titulo);
                      if (this.participantes[k].id == perfil.id) {
                        console.log("ja tem");
                        break;
                      }
                      if(k == this.participantes.length-1){
                        console.log("adicionou2/subtaarefa: ",perfil.nome,"/",subtarefas[i].titulo);
                        part = true;
                        this.participantes.push(perfil);
                        break;
                      }
                    }
                  }else{
                    console.log("adicionou1/subtaarefa: ",perfil.nome,"/",subtarefas[i].titulo);
                    part = true;
                    this.participantes.push(perfil);
                  }
                  });
                }
              }else{
                //this.participantes = [];
              }
              if(i == subtarefas.length-1){
                if(part == false){
                  this.participantes = [];
                }
              }
            }
              console.log("participantes: ",this.participantes);
              console.log("subtarefas: ",this.subtarefas);
            });
          }else{
            this.subtarefas = [];
            this.participantes = [];
          }
      }else{
        this.subtarefas = [];
        this.tarefa = [];
        this.participantes = [];
        console.log("Tarefa "+this.tar.id+", nao existe mais");
        this.firebaseProvider.refOff("geral/tarefas/"+this.tar.id);
      }
      console.log("tarefa: ",this.tarefa);
    });
    //*/
  }

  voltar(){
    this.viewCtrl.dismiss();
  } 

  editar(){
    console.log("tarefa: ",this.tarefa);
    console.log("signupForm.value: ",this.signupForm.value);
    console.log("participantes: ",this.participantes);
    console.log("subtarefas: ",this.subtarefas);
    console.log("subtarefas2: ",this.subtarefas2);
  }

  editarTarefa(){
    if (this.signupForm.valid){
      this.voltar();
      let loading = this.loadingCtrl.create({
        spinner: 'ios',
        duration: 30000
      });
      loading.present();
      let ok = false;
      let dataFt = this.signupForm.value.dataF;
      dataFt = dataFt.split("-");
      let dataF = dataFt[2]+"-"+dataFt[1]+"-"+dataFt[0];
      let dataIt = this.signupForm.value.dataI;
      dataIt = dataIt.split("-");
      let dataI = dataIt[2]+"-"+dataIt[1]+"-"+dataIt[0];
      this.signupForm.value.dataF = dataF;
      this.signupForm.value.dataI = dataI;
      this.signupForm.value.arquivada = false;
      this.signupForm.value.parada = false;
      console.log("singupForm: ",this.signupForm.value);
      this.signupForm.value.subtarefas = this.subtarefas2;
      let id = this.tarefa.id;//= this.generateUUID();
      this.signupForm.value.id = id;
      console.log("signupForm.value: ",this.signupForm.value); 
      this.firebaseProvider.getuser().then(user=>{
        this.signupForm.value.idCriador = user;
        this.firebaseProvider.set("geral/tarefas/"+this.tarefa.id,this.signupForm.value).then(()=>{
          this.firebaseProvider.update("func_perfil/"+user+"/tarefas/"+this.tarefa.id,{id:this.tarefa.id}).then(()=>{ 
            console.log(this.subtarefas.length+" subtarefas");
            console.log(this.deleteU.length+" deleteU");
            if(this.deleteU.length > 0){
              for (let k = 0; k < this.deleteU.length; k++) {
                this.firebaseProvider.delete("func_perfil/"+this.deleteU[k]+"/tarefas/"+this.tarefa.id).then(()=>{
                  console.log("deletou tarefa do usuario ",this.deleteU[k]);
                });
                if (k == this.deleteU.length - 1) {
                  this.editSubtarefas(user).then(resp=>{
                    if(resp == true){
                      let idlog = this.generateUUID();
                      let data = this.firebaseProvider.DataHora();
                      this.firebaseProvider.set("geral/logTarefas/"+idlog,{
                            id:idlog,
                            data:data,
                            procedimento:"Editou a tarefa < "+this.signupForm.value.titulo+" > com o id ( "+this.signupForm.value.id+" )",
                            user:user
                      }).then(()=>{
                        ok = true;
                        loading.dismiss();
                      });
                    }
                  });
                }
              }
            }else{
              this.editSubtarefas(user).then(resp=>{
                if(resp == true){
                  let idlog = this.generateUUID();
                  let data = this.firebaseProvider.DataHora();
                  this.firebaseProvider.set("geral/logTarefas/"+idlog,{
                        id:idlog,
                        data:data,
                        procedimento:"Editou a tarefa < "+this.signupForm.value.titulo+" > com o id ( "+this.signupForm.value.id+" )",
                        user:user
                  }).then(()=>{
                    ok = true;
                    loading.dismiss();
                  });
                }
              });
          }
          },error=>{
            loading.dismiss();
            let alert = this.alertCtrl.create({
              title:"Houve um erro na comunicação com o servidor",
              subTitle:"não foi possivel efetuar a alteração: "+ error,
            });
            alert.present();
          });
        },error=>{
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title:"Houve um erro na comunicação com o servidor",
            subTitle:"não foi possivel efetuar a alteração: "+ error,
          });
          alert.present();
        });
      });
      loading.onDidDismiss(() => {
        console.log('Ok : ',ok);
        if(ok == false){
          let alert = this.alertCtrl.create({
            title:"Houve um erro na comunicação com o servidor",
            subTitle:"verifique sua internet",
          });
          alert.present();
        }
        if(ok == true){
          let alert = this.alertCtrl.create({
            title:"Tarefa editada com sucesso!"
          });
          alert.present();
          }
        });
      }else{
        let alert = this.alertCtrl.create({
          title:"Preencha os campos corretamente."
        });
        alert.present();
      }
}

editSubtarefas(user){
  return new Promise((resolve,reject)=>{
    if(this.subtarefas.length > 0){
      for (let i = 0; i < this.subtarefas.length; i++){
        if(this.subtarefas[i].participantes){
          if(this.subtarefas[i].participantes.length > 0){
            console.log(this.subtarefas[i].participantes.length+" participante");
            for (let j = 0; j < this.subtarefas[i].participantes.length; j++){
              console.log("participante "+j);
                this.firebaseProvider.update("func_perfil/"+this.subtarefas[i].participantes[j]+"/tarefas/"+this.tarefa.id,{id:this.tarefa.id}).then(()=>{
                  console.log("participante "+j+", id: "+this.subtarefas[i].participantes[j]);
                });
              }
          }
        }
        if(i == this.subtarefas.length - 1){
          let idlog = this.generateUUID();
          let data = this.firebaseProvider.DataHora();
          this.firebaseProvider.set("geral/logTarefas/"+idlog,{
                id:idlog,
                data:data,
                procedimento:"Editou a tarefa < "+this.signupForm.value.titulo+" > com o id ( "+this.signupForm.value.id+" )",
                user:user
          }).then(()=>{
            resolve(true);
          });
        }
      }
    }else{
      let idlog = this.generateUUID();
      let data = this.firebaseProvider.DataHora();
      this.firebaseProvider.set("geral/logTarefas/"+idlog,{
            id:idlog,
            data:data,
            procedimento:"Editou a tarefa < "+this.signupForm.value.titulo+" > com o id ( "+this.signupForm.value.id+" )",
            user:user
      }).then(()=>{
        resolve(true);
      });
    }
  });
}

addSubtarefa(){
  let modal = this.modalCtrl.create("add-subtarefa");
    this.platform.registerBackButtonAction(() => {
      this.viewCtrl.dismiss();
    });
    modal.onDidDismiss(data => {
      this.platform.registerBackButtonAction(() => {
        this.viewCtrl.dismiss();
      });
      console.log("onDidDismiss: ",data);
      if (data == undefined) {
        console.log("data indefinida");
      }else{
        if(data.deleteU != undefined){
          console.log("data.deleteU: ",data.deleteU);
        }
        let id = data.sub.id;
        id = ""+id+"";
        this.subtarefas2[id] = data.sub;
        console.log("subtarefas: ",this.subtarefas2);
        this.subtarefas.push(data.sub);
      }
    });
    modal.present();
}

EditarSubtarefa(sub){
  let modal;
  for (let i = 0; i < this.subtarefas.length; i++) {
    if (this.subtarefas[i].id == sub.id) {
      if (this.subtarefas[i].participantes) {
        console.log("this.subtarefas[i].participantes: ",this.subtarefas[i].participantes);
        sub.participantes = this.subtarefas[i].participantes;
      }else{
        sub.participantes = [];
      }
        console.log("sub/editartarefa: ",sub);
        modal = this.modalCtrl.create("add-subtarefa",{sub:sub,idT:this.tarefa.id});
          this.platform.registerBackButtonAction(() => {
            this.viewCtrl.dismiss();
          });
        modal.present();
        break;
    }
  }
    modal.onDidDismiss(data => {
      this.platform.registerBackButtonAction(() => {
        this.viewCtrl.dismiss();
      });
      console.log("onDidDismiss: ",data);
      if (data == undefined) {
        console.log("data indefinida");
      }else{
        console.log("data.deleteU: ",data.deleteU);
        if(data.deleteU != undefined){
          this.deleteU = data.deleteU;
          console.log("deleteU: ",this.deleteU);
          console.log("data.deleteU: ",data.deleteU);
        }
        let id = data.sub.id;
        id = ""+id+"";
        this.subtarefas2[id] = data.sub;
        for (let i = 0; i < this.subtarefas.length; i++) {
          if (this.subtarefas[i].id == data.sub.id) {
            this.subtarefas[i] = data.sub;
            break;
          }
        }
        console.log("subtarefas2: ",this.subtarefas2);
        console.log("subtarefas: ",this.subtarefas);
      }
    });
}

rmSubtarefa(sub){
  
  this.firebaseProvider.getuser().then(user=>{
      for(let i = 0; i < this.subtarefas.length; i++){
        if(sub == this.subtarefas[i]){
          this.subtarefas.splice(i,1);
          delete this.subtarefas2[""+sub.id+""];
          console.log("Item subtarefas2: ", this.subtarefas2);
          console.log("Item removido: ", this.subtarefas);
          console.log("Item removido/sub: ", sub);
          break;
        }
      }
      console.log("Item removido/deleteU: ", this.deleteU);
      if(this.deleteU.length > 0 ){
        for (let k = 0; k < sub.participantes.length; k++) {
          for (let j = 0; j < this.deleteU.length; j++) {
            if (this.deleteU[j] == sub.participantes[k]) {
              break;
            }
            if (j == this.deleteU.length-1) {
              if(sub.participantes[k] != user){
                this.deleteU.push(sub.participantes[k]);
              }
              console.log("Item removido/deleteU: ", this.deleteU);
            }
          }
        }
      }else{
        for (let k = 0; k < sub.participantes.length; k++) {
              if(sub.participantes[k] != user){
                this.deleteU.push(sub.participantes[k]);
              }
              console.log("Item removido/deleteU2: ", this.deleteU);
        }
        console.log("Item removido/deleteU: ", this.deleteU);
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
