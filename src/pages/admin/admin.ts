import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, ViewController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { CautelaPage } from '../cautela/cautela';
import { BackgroundMode } from '@ionic-native/background-mode';
import { HomePage } from '../home/home';
/**
 * Generated class for the AdminPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:"admin"
})
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html',
})
export class AdminPage {
  cautelas = [];
  cautPesq = [];
  cautelas_ap = [];
  cautelas_pa = [];
  modulo:any = [];
  caut = "caut_pa";
  user;
  caut_pa_noti = 0;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private firebaseProvider: FirebaseProvider,
              private modalCtrl: ModalController,
              private platform: Platform,
              private backgroundMode: BackgroundMode,
              private viewCtrl: ViewController){

  }

  ionViewDidLoad() {
    this.moduloOn();
    this.cautelasOn();
    this.cautelas_apOn();
    this.firebaseProvider.getuser().then(user=>{
      this.cautelas_paOn(user);
      this.user = user;
    });
    console.log('ionViewDidLoad AdminPage');
  }

  cautelasOn(refresher?:any){
    this.firebaseProvider.refOn("/administrativo/cautelas").on("value",(resp:any)=>{
      let result = resp;
      this.cautelas = [];
      result.forEach(element => { 
        //console.log("key: ", element.key); 
        let elemento = element.val();
        //console.log("cautela add/cautelasOn: ", elemento); 
        this.firebaseProvider.list("/administrativo/cautelas/"+elemento.id+"/aprovacao/").then((list:any)=>{
          //console.log("aprovacoes/list: ", list);
          let aceito = 0;
          let recusado = 0;
          let cont = 0;
          for (let i = 0; i < list.length; i++) {
            console.log("aprovado:",list[i].aprovado);
              if(list[i].aprovado != "wait"){
                cont++;
                if(list[i].aprovado == "reuniao"){
                  elemento.status = "primary";
                  this.cautelas.push(elemento);
                  break;
                }else if(list[i].aprovado == true || list[i].aprovado == "atencao"){
                  aceito++;
                }else if(list[i].aprovado == false){
                  recusado++;
                }
              if(i == list.length-1){ 
                if(cont == list.length){
                  if(aceito < recusado){
                    elemento.status = "danger";
                    this.cautelas.push(elemento);
                    break;
                  }
                  if(aceito > recusado){
                    elemento.status = "secondary";
                    this.cautelas.push(elemento);
                    break;
                  }
                  if(aceito == recusado){
                    elemento.status = "primary";
                    this.cautelas.push(elemento);
                    break;
                  }
                }else{
                  elemento.status = "lara";
                  this.cautelas.push(elemento);
                  break;
                }
              }
          }else{
            if(i == list.length-1){
              if(aceito == 0 && recusado == 0){
                elemento.status = "dark";
                this.cautelas.push(elemento);
              }else if(cont != list.length){
                elemento.status = "lara";
                this.cautelas.push(elemento);
                break;
              }
            }
            continue;
          }
        }
        });
      });
      if(refresher){refresher.complete();}
      console.log("cautelasOn/adm:");
    });
  }

  cautelas_paOn(user,refresher?:any){
      this.firebaseProvider.refOn("/func_perfil/"+user+"/cautelas_pa/").on("value",(userProfileSnapshot:any)=>{
        //console.log("cautelas_pa/adm/atualizado:",userProfileSnapshot.val());
        this.cautelas_pa = [];
        this.caut_pa_noti = 0;
        let result = userProfileSnapshot;
        result.forEach(element => {
          this.caut_pa_noti++;
          this.firebaseProvider.object("/administrativo/cautelas/"+element.val().id).then(object=>{
            this.cautelas_pa.push(object);
          });
        });
        if(refresher){refresher.complete();}
        console.log("cautelas_paOn/adm:");
      });
  } 

  cautelas_apOn(refresher?:any){
      this.firebaseProvider.refOn("/administrativo/cautelas").on("value",(resp:any)=>{
        let result = resp;
        this.cautelas_ap = [];
        result.forEach(element => { 
          //console.log("key: ", element.key);
          let elemento = element.val();
          //console.log("elemento: ", elemento);
          this.firebaseProvider.list("/administrativo/cautelas/"+elemento.id+"/aprovacao/").then((list:any)=>{
            //console.log("aprovacoes/list: ", list);
            let aceito = 0;
            let recusado = 0;
            let cont = 0;
            for (let i = 0; i < list.length; i++) {
                if(list[i].aprovado != "wait"){
                  cont++;
                  if(list[i].aprovado == true || list[i].aprovado == "atencao"){
                    aceito++;
                  }else if(list[i].aprovado == false){
                    recusado++;
                  }
                if(i == list.length-1){
                  if(cont == list.length){
                    if(aceito > recusado){
                      this.cautelas_ap.push(elemento);
                    }
                  }
                }
            }
          }
          });
        });
        if(refresher){refresher.complete();}
        console.log("cautelas_apOn/adm:");
      });
  }

  moduloOn(refresher?:any){
    this.firebaseProvider.getuser().then(user=>{ 
      this.firebaseProvider.refOn("/func_perfil/"+user+"/modulos/0").on("value",(resp:any)=>{
        this.modulo = resp.val();
        if(refresher){refresher.complete();}
        console.log("moduloOn/adm:");
      });
    });
  }

  teste(event){
    console.log("teste: ", event);
  }

  getItems(ev: any) {
    console.log('cautelas/admin', this.cautelas);
    this.cautPesq = this.cautelas; 
    const val = ev.target.value; 
    if (val && val.trim() != '') { 
      this.cautPesq = this.cautPesq.filter((usuario) => {
        return (usuario.titulo.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
      console.log("cautPesq: ",this.cautPesq);
      if (this.cautPesq.length == 0) {
        this.cautPesq = this.cautelas;
        this.cautPesq = this.cautPesq.filter((usuario) => {
          return (usuario.data.toLowerCase().indexOf(val.toLowerCase()) > -1);
        });
      }
    }else{
      this.cautPesq = [];
    }
  }

  Modal(cautela,modo) { 
    if(this.modulo.leitura == true ){
      console.log("modo/dmin: ",modo);
      if(modo == 'edit'){
        if(cautela.status == 'dark'){
          this.navCtrl.push(CautelaPage, { cautela: cautela, modo:modo });
        }else{
          if(cautela.status == 'lara'){
            this.navCtrl.push(CautelaPage, { cautela: cautela, modo:'not' });
          }else{
            this.navCtrl.push(CautelaPage, { cautela: cautela, modo:'view' });
          }
          
        }
      }else{
        if(modo == 'view'){
          this.navCtrl.push(CautelaPage, { cautela: cautela, modo:'aprovado' });
        }else{
          this.navCtrl.push(CautelaPage, { cautela: cautela, modo:modo });
        }
      }
      
    }
  }

  doRefresh(refresher){

    this.firebaseProvider.refOn("/func_perfil/"+this.user+"/cautelas_pa/").once("value",(userProfileSnapshot:any)=>{
      console.log("cautelas_pa/adm/atualizado:");
      this.cautelas_pa = [];
      this.caut_pa_noti = 0;
      let result = userProfileSnapshot;
      result.forEach(element => {
        this.caut_pa_noti++;
        this.firebaseProvider.object("/administrativo/cautelas/"+element.val().id).then(object=>{
          this.cautelas_pa.push(object);
        });
      });
      if(refresher){refresher.complete();}
    });
 
    this.firebaseProvider.refOn("/func_perfil/"+this.user+"/modulos/0").once("value",(resp:any)=>{
      this.modulo = resp.val();
      if(refresher){refresher.complete();}
      console.log("modulo/adm/atualizado:");
    });

    this.firebaseProvider.refOn("/administrativo/cautelas").once("value",(resp:any)=>{
      let result = resp;
      this.cautelas_ap = [];
      result.forEach(element => {
        let elemento = element.val();
        this.firebaseProvider.list("/administrativo/cautelas/"+elemento.id+"/aprovacao/").then((list:any)=>{
          let aceito = 0;
          let recusado = 0;
          let cont = 0;
          for (let i = 0; i < list.length; i++) {
              if(list[i].aprovado != "wait"){
                cont++;
                if(list[i].aprovado == true || list[i].aprovado == "atencao"){
                  aceito++;
                }else if(list[i].aprovado == false){
                  recusado++;
                }
              if(i == list.length-1){
                if(cont == list.length){
                  if(aceito > recusado){
                    this.cautelas_ap.push(elemento);
                  }
                }
              }
          }
        }
        });
      });
      if(refresher){refresher.complete();}
        console.log("cautelas_apOn/adm/atualizado:");
    });

    this.firebaseProvider.refOn("/administrativo/cautelas").once("value",(resp:any)=>{
      let result = resp;
      this.cautelas = [];
      result.forEach(element => { 
        //console.log("key: ", element.key); 
        let elemento = element.val();
        //console.log("cautela add/cautelasOn: ", elemento); 
        this.firebaseProvider.list("/administrativo/cautelas/"+elemento.id+"/aprovacao/").then((list:any)=>{
          //console.log("aprovacoes/list: ", list);
          let aceito = 0;
          let recusado = 0;
          let cont = 0;
          for (let i = 0; i < list.length; i++) {
            //console.log("aprovado:",list[i].aprovado);
              if(list[i].aprovado != "wait"){
                cont++;
                if(list[i].aprovado == "reuniao"){
                  elemento.status = "primary";
                  this.cautelas.push(elemento);
                  break;
                }else if(list[i].aprovado == true || list[i].aprovado == "atencao"){
                  aceito++;
                }else if(list[i].aprovado == false){
                  recusado++;
                }
              if(i == list.length-1){ 
                if(cont == list.length){
                  if(aceito < recusado){
                    elemento.status = "danger";
                    this.cautelas.push(elemento);
                    break;
                  }
                  if(aceito > recusado){
                    elemento.status = "secondary";
                    this.cautelas.push(elemento);
                    break;
                  }
                  if(aceito == recusado){
                    elemento.status = "primary";
                    this.cautelas.push(elemento);
                    break;
                  }
                }else{
                  elemento.status = "lara";
                  this.cautelas.push(elemento);
                  break;
                }
              }
          }else{
            if(i == list.length-1){
              if(aceito == 0 && recusado == 0){
                elemento.status = "dark";
                this.cautelas.push(elemento);
              }else if(cont != list.length){
                elemento.status = "lara";
                this.cautelas.push(elemento);
                break;
              }
            }
            continue;
          }
        }
        });
      });
      if(refresher){refresher.complete();}
      console.log("cautelasOn/adm/atualizado:");
    });
  }

  ionViewDidLeave(){
    //this.firebaseProvider.refOff("/administrativo/cautelas");
      console.log("off/admin1");
	}

}
