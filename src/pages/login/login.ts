import { Component } from '@angular/core';
import {
Alert,
AlertController,
IonicPage,
Loading,
LoadingController,
NavController,
NavParams,
ToastController
} from 'ionic-angular';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Platform, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../validators/email';
import { AutenticacaoProvider } from '../../providers/autenticacao/autenticacao';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../home/home';
import { CriarContaPage } from '../criar-conta/criar-conta';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Observable } from 'rxjs/Observable';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Keyboard } from '@ionic-native/keyboard';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
    
    public loginForm: FormGroup;
    public loading: Loading;
    public user;
    voltar = false;
    teclado = {'margin-top':'0px'};
    
    
  constructor(public navCtrl: NavController,
			        public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
			        public authProvider: AutenticacaoProvider,
			        formBuilder: FormBuilder,
 			        public navParams: NavParams,
			        private androidPermissions: AndroidPermissions,
			        public viewCtrl: ViewController,
			        public platform: Platform,
				      private backgroundMode: BackgroundMode,
              private toastCtrl: ToastController,
              private firebaseProvider : FirebaseProvider,
              private keyboard: Keyboard,
              private splashScreen: SplashScreen) {

				this.platform.ready().then(() => {
          this.keyboard.onKeyboardShow().subscribe(status=>{
            this.teclado = {'margin-top':'300px'};
            console.log("abriu o teclado");
          });
          this.keyboard.onKeyboardHide().subscribe(status=>{
            this.teclado = {'margin-top':'0px'};
            console.log("abriu o teclado");
          });
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
          });
        });
  	    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
                                                    this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
                                                    this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
                                                    this.androidPermissions.PERMISSION.SYSTEM_ALERT_WINDOW]);
	      this.loginForm = formBuilder.group({
		      cpf: ['',Validators.compose([Validators.required, Validators.minLength(1)])],
          password: ['',Validators.compose([Validators.required, Validators.minLength(6)])]});
        }
	
  	goToSignup():void {
      this.navCtrl.setRoot(CriarContaPage);
    }
    
	  goToResetPassword():void {
		  
    }

    ionViewDidEnter() {
      console.log("splashScreen hide");
      this.splashScreen.hide();
     }
    
	  loginUser(): void {
		  if (!this.loginForm.valid) {
			  console.log('Informações invalidas');
		  }else{
			  const cpf = this.loginForm.value.cpf;
			  const password = this.loginForm.value.password;
		  	this.firebaseProvider.getMatricula(String(cpf)).then((userPerfil:any) => {
          console.log("userPerfil: ", userPerfil);
          if(userPerfil && userPerfil.email != ""){
            console.log("userPerfil, password: ", userPerfil, password);
            this.firebaseProvider.setCpf(String(cpf));
            this.authProvider.loginUser(userPerfil.email, password).then(authData => {
            console.log("loginUser.user ,", authData.user.uid, ", key ",authData.key);
            console.log("funfou ,", userPerfil);
            console.log("loginUser é Aluno");
            this.loading.dismiss().then(() => {
              if (authData.user.emailVerified == true) {
                this.navCtrl.setRoot(HomePage);
                console.log("logado");
              }else{
                console.log("email nao autenticado");
              }
            });
          },
          error => {
            this.loading.dismiss().then(() => {
              if(error.code == "auth/wrong-password"){
                const alert: Alert = this.alertCtrl.create({
                  message: "Senha incorreta, tente novamente",
                  buttons: [{ text: 'Ok', role: 'cancel' }]
                });
                alert.present();
                console.log("Error ,", error);
              }else if(error.code == "auth/user-not-found"){
                const alert: Alert = this.alertCtrl.create({
                  message: "Cpf incorreta, tente novamente",
                  buttons: [{ text: 'Ok', role: 'cancel' }]
                });
                alert.present();
                console.log("Error ,", error);
              }
              
            });
          });
        }else{
          let msg = 'Informações invalidas';
          this.loading.dismiss().then(() => {
            this.authProvider.logoutUser().then(() => {
              this.navCtrl.setRoot(LoginPage);
            });
            const alert: Alert = this.alertCtrl.create({
              title: msg,
              message: "Algumas das suas informações não estão corretas. Por favor, tente novamente.",
              buttons: [{ text: 'Ok', role: 'cancel' }]
            });
              alert.present();
          });
          }
      });
			this.loading = this.loadingCtrl.create();
			this.loading.present();
		}
  }
  
  
    
    

}
