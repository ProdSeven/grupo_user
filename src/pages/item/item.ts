import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, Platform, NavController } from 'ionic-angular';
import { BackgroundMode } from '@ionic-native/background-mode';
@IonicPage()
@Component({
  selector: 'page-item',
  templateUrl: 'item.html',
})
export class ItemPage {
  item;
  constructor(private navParams: NavParams,
              private viewCtrl: ViewController,
              private platform: Platform,
              private navCtrl: NavController,
              private backgroundMode: BackgroundMode){
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        this.viewCtrl.dismiss();
      })
    });
   this.item = this.navParams.get("item");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ItemPage');
  }

  voltar(){
    this.viewCtrl.dismiss();
  }

  panEvent(e) {
    console.log(e.additionalEvent+"||"+e.direction);
    console.log(e.deltaX +"||"+e.deltaY);

    if(e.deltaY > 7 && this.item != null){
      this.item = null;
      this.voltar();
    }

  }

}
