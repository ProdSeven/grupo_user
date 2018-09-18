import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, ViewController, AlertController } from 'ionic-angular';
import { BackgroundMode } from '@ionic-native/background-mode';
import { FirebaseProvider } from '../../providers/firebase/firebase';
/**
 * Generated class for the TarefasPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:"tarefas"
})
@Component({
  selector: 'page-tarefas',
  templateUrl: 'tarefas.html',
})
export class TarefasPage {
  filtro = "Todos";
  Mtarefas:any = null;
  tarefasC:any = null;
  arquivadas:any = null;
  arquivadasPesq:any = []; 
  MtarefasPesq:any = [];
  tarefasCPesq:any= [];
  TarefasPesq:any = [];
  modulo;
  tarefasUser = [];
  inicial = 0;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private modalCtrl: ModalController,
              private platform: Platform,
              private viewCtrl: ViewController,
              private backgroundMode: BackgroundMode,
              private alertCtrl: AlertController,
              private firebaseProvider: FirebaseProvider) {
                this.platform.registerBackButtonAction(() => {
                  if(!this.viewCtrl.enableBack()) { 
                    this.backgroundMode.moveToBackground();
                  }else{
                      this.navCtrl.pop();
                  } 
                });
                this.tarefasUserON();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TarefasPage');
  }

  moduloOn(){
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOn("/func_perfil/"+user+"/modulos/2").on("value",(resp:any)=>{
        this.modulo = resp.val();
        console.log("modulo: ",this.modulo);
      });
    });
  }

  tarefasUserON(){
    console.log("tarefasUserON/tarefas");
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOn("func_perfil/"+user+"/tarefas").on("value",(tarefasSnap:any)=>{
        if(tarefasSnap.val()){
          this.firebaseProvider.TransformList(tarefasSnap).then((tarefasuser:any)=>{
            this.tarefasUser = tarefasuser;
            console.log("tarefasUser: ",this.tarefasUser);
              this.tarefas();
          });
        }else{
          this.tarefasC = [];
          this.Mtarefas = [];
          this.arquivadas = [];
        }
      });
    });
  }

  tarefas(){
    console.log("tarefas/tarefas");
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOn("geral/tarefas/").once("value",(tarefaSnap:any)=>{
          this.tarefasC = [];
          this.Mtarefas = [];
          this.arquivadas = [];
          if(tarefaSnap.val()){
            let tarefa = tarefaSnap.val();
            console.log("tarefas: ",tarefa);
            for (let i = 0; i < this.tarefasUser.length; i++) {
              console.log("tarefa => ",tarefa[this.tarefasUser[i].id]);
              if(tarefa[this.tarefasUser[i].id]){
                if(tarefa[this.tarefasUser[i].id].idCriador == user){
                  if(tarefa[this.tarefasUser[i].id].arquivada == true){
                    this.arquivadas.push(tarefa[this.tarefasUser[i].id]);
                  }else{
                    this.tarefasC.push(tarefa[this.tarefasUser[i].id]);
                    console.log("tarefasC: ",this.tarefasC);
                  }
                }
                if(tarefa[this.tarefasUser[i].id].subtarefas && tarefa[this.tarefasUser[i].id].arquivada == false){
                  console.log("tarefa.subtarefas: ",tarefa[this.tarefasUser[i].id].subtarefas);
                  this.firebaseProvider.list("geral/tarefas/"+tarefa[this.tarefasUser[i].id].id+"/subtarefas").then((subtarefas:any)=>{
                    console.log("subtarefas: ",subtarefas);
                    for (let k = 0; k < subtarefas.length; k++) {
                      if(subtarefas[k].participantes){
                      for (let j = 0; j < subtarefas[k].participantes.length; j++) {
                        if(subtarefas[k].participantes[j] == user){
                          let sub = subtarefas[k];
                          sub.idT = tarefa[this.tarefasUser[i].id].id;
                          this.Mtarefas.push(sub);
                        }
                      }
                      }
                    }
                    console.log("Mtarefas: ",this.Mtarefas);
                  });
                }
              }
              if (i == this.tarefasUser.length-1) {
                if(this.inicial == 0){
                  this.inicial = 1
                  this.tarefasOn();
                }
              }
            }
        }else{
          this.tarefasC = [];
          this.Mtarefas = [];
          this.arquivadas = [];
        }
      });
    });
    }

  tarefasOn(){
    console.log("tarefasOn/tarefas");
  this.firebaseProvider.getuser().then(user=>{
    this.firebaseProvider.refOn("geral/tarefas/").on("value",(tarefaSnap:any)=>{
        this.tarefasC = [];
        this.Mtarefas = [];
        this.arquivadas = [];
        if(tarefaSnap.val()){
          let tarefa = tarefaSnap.val();
          console.log("tarefasON: ",tarefa);
          for (let i = 0; i < this.tarefasUser.length; i++) {
            console.log("tarefa => ",tarefa[this.tarefasUser[i].id]);
            if(tarefa[this.tarefasUser[i].id]){
              if(tarefa[this.tarefasUser[i].id].idCriador == user){
                if(tarefa[this.tarefasUser[i].id].arquivada == true){
                  this.arquivadas.push(tarefa[this.tarefasUser[i].id]);
                }else{
                  this.tarefasC.push(tarefa[this.tarefasUser[i].id]);
                  console.log("tarefasC: ",this.tarefasC);
                }
              }
              
              if(tarefa[this.tarefasUser[i].id].subtarefas && tarefa[this.tarefasUser[i].id].arquivada == false){
                console.log("tarefa.subtarefas: ",tarefa[this.tarefasUser[i].id].subtarefas);
                this.firebaseProvider.list("geral/tarefas/"+tarefa[this.tarefasUser[i].id].id+"/subtarefas").then((subtarefas:any)=>{
                  console.log("subtarefas: ",subtarefas);
                  for (let k = 0; k < subtarefas.length; k++) {
                    if(subtarefas[k].participantes){
                    for (let j = 0; j < subtarefas[k].participantes.length; j++) {
                      if(subtarefas[k].participantes[j] == user){
                        let sub = subtarefas[k];
                        sub.idT = tarefa[this.tarefasUser[i].id].id;
                        sub.parada = tarefa[this.tarefasUser[i].id].parada;
                        this.Mtarefas.push(sub);
                      }
                    }
                    }
                  }
                });
              }
            }
          }
        }else{
          this.tarefasC = [];
          this.Mtarefas = [];
          this.arquivadas = [];
        }
    });
  });
  }

  add(){
    console.log("filtro e filtros: ", this.filtro);
    console.log('ionViewDidLoad TarefasPage');
      let modal = this.modalCtrl.create("tarefas-add");
      modal.onDidDismiss(data => {
        this.platform.registerBackButtonAction(() => {
          if(!this.viewCtrl.enableBack()) { 
            this.backgroundMode.moveToBackground();
          }else{
              this.navCtrl.pop();
          } 
        });
      });
      modal.present();
  }

  getTarefas(ev: any) {
    this.MtarefasPesq = this.Mtarefas;
    this.tarefasCPesq = this.tarefasC; 
    this.arquivadasPesq = this.arquivadas;
    const val = ev.target.value; 
    if(val && val.trim() != ''){ 
      this.MtarefasPesq = this.MtarefasPesq.filter((usuario) => {
        return (usuario.titulo.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
        console.log("MtarefasPesq: ",this.MtarefasPesq);
      this.tarefasCPesq = this.tarefasCPesq.filter((usuario) => {
        return (usuario.titulo.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
        console.log("tarefasCPesq: ",this.tarefasCPesq);
      this.arquivadasPesq = this.arquivadasPesq.filter((usuario) => {
        return (usuario.titulo.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
        console.log("arquivadasPesq: ",this.arquivadasPesq);
    }else{
      this.MtarefasPesq = [];
      this.tarefasCPesq = [];
      this.arquivadasPesq = [];
    }
  }

  tarefaInfo(tarefa,tipo){
    let modal;
    console.log("tarefa/tarefaInfo: ",tarefa);
    if (tipo == "Mtarefa") {
      modal = this.modalCtrl.create("tarefasInfo",{tarefa:tarefa,tipo:tipo});
    }
    if (tipo == "tarefaC") {
      modal = this.modalCtrl.create("tarefasInfo",{tarefa:tarefa,tipo:tipo});
    }
    this.platform.registerBackButtonAction(() => {
      this.viewCtrl.dismiss();
    });
    modal.onDidDismiss(data => {
      this.platform.registerBackButtonAction(() => {
        if(!this.viewCtrl.enableBack()) { 
          this.backgroundMode.moveToBackground();
        }else{
            this.navCtrl.pop();
        } 
      });
    });
    modal.present();

  }

  Filtro() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Filtro');

    alert.addInput({
      type: 'radio',
      label: 'Todos',
      value: 'Todos',
      checked: (this.filtro == "Todos")
    });

    alert.addInput({
      type: 'radio',
      label: 'Minhas tarefas',
      value: 'Minhas tarefas',
      checked: (this.filtro == "Minhas tarefas")
    });

    alert.addInput({
      type: 'radio',
      label: 'Tarefas criadas',
      value: 'Tarefas criadas',
      checked: (this.filtro == "Tarefas criadas")
    });

    alert.addInput({
      type: 'radio',
      label: 'Arquivadas',
      value: 'Arquivadas',
      checked: (this.filtro == "Arquivadas")
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.filtro = data;
      }
    });
    alert.present();
  }

}
