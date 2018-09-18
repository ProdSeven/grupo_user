import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, ViewController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { BackgroundMode } from '@ionic-native/background-mode';

/**
 * Generated class for the GusuariosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:'gusuarios'
})
@Component({
  selector: 'page-gusuarios',
  templateUrl: 'gusuarios.html',
})
export class GusuariosPage {
  usuarios = null;
  usuariosPesq = [];
  modulo;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private firebaseProvider: FirebaseProvider,
              private modalCtrl: ModalController,
              private platform: Platform,
              private viewCtrl: ViewController,
              private backgroundMode: BackgroundMode){
  this.usuariosON();
  this.moduloOn();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GusuariosPage');
  } 

  usuariosON(){
    this.firebaseProvider.refOn("func_perfil/").on("value",(usuariosSnap:any)=>{
      this.firebaseProvider.TransformList(usuariosSnap).then((usuarios:any)=>{
        this.usuarios = usuarios;
        for (let i = 0; i < this.usuarios.length; i++) {
          this.firebaseProvider.list("func_perfil/"+this.usuarios[i].id+"/modulos").then(modulos=>{
            console.log('modulos: ',modulos);
            this.usuarios[i].modulos = modulos;
          });
        }
        console.log('usuarios: ',this.usuarios);
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
 
  infoUser(usuario){
    if (this.modulo.leitura == true) {
      let modal = this.modalCtrl.create("infoUser", { usuario: usuario.id });
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
  }
}
