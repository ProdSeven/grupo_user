import { Component } from '@angular/core';
import { NavController, IonicPage, Platform, ViewController, reorderArray  } from 'ionic-angular';
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
  constructor(public navCtrl: NavController,
              private auth: AutenticacaoProvider,
              public splashScreen: SplashScreen,
              private platform: Platform,
              private viewCtrl: ViewController,
              private backgroundMode: BackgroundMode) {
  this.platform.ready().then(() => {
    this.platform.registerBackButtonAction(() => {
      if(!this.viewCtrl.enableBack()) { 
          this.backgroundMode.moveToBackground();
      }else{
          this.navCtrl.pop();
      } 
    }) 
  });

  for (let x = 0; x < 5; x++) {
    this.items.push(x);
  }
  }
 
   ionViewDidLoad() {
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
