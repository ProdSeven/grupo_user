import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Alert, ActionSheetController, Loading, Platform, ViewController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Camera } from '@ionic-native/camera';
import { HomePage } from '../home/home';

/**
 * Generated class for the PerfilPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:'perfil'
})
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {
  UserPerfil: any = null;
  public loading: Loading;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private firebaseProvider: FirebaseProvider,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private actionSheetCtrl: ActionSheetController,
              private camera: Camera,
              private platform: Platform,
              private viewCtrl: ViewController) {

      this.platform.registerBackButtonAction(() => {
        if(!this.viewCtrl.enableBack()) { 
          this.navCtrl.setRoot(HomePage);
        }else{
          this.navCtrl.pop();
        }
      });
                this.UserOn();
  }

  UserOn(){
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    loading.present();
    let ok = false;

    this.firebaseProvider.getuser().then((user:any) => {
      console.log("user: ",user);
      this.firebaseProvider.refOn("user_perfil/"+user).on("value", infoUser => {
          console.log("infoUser: ",infoUser.val());
          this.UserPerfil = infoUser.val();
          console.log("this.UserPerfil: ",this.UserPerfil);
          ok = true;
          loading.dismiss();
      },error=>{
        loading.dismiss();
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
        }
      });
    
  }

  atualizar(tipo) {
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    let ok = false;
    let alert: Alert = this.alertCtrl.create({
      title: this.capitalize(tipo),
      inputs: [{ name: 'update', placeholder: tipo, value: this.UserPerfil[tipo] }],
      buttons: [
        { text: 'Cancelar' },
        {
          text: 'Salvar',
          handler: data => {
            loading.present();
            let update = data.update;
            console.log("tipo/update:", tipo, " / ", update);
            this.firebaseProvider.getuser().then(user => {
              ok = true;
              loading.dismiss();
              this.firebaseProvider.set("user_perfil/" + user + "/" + tipo, update).then(() => {
                console.log(this.capitalize(tipo) + ' modificado com sucesso!');
              }).catch(error => {
                loading.dismiss();
                console.log('ERROR: ' + error.message);
              });
            });
          }
        }]
    });
    alert.present();

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
          title: tipo+" atualizado com sucesso",
        });
        alert.present();
        }
      });
  }

  capitalize(lower) {
    return (lower ? lower.toLowerCase() : this).replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
  };

  ionViewDidLoad() {
    console.log('ionViewDidLoad PerfilPage');
  }

  updateEmail(): void {
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    let ok = false;
    let alert: Alert = this.alertCtrl.create({
      inputs: [{ name: 'newEmail', placeholder: 'Seu novo email' },
      { name: 'password', placeholder: 'Sua senha', type: 'password' }],
      buttons: [
        { text: 'Cancelar' },
        {
          text: 'Salvar',
          handler: data => {
            loading.present();
            let newEmail = data.newEmail;
            if (/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(newEmail)) {
              this.firebaseProvider
                .updateEmail(data.newEmail, data.password)
                .then(() => { 
                  console.log('Email modificado com sucesso!'); 
                  ok = true;
                  loading.dismiss();
                  let alert = this.alertCtrl.create({
                    title:"Email alterado para "+data.newEmail,
                  });
                  alert.present();
                }).catch(error => { console.log('ERROR: ' + error.message);loading.dismiss(); });
            } else {
              console.log("Erro");
              let alert = this.alertCtrl.create({
                title:"Informe um email válido.",
              });
              ok = true;
              alert.present();
              loading.dismiss();
            }
          }
        }]
    });
    alert.present();

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
        }
      });

  }


  updatePassword(): void {
    let loading = this.loadingCtrl.create({
      spinner: 'ios',
      duration: 30000
    });
    let ok = false;
    let alert: Alert = this.alertCtrl.create({
      inputs: [
        { name: 'newPassword', placeholder: 'Nova senha', type: 'password' },
        { name: 'oldPassword', placeholder: 'Senha antiga', type: 'password' }],
      buttons: [
        { text: 'Cancelar' },
        {
          text: 'Salvar',
          handler: data => {
            console.log("data: ",data);
            if(data.newPassword != ''){
              loading.present();
              this.firebaseProvider.updatePassword(
                data.newPassword,
                data.oldPassword
              ).then(()=>{
                console.log("senha atualizada");
                ok = true;
                loading.dismiss();
              }).catch(error => { console.log('ERROR: ' + error.message);loading.dismiss(); });
            }else{
              loading.dismiss();
            }
          }
        }
      ]
    });
    alert.present();

    loading.onDidDismiss(() => {
      console.log('Ok : ',ok);
      if(ok == false){
        let alert = this.alertCtrl.create({
          title:"Algo está errado.",
          subTitle:"Tente novamente",
        });
        alert.present();
      }
      if(ok == true){
        let alert = this.alertCtrl.create({
          title:"Senha atualizada com sucesso",
        });
        alert.present();
        }
      });
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Adicionar foto',
      buttons: [
        { 
          icon: 'md-image',
          text: 'Galeria',
          role: 'destructive',
          handler: () => {
           this.selectPhoto();
          }
        },{
          icon:'md-camera',
          text: 'Camera',
          handler: () => {
           this.takePhoto();
          }
        },{ 
          icon: 'md-close',
          text: 'Remover foto',
          handler: () => {
           this.removerFoto();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  removerFoto(){
    if(this.UserPerfil.imagem != "assets/images/newUser-b.png"){
      let loading = this.loadingCtrl.create({
        spinner: 'ios',
        duration: 30000
      });
      let ok = false;
      loading.present();
      this.firebaseProvider.getuser().then(user=>{
        this.firebaseProvider.delImage(this.UserPerfil.imagem).then(()=>{
          this.firebaseProvider.update("user_perfil/"+user,{imagem:"assets/images/newUser-b.png"}).then(()=>{
            console.log("Imagem deleteada");
            let alert = this.alertCtrl.create({
              title:"Imagem removida",
            });
            alert.present();
            ok = true;
            loading.dismiss();
          },error=>{
            loading.dismiss();
          });
        },error=>{
          loading.dismiss();
        }).catch(function(error){
          console.log("Error: ",error);
          loading.dismiss();
        });;
      });

      loading.onDidDismiss(() => {
        console.log('Ok : ',ok);
        if(ok == false){
          let alert = this.alertCtrl.create({
            title:"Algo está errado.",
            subTitle:"Tente novamente",
          });
          alert.present();
        }
        if(ok == true){
          }
        });
    }
  }
  
  takePhoto() {
    this.camera.getPicture({
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
      saveToPhotoAlbum: true,
      targetWidth: 300,
      targetHeight: 300
    }).then(imageData => {
      console.log("imageData:",imageData);
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.uploadPhoto(imageData);
    }, error => {
      //alert("ERROR -> " + JSON.stringify(error));
    });
  }
	
	selectPhoto(): void {

    this.camera.getPicture({

      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 50,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 300,
			targetHeight: 300
			
    }).then(imageData => {
      console.log("imageData:",imageData);
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.uploadPhoto(imageData);
			
    }, error => {
		 //alert("ERROR -> " + JSON.stringify(error));
		 
    });
  }
	
	 public uploadPhoto(imageData): void { 
		this.firebaseProvider.uploadFotoPerfil(this.UserPerfil.imagemuid,imageData).then((resp:any)=>{
      if(resp.status == "OK"){
        this.firebaseProvider.getuser().then(user=>{
          this.firebaseProvider.update("user_perfil/"+user,{imagem:resp.body}).then(()=>{
            console.log('File available at', resp.body);
            this.UserPerfil.imagem = resp.body;
            this.loading.dismiss();
          }).catch(()=>{
            this.firebaseProvider.delImage(resp.body).then(()=>{
              console.log("Imagem deleteada");
            });
            console.log('Erro:', resp.body);
            this.loading.dismiss();
          });
        });
      }else{
        this.loading.dismiss();
        let alert = this.alertCtrl.create({
          title:"Erro no carregamento da imagem",
          subTitle:"Tente novamente"
        });
        alert.present();
      }
    });
	}

}
