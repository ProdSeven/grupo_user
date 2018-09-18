import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, Alert, LoadingController, ModalController, Platform } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { BackgroundMode } from '@ionic-native/background-mode';

/**
 * Generated class for the TarefasInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:"tarefasInfo"
})
@Component({
  selector: 'page-tarefas-info',
  templateUrl: 'tarefas-info.html',
})
export class TarefasInfoPage {
  tarefa:any = null;
  id;
  tar:any = [];
  tipo = null;
  subtarefas:any = null;
  participantes = null;
  modulo = null;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private firebaseProvider: FirebaseProvider,
              private viewCtrl: ViewController,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController,
              private platform: Platform,
              private backgroundMode: BackgroundMode) {
                this.platform.registerBackButtonAction(() => {
                  this.viewCtrl.dismiss();
                });
  this.tar = this.navParams.get("tarefa");
  console.log("tar: ",this.tar);
  this.tipo = this.navParams.get("tipo");
  console.log("tipo: ",this.tipo);
  this.moduloOn();
  if (this.tipo == "tarefaC" ) {
    this.tarefaON();
  }
  if (this.tipo == "Mtarefa" ) {
    this.tarefaON2();
  }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TarefasInfoPage');
  }

  moduloOn(){
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOn("/func_perfil/"+user+"/modulos/2").on("value",(resp:any)=>{
        this.modulo = resp.val();
        console.log("modulo: ",this.modulo);
      });
    });
  }
  

  tarefaON(){
    this.firebaseProvider.refOn("geral/tarefas/"+this.tar.id).on("value",(tarefa:any)=>{
      if(tarefa.val()){
        this.tarefa = tarefa.val();
        console.log("tarefa: ",tarefa.val());
        if(tarefa.val().subtarefas){
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
            console.log("Tarefa "+this.tar.id+", nao possui subtarefas");
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
  }

  tarefaON2(){
    this.firebaseProvider.refOn("geral/tarefas/"+this.tar.idT+"/subtarefas/"+this.tar.id).on("value",(subtarefaSnap:any)=>{
      this.subtarefas = [];
      this.participantes = [];
      if(subtarefaSnap.val()){
        this.tarefa = subtarefaSnap.val();
          let subtarefa = subtarefaSnap.val();
          console.log("subtarefasSnap: ",subtarefa);
            console.log("subtarefa: ",subtarefa.titulo);
            if(subtarefa.participantes){
              console.log("subtarefas[i].participantes.length: ",subtarefa.participantes.length);
              for (let j = 0; j < subtarefa.participantes.length; j++) {
                console.log("subtarefas[i].participantes: ",subtarefa.participantes[j]);
                this.firebaseProvider.refOn("func_perfil/"+subtarefa.participantes[j]).once("value",(perfilSnap:any)=>{
                  let perfil:any = perfilSnap.val();
                  console.log("adicionou1/subtaarefa: ",perfil.nome,"/",subtarefa.titulo);
                  this.participantes.push(perfil);
                });
              }
            }else{
              this.participantes = [];
            }
          console.log("participantes: ",this.participantes);
          console.log("subtarefas: ",this.subtarefas);
          console.log("tarefa: ",this.tarefa);
      }else{
        this.subtarefas = [];
        this.tarefa = [];
        this.participantes = [];
        console.log("Subtarefa "+this.tar.id+", nao existe mais");
        this.firebaseProvider.refOff("geral/tarefas/"+this.tar.idT+"/subtarefas/"+this.tar.id);
      }
    });
  }

  delTarefa(){
    const alert: Alert = this.alertCtrl.create({
      title: "Deseja realmente deletar esta tarefa?",
      subTitle:"Não poderá recupera-la.",
      message:"se desejar apenas arquivar, pressione o botão de arquivar.",
      buttons: [
        {
          text: 'Não',
          handler: data => {
          }
        },
        {
          text: 'Sim',
          handler: data => {
            this.deletarTarefa();
          }
        }
      ]
    });
    alert.present();
  }

  pararSub(){
    let status;
    if (this.tarefa.status == "iniciada") {status = "parada"};
    if (this.tarefa.status == "parada" || this.tarefa.status == "não iniciada") {status = "iniciada"};
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.update("geral/tarefas/"+this.tar.idT+"/subtarefas/"+this.tar.id,{status:status}).then(()=>{
          console.log("Subtarefa parada ou inicada");
          if (status == "iniciada") {
            let alert = this.alertCtrl.create({
              title:"SubTarefa iniciada"
            });
            alert.present();
          }

          if (status == "parada") {
            let alert = this.alertCtrl.create({
              title:"SubTarefa parada"
            });
            alert.present();
          }
      });
    });
  }

  parar(){
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.update("geral/tarefas/"+this.tarefa.id,{parada:!this.tarefa.parada}).then(()=>{
        let idlog = this.generateUUID();
        let data = this.firebaseProvider.DataHora();
        let proc;
        if(this.tarefa.parada){proc = "Parou";}
        if(!this.tarefa.parada){proc = "Iniciou";}
        this.firebaseProvider.set("geral/logTarefas/"+idlog,{
              id:idlog,
              data:data,
              procedimento: proc + " a tarefa < "+this.tarefa.titulo+" > com o id ( "+this.tarefa.id+" )",
              user:user
        }).then(()=>{
          console.log("tarefa parada ou inicada");
          if (this.tarefa.parada) {
            let alert = this.alertCtrl.create({
              title:"Tarefa parada"
            });
            alert.present();
          }else{
            let alert = this.alertCtrl.create({
              title:"Tarefa iniciada"
            });
            alert.present();
          }
        });
      });
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

  deletarTarefa(){
    this.voltar();
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    loading.present();
    let ok = false;this.firebaseProvider.refOff("geral/tarefas/"+this.tar.id);
    this.firebaseProvider.delete("geral/tarefas/"+this.tar.id).then(()=>{
      this.firebaseProvider.delete("func_perfil/"+this.tar.idCriador+"/tarefas/"+this.tar.id).then(()=>{
        console.log("tarefa deletada de: ",this.tar.idCriador);
        console.log("this.tar: ",this.tar);
        console.log("this.subtarefas: ",this.subtarefas);
        if(this.subtarefas.length > 0){
          console.log("subtarefas.length: ",this.subtarefas.length);
        for (let i = 0; i < this.subtarefas.length; i++) {
          if(this.subtarefas[i].participantes){
            console.log("participantes.length: ",this.subtarefas[i].participantes.length);
            for (let j = 0; j < this.subtarefas[i].participantes.length; j++){
              this.firebaseProvider.delete("func_perfil/"+this.subtarefas[i].participantes[j]+"/tarefas/"+this.tar.id).then(()=>{
              console.log("tarefa "+this.tar.id+" deletada de: ",this.subtarefas[i].participantes[j]);
            });
          }}
          if(i == this.subtarefas.length-1){
            let idlog = this.generateUUID();
            let data = this.firebaseProvider.DataHora();
            this.firebaseProvider.getuser().then(user=>{
              this.firebaseProvider.set("geral/logTarefas/"+idlog,{
                    id:idlog,
                    data:data,
                    procedimento:"Deletou a tarefa < "+this.tarefa.titulo+" > com o id ( "+this.tarefa.id+" )",
                    user:user
              }).then(()=>{
                console.log("tarefa deletada com sucesso.");
                ok = true;
                loading.dismiss();
              });
            });
          }
        }
        }else{let idlog = this.generateUUID();
          let data = this.firebaseProvider.DataHora();
          this.firebaseProvider.getuser().then(user=>{
            this.firebaseProvider.set("geral/logTarefas/"+idlog,{
                  id:idlog,
                  data:data,
                  procedimento:"Deletou a tarefa < "+this.tarefa.titulo+" > com o id ( "+this.tarefa.id+" )",
                  user:user
            }).then(()=>{
              console.log("tarefa deletada com sucesso.");
              ok = true;
              loading.dismiss();
            });
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
          title:"Tarefa deletada com sucesso!"
        });
        alert.present();
        }
      });
  }

  subTarefaInfo(tarefa,tipo){
    let modal;
    tarefa.idT = this.tar.id;
    if (tipo == "Mtarefa") {
      modal = this.modalCtrl.create("tarefasInfo",{tarefa:tarefa,tipo:tipo});
    }
    if (tipo == "tarefaC") {
      modal = this.modalCtrl.create("tarefasInfo",{tarefa:tarefa,tipo:tipo});
    }
    modal.onDidDismiss(data => {
      this.platform.registerBackButtonAction(() => {
        this.viewCtrl.dismiss();
      });
    });
    modal.present();
  }

  arquivar(){
    this.voltar();
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    loading.present();
    let ok = false;
    console.log("arquivada: ",this.tarefa.arquivada);
    this.firebaseProvider.update("geral/tarefas/"+this.tar.id,{arquivada:!this.tarefa.arquivada}).then(()=>{
      let idlog = this.generateUUID();
      let data = this.firebaseProvider.DataHora();
      let proc;
      if(this.tarefa.arquivada){proc = "Arquivou";}
      if(!this.tarefa.arquivada){proc = "Desarquivou";}
      this.firebaseProvider.getuser().then(user=>{
        this.firebaseProvider.set("geral/logTarefas/"+idlog,{
              id:idlog,
              data:data,
              procedimento: proc +" a tarefa < "+this.tarefa.titulo+" > com o id ( "+this.tarefa.id+" )",
              user:user
        }).then(()=>{
          let alert;
          ok = true;
          loading.dismiss();
          if(this.tarefa.arquivada){
            alert = this.alertCtrl.create({
              title:"Tarefa arquivada com sucesso"
            });
          }else{
            alert = this.alertCtrl.create({
              title:"Tarefa desarquivada com sucesso"
            });
          }
          alert.present();
        },error=>{
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title:"Houve um erro na comunicação com o servidor",
            subTitle:"não foi possivel efetuar a alteração: "+ error,
          });
          alert.present();
        });
        loading.onDidDismiss(() => {
          let alert;
          console.log('Ok : ',ok);
          if(ok == false){
            let alert = this.alertCtrl.create({
              title:"Houve um erro na comunicação com o servidor",
              subTitle:"verifique sua internet",
            });
            alert.present();
          }
          if(ok == true){
            if(this.tarefa.arquivada){
              alert = this.alertCtrl.create({
                title:"Tarefa arquivada com sucesso"
              });
            }else{
              alert = this.alertCtrl.create({
                title:"Tarefa desarquivada com sucesso"
              });
            }
          }
        });
    });
  });
  }

  arquivarSub(){
    this.voltar();
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    loading.present();
    let ok = false;
    let status;
    if (this.tarefa.status == "arquivada") {status = "parada"}else{
      status = "arquivada";
    };
    console.log("arquivada: ",this.tarefa.arquivada);
    this.firebaseProvider.update("geral/tarefas/"+this.tar.idT+"/subtarefas/"+this.tar.id,{status:status}).then(()=>{
          let alert;
          ok = true;
          loading.dismiss();
          if (status == "arquivada") {
            alert = this.alertCtrl.create({
              title:"Subtarefa arquivada com sucesso"
            });
          }
          if (status == "parada") {
            alert = this.alertCtrl.create({
              title:"Subtarefa desarquivada com sucesso"
            });
          }
          alert.present();
        },error=>{
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title:"Houve um erro na comunicação com o servidor",
            subTitle:"não foi possivel efetuar a alteração: "+ error,
          });
          alert.present();
        });
        loading.onDidDismiss(() => {
          let alert;
          console.log('Ok : ',ok);
          if(ok == false){
            let alert = this.alertCtrl.create({
              title:"Houve um erro na comunicação com o servidor",
              subTitle:"verifique sua internet",
            });
            alert.present();
          }
          if(ok == true){
            if(this.tarefa.arquivada){
              alert = this.alertCtrl.create({
                title:"Tarefa arquivada com sucesso"
              });
            }else{
              alert = this.alertCtrl.create({
                title:"Tarefa desarquivada com sucesso"
              });
            }
          }
        });
  }

  finalizar(){
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    loading.present();
    let ok = false;
    let status;
    if(this.tarefa.status == "concluida"){status = "iniciada"}else{
      status = "concluida";
    }
    console.log("finalizada: ",this.tarefa.status);
      this.firebaseProvider.update("geral/tarefas/"+this.tar.idT+"/subtarefas/"+this.tar.id,{status:status}).then(()=>{ 
            ok = true;
            let alert;
            if(status == "concluida"){
              alert = this.alertCtrl.create({
                 title:"Subtarefa concluida com sucesso"
              });
            }else{
              alert = this.alertCtrl.create({
                title:"Subtarefa Reiniciada com sucesso"
             });
            }
            loading.dismiss();
            alert.present();
          },error=>{
            loading.dismiss();
            let alert = this.alertCtrl.create({
              title:"Houve um erro na comunicação com o servidor",
              subTitle:"não foi possivel efetuar a alteração: "+ error,
            });
            alert.present();
          });
          loading.onDidDismiss(() => {
            let alert;
            console.log('Ok : ',ok);
            if(ok == false){
              let alert = this.alertCtrl.create({
                title:"Houve um erro na comunicação com o servidor",
                subTitle:"verifique sua internet",
              });
              alert.present();
            }
            if(ok == true){
              if(this.tarefa.arquivada){
                alert = this.alertCtrl.create({
                  title:"Tarefa arquivada com sucesso"
                });
              }else{
                alert = this.alertCtrl.create({
                  title:"Tarefa desarquivada com sucesso"
                });
              }
            }
          });
  }

  editar(){
    let modal;
    this.tarefa.idT = this.tar.id;
    modal = this.modalCtrl.create("tarefasEditar",{tarefa:this.tarefa});
    modal.onDidDismiss(data => {
      this.platform.registerBackButtonAction(() => {
        this.viewCtrl.dismiss();
      });
    });
    modal.present();
  }

  voltar(){
      this.viewCtrl.dismiss();
  }

}
