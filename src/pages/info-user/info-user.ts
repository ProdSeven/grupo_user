import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, AlertController, LoadingController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';

/**
 * Generated class for the InfoUserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:'infoUser'
})
@Component({
  selector: 'page-info-user',
  templateUrl: 'info-user.html',
})
export class InfoUserPage {
  usuario:any = [];
  modulo;
  modulos:any = [];
  moduloAdd = {
    title:"modulo",
    add:false, 
    delete:false,
    leitura:false,
    update:false,
    component:null,
    id:null,
    setor:null,
    pesq:null,
    arquivar:null
  };
  modo = "view";
  usuarioTemp:any = [];
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private platform: Platform,
              private viewCtrl: ViewController,
              private firebaseProvider: FirebaseProvider,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController) {
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        this.viewCtrl.dismiss();
      })
    });
    this.moduloOn();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoUserPage');
    let id = this.navParams.get("usuario");
    this.firebaseProvider.refOn("func_perfil/"+ id).on("value",list=>{
      console.log("list, ",list.val());
      this.usuario = list.val();
        this.firebaseProvider.list("func_perfil/"+this.usuario.id+"/modulos").then(modulos=>{
          console.log('modulos: ',modulos);
          this.usuario.modulos = modulos;
        });
      this.usuarioTemp = list.val();
      console.log("this.usuario/this.usuarioTemp ",this.usuario," ", this.usuarioTemp);
    });
  }

  cancelAdd(){
    this.modulos = [];
    this.moduloAdd = {
      title:"modulo",
      add:false, 
      delete:false,
      leitura:false,
      update:false,
      component:null,
      id:null,
      setor:null,
      pesq:null,
      arquivar:null
    };
    this.modo = "view";
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        this.viewCtrl.dismiss();
      })
    });
  }

  moduloOn(){
    this.firebaseProvider.getuser().then(user=>{ 
      this.firebaseProvider.refOn("/func_perfil/"+user+"/modulos/1").on("value",(resp:any)=>{
        this.modulo = resp.val();
        console.log("moduloOn/info-user:");
      });
    });
  }

  voltar(){
    this.viewCtrl.dismiss();
  }

  teste(teste){
    console.log("teste: ",this.moduloAdd);
  }

  save(){
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    let ok = false;
    if (this.modulo.update == true){
      console.log("this.usuario/this.usuarioTemp ",this.usuario," ", this.usuarioTemp);
      if (JSON.stringify(this.usuarioTemp) != JSON.stringify(this.usuario)){
        loading.present();
        this.firebaseProvider.update("func_perfil/"+this.usuario.id,{modulos:this.usuario.modulos}).then((modulo)=>{
          console.log("usuario: ",this.usuario);
          console.log("Modulo alterado: ",modulo);
          this.viewCtrl.dismiss();
          ok = true;
          loading.dismiss();
        },error=>{
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title:"Houve um erro na comunicação com o servidor",
            subTitle:"não foi possivel efetuar a alteração: "+ error,
          });
          alert.present();
        });
      }else{
        let alert = this.alertCtrl.create({
          title:"Não houve modificações",
        });
        alert.present();
    }
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
          title:"Modificação feita com sucesso.",
        });
        alert.present();
        }
      });
    }
  }

  adicionar(){
    if(this.modo == "view"){
      this.firebaseProvider.refOn("config/modulos").on("value",(modulosSnap:any)=>{
        this.firebaseProvider.TransformList(modulosSnap).then((modulos:any)=>{
        console.log("modulos: ",modulos);
        for (let i = 0; i < modulos.length; i++){
          let cont = false;
          for (let j = 0; j < this.usuario.modulos.length; j++){
            console.log("modulos[i].id/this.usuario.modulos[j].id: ",modulos[i].id," /",this.usuario.modulos[j].id);
            if (modulos[i].id == this.usuario.modulos[j].id) {
              cont = true;
              console.log("ja tem: ");
              break;
            }
            if(j == this.usuario.modulos.length-1){
              if(cont == false){
                this.modulos.push(modulos[i]);
                console.log("nao tem: ");
              }
            }
          }
        }
        this.modo = "add";
        });
      });
      this.platform.ready().then(() => {
        this.platform.registerBackButtonAction(() => {
          this.cancelAdd();
        });
      });
    }else{
        let cont = false;
      for (let i = 0; i < this.modulos.length; i++){
          if(this.moduloAdd.title = this.modulos[i].title){
            cont = true;
            this.moduloAdd.id = this.modulos[i].id;
            this.moduloAdd.component = this.modulos[i].component;
            this.moduloAdd.setor = this.modulos[i].setor;
            break;
          }
      }
      if (cont == true) {
        this.firebaseProvider.set("func_perfil/"+this.usuario.id+"/modulos/"+this.moduloAdd.id,this.moduloAdd).then(()=>{
          console.log("Módulo "+this.moduloAdd.title+" adicionado.");
          this.cancelAdd();
        });
      }
    }
  }

}
