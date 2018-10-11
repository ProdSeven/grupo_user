import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, ToastController, LoadingController, Platform } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';

/**
 * Generated class for the RequeInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:"page-reque-info"
})
@Component({
  selector: 'page-reque-info',
  templateUrl: 'reque-info.html',
})
export class RequeInfoPage {

  requeId:any = null;
  requerimento:any = null;
  seg = "reque";
  setor;
  filtro:any = null;
  setores:any = null;
  encaminhar = false;
  aceito = true;
  parecer:any = null;
  @ViewChild('myInput') myInput: ElementRef;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private firebaseProvider: FirebaseProvider,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private platform: Platform) {
                
    this.platform.registerBackButtonAction(() => {
      this.viewCtrl.dismiss();
  });
                this.getID();
                this.setoresOn();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequeInfoPage');
  }

  swipeEvent(event) {
    console.log('seg: ',this.seg);
    console.log('event.direction: ',event.direction);
    if(event.direction === 2 && this.seg == 'reque') {
      console.log('parecer');
      this.seg = 'parecer';
    }else{
      if(event.direction === 4 && this.seg == 'parecer') {
        console.log('reque');
        this.seg = 'reque';
      }
    }
  }

  voltar(){
      this.viewCtrl.dismiss();
  }

  setoresOn(){
    this.firebaseProvider.list("config/setores").then(setores=>{
      this.setores = setores;
    });
  }

  requeOn(){
    if(this.requeId != null){
      this.firebaseProvider.refOn("SIM/requerimentos/"+this.requeId).on("value",requerimeto=>{
        this.requerimento = requerimeto.val();
        if(this.requerimento.parecer){
          this.firebaseProvider.refOn("SIM/requerimentos/"+this.requeId+"/parecer/").orderByChild('fila').once("value",parecerSnap=>{
            this.firebaseProvider.TransformList(parecerSnap).then(parecer=>{
              console.log("parecer: ",parecer);
              this.firebaseProvider.inverteArray(parecer).then(precerOreder=>{
                this.requerimento.parecer = precerOreder;
                  for (let i = 0; i < this.requerimento.parecer.length; i++) {
                    this.firebaseProvider.refOn("func_perfil/"+this.requerimento.parecer[i].idFunc).once("value",perfil=>{
                      if(perfil.val()){
                        console.log("perfil/parecer: ",perfil.val());
                        this.requerimento.parecer[i].perfil = perfil.val();
                      }else{
                        let unknow:any = [];
                        unknow.nome = "Usuario deletado";
                        unknow.cargo = "desconhecido";
                        unknow.imagem = "assets/images/newUser-b.png";
                        console.log("unknow/parecer: ",unknow);
                        this.requerimento.parecer[i].perfil = unknow;
                      }
                    });
                  }
              });
            });
          });
        }
      });
    }else{
      this.getID();
    }
  }

  resize() {
    this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
  }

  getID(){
    this.requeId = this.navParams.get("id");
    console.log("requeId: ",this.requeId);
    this.requeOn();
  }

}
