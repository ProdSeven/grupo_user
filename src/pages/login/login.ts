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
import { HomePage } from '../home/home';
import { CriarContaPage } from '../criar-conta/criar-conta';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Observable } from 'rxjs/Observable';
import { FirebaseProvider } from '../../providers/firebase/firebase';

@IonicPage({
  name: 'login'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
    
    public loginForm: FormGroup;
    public loading: Loading;
    public user;
    
    
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
              private firebaseProvider : FirebaseProvider) {

				this.platform.ready().then(() => {
					this.platform.registerBackButtonAction(() => {
						if(!this.viewCtrl.enableBack()) { 
							this.backgroundMode.moveToBackground();
						}else{
						this.navCtrl.pop();
						 } 
          })
        });
  	    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
                                                    this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
                                                    this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
                                                    this.androidPermissions.PERMISSION.SYSTEM_ALERT_WINDOW]);
	      this.loginForm = formBuilder.group({
		      email: ['',Validators.compose([Validators.required, EmailValidator.isValid])],
          password: ['',Validators.compose([Validators.required, Validators.minLength(6)])]});
        }
	
  	goToSignup():void {
      this.navCtrl.setRoot(CriarContaPage);
    }
    
	  goToResetPassword():void {
		  
    }
    
	  loginUser(): void {
		  if (!this.loginForm.valid) {
			  console.log('Informações invalidas');
		  }else{
			  const email = this.loginForm.value.email;
			  const password = this.loginForm.value.password;
		  	this.authProvider.loginUser(email, password).then(authData => {
        console.log("loginUser.user ,", authData.user.uid, ", key ",authData.key);
        this.firebaseProvider.object("/user_perfil").then(result=>{
				console.log("funfou ,", result);
        if(result[authData.user.uid]){
					console.log("loginUser é Aluno");
					this.loading.dismiss().then(() => {
					  this.navCtrl.setRoot(HomePage);
				  });
				}else{
          this.loading.dismiss().then(() => {
						this.authProvider.logoutUser().then(() => {
							this.navCtrl.setRoot(LoginPage);
						});
            const alert: Alert = this.alertCtrl.create({
              title: 'Entre com uma conta de Aluno',
              message: "Algumas das suas informações não estão corretas. Por favor, tente novamente.",
              buttons: [{ text: 'Ok', role: 'cancel' }]
            });
              alert.present();
          });
          }},error=>{
						  this.loading.dismiss().then(() => {
                let toast = this.toastCtrl.create({
                  message:"usuario: passageiro",
                  duration: 4000
                });
                toast.present();
                this.authProvider.logoutUser().then(() => {
                  this.navCtrl.setRoot(LoginPage);
                });
                const alert: Alert = this.alertCtrl.create({
                  title: 'Erro na autenticação.',
                  message: "Ocorreu um erro na autenticação. Por favor, tente novamente.",
                  buttons: [{ text: 'Ok', role: 'cancel' }]
                });
							  alert.present();
						  });
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
                message: "Email incorreta, tente novamente",
                buttons: [{ text: 'Ok', role: 'cancel' }]
              });
              alert.present();
              console.log("Error ,", error);
            }
						
					});
				}
			);
			this.loading = this.loadingCtrl.create();
			this.loading.present();
		}
  }
  
  
    
    

}
