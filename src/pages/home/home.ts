import { Component } from '@angular/core';
import { NavController, IonicPage, Platform, ViewController, reorderArray, ToastController  } from 'ionic-angular';
import { AutenticacaoProvider } from '../../providers/autenticacao/autenticacao';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BackgroundMode } from '@ionic-native/background-mode';
import { ItemSliding } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items = [];
  voltar = false;
  constructor(public navCtrl: NavController,
              private auth: AutenticacaoProvider,
              public splashScreen: SplashScreen,
              private platform: Platform,
              private viewCtrl: ViewController,
              private backgroundMode: BackgroundMode,
              private toastCtrl: ToastController) {
  this.platform.ready().then(() => {
    this.platform.registerBackButtonAction(() => {
      if(!this.viewCtrl.enableBack()) { 
        if(this.voltar == false){
          let toast = toastCtrl.create({
            message:"pressione o botão voltar mais uma vez para sair do aplicativo",
            duration:3000
          });
          this.voltar = true;
          toast.present();
          setTimeout(() => {
            this.voltar = false;
          }, 3000);
        }else{
          this.backgroundMode.moveToBackground();
        }
      }else{
          this.navCtrl.pop();
      } 
    }) 
  });

  for (let x = 0; x < 5; x++) {
    this.items.push(x);
  }
  }
 
  ionViewDidEnter() {
    this.splashScreen.hide();
   }

   doRefresh(refresher) {
      console.log('Begin async operation', refresher);
      setTimeout(() => {
        console.log('Async operation has ended');
        refresher.complete();
      }, 2000);
   }

   saveItem(item){
     console.log("teste: ",item);
   }

   share(slidingItem: ItemSliding){
    slidingItem.moveSliding(45);
  }

  reorderItems(indexes) {
    this.items = reorderArray(this.items, indexes);
    console.log("teste: ",this.items);
  }

}
