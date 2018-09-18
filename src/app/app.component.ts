import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController, Loading, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FIREBASE_CREDENTIALS } from './credentials_firebase';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login'
import firebase from 'firebase';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { AutenticacaoProvider } from '../providers/autenticacao/autenticacao';
import { CriarContaPage } from '../pages/criar-conta/criar-conta';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage:any;
  nome;
  perfil;
  imagen = "assets/images/newUser-b.png";
  pages:any = [];
  email: any;
  caut_pa_noti = 0;
  user:any = {emailVerified:null};
  constructor(public platform: Platform, 
              public statusBar: StatusBar,
              private loading: LoadingController,
              public splashScreen: SplashScreen,
              private firebaseProvider: FirebaseProvider,
              private authProvider: AutenticacaoProvider,
              private alertCtrl: AlertController) {
    this.initializeApp(); 
    firebase.initializeApp(FIREBASE_CREDENTIALS);
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        this.firebaseProvider.refOff("/func_perfil/"+user);
        this.firebaseProvider.refOff("/func_perfil/"+user+"/cautelas_pa/");
        this.firebaseProvider.refOff("/administrativo/cautelas");
        this.pages = [];
        let geral = [
          { title: 'Login', component: LoginPage, cesso: true },
          { title: 'Criar conta', component: CriarContaPage, cesso: true },
          { title: 'Esqueci minha senha', component: LoginPage, acesso: true }
        ];
        this.pages.Geral = geral;
        this.nome = null;
        this.user = {emailVerified:null};
        this.perfil = null;
        this.email = null;
        this.imagen = null;
        this.caut_pa_noti = 0;
        this.authProvider.logoutUser();
        this.rootPage = LoginPage; 
        console.log("não tem gente logada ", this.rootPage);
        //unsubscribe();
      }else{
        this.user = user;
        console.log("email verificado",user.emailVerified);
        this.cautelas_paOn(user.uid);
        this.AtualizarStatus();
        this.rootPage = HomePage;
        console.log("tem gente logada ",this.rootPage);
        //unsubscribe();
      }
    });
  }
 
  AtualizarStatus(){
    this.firebaseProvider.getuser().then(user=>{
      console.log("user: ",user);
      this.firebaseProvider.refOn("/func_perfil/"+user).on("value", userProfileSnapshot => {
        if(userProfileSnapshot.val()){
          console.log("func_perfil: ",userProfileSnapshot.val());
          this.nome = userProfileSnapshot.val().nome;
          this.perfil = userProfileSnapshot.val();
          this.email = userProfileSnapshot.val().email;
          console.log("perfil: ",this.perfil);
          this.imagen = userProfileSnapshot.val().imagen;
          this.firebaseProvider.menuItns(user).then((page:any)=>{
            console.log("page: ",page);
            this.pages = page;
            console.log("pages: ",this.pages); 
          });
        }else{
          this.firebaseProvider.refOff("/func_perfil/"+user);
          this.firebaseProvider.refOff("/func_perfil/"+user+"/cautelas_pa/");
          this.firebaseProvider.refOff("/administrativo/cautelas");
          this.pages = [];
          let geral = [
            { title: 'Login', component: LoginPage, cesso: true },
            { title: 'Criar conta', component: CriarContaPage, cesso: true },
            { title: 'Esqueci minha senha', component: LoginPage, acesso: true }
          ];
          this.pages["Geral"] = geral;
          this.nome = null;
          this.user = {emailVerified:null};
          this.perfil = null;
          this.email = null;
          this.imagen = null;
          this.caut_pa_noti = 0;
          this.authProvider.logoutUser();
          this.rootPage = LoginPage;
        }
        });
    });
     }

     cautelas_paOn(user){
      console.log("cautelas_pa/app:",user);
      this.firebaseProvider.refOn("/func_perfil/"+user+"/cautelas_pa/").on("value",(userProfileSnapshot:any)=>{
        let result = userProfileSnapshot;
        this.caut_pa_noti = 0;
        console.log("userProfileSnapshot length: ",userProfileSnapshot.val());
        result.forEach(element =>{
          this.caut_pa_noti++;
        });
      });
    } 

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      
    });
  }
 
  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    setTimeout(() => {
      this.firebaseProvider.getuser().then(user=>{
        console.log("user: ",user);
        if(user != "Erro"){
        this.firebaseProvider.refOn("/func_perfil/"+user).once("value", userProfileSnapshot => {
          if(userProfileSnapshot.val()){
            console.log("func_perfil: ",userProfileSnapshot.val());
            this.nome = userProfileSnapshot.val().nome;
            this.perfil = userProfileSnapshot.val();
            this.email = userProfileSnapshot.val().email;
            console.log("perfil: ",this.perfil);
            this.imagen = userProfileSnapshot.val().imagen;
            this.firebaseProvider.menuItns(user).then((page:any)=>{
              console.log("page: ",page);
              this.pages = page;
              console.log("pages: ",this.pages);

            this.firebaseProvider.refOn("/func_perfil/"+user+"/cautelas_pa/").on("value",(userProfileSnapshot:any)=>{
              let result = userProfileSnapshot;
              this.caut_pa_noti = 0;
              console.log("userProfileSnapshot length: ",userProfileSnapshot.val());
              result.forEach(element =>{
                this.caut_pa_noti++;
              });
              refresher.complete();
            });
            });
          }else{
            this.firebaseProvider.refOff("/func_perfil/"+user);
            this.firebaseProvider.refOff("/func_perfil/"+user+"/cautelas_pa/");
            this.firebaseProvider.refOff("/administrativo/cautelas");
            this.pages = [];
            let geral = [
              { title: 'Login', component: LoginPage, cesso: true },
              { title: 'Criar conta', component: CriarContaPage, cesso: true },
              { title: 'Esqueci minha senha', component: LoginPage, acesso: true }
            ];
            this.pages["Geral"] = geral;
            this.nome = null;
            this.user = {emailVerified:null};
            this.perfil = null;
            this.email = null;
            this.imagen = null;
            this.caut_pa_noti = 0;
            this.authProvider.logoutUser();
            this.rootPage = LoginPage;
            refresher.complete();
          }
          },error=>{
            refresher.complete();
          });
        }else{
          refresher.complete();
        }
      });
    }, 1000);
  }

  ReenviarEmail(){
    var user = firebase.auth().currentUser;
    let loading = this.loading.create({
    });
    loading.present();
    const confirm = this.alertCtrl.create({
      title: 'Link reenviado para o seu email '+this.perfil.email,
      message: 'para a segurança da sua conta o aplicativo só desbloqueara após a verificação do seu email, após ter efetuado a verificação do seu email reinicie o aplicativo.',
      buttons: [
      {
        text: 'Ok',
        handler: () => {
        console.log('Ok');
        }
      }
      ]
    });
    user.sendEmailVerification().then(function(){
      console.log("Sucesso/reenviarEmail");
      loading.dismissAll();
      confirm.present();
    }).catch(function(error) {
        console.log("Erro/reenviarEmail");
    });
  }

  Sair() {
    const confirm = this.alertCtrl.create({
      title: 'Realmente deseja sair da sua conta?',
      buttons: [
        {
          text: 'Não',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Sim',
          handler: () => {
            this.firebaseProvider.getuser().then(user=>{
            this.firebaseProvider.refOff("/func_perfil/"+user);
            this.firebaseProvider.refOff("/func_perfil/"+user+"/cautelas_pa/");
            this.firebaseProvider.refOff("/administrativo/cautelas");
            this.pages = [];
            let geral = [
              { title: 'Login', component: LoginPage, cesso: true },
              { title: 'Criar conta', component: CriarContaPage, cesso: true },
              { title: 'Esqueci minha senha', component: LoginPage, acesso: true }
            ];
            this.pages["Geral"] = geral;
            this.nome = null;
            this.user = {emailVerified:null};
            this.perfil = null;
            this.email = null;
            this.imagen = null;
            this.caut_pa_noti = 0;
            this.authProvider.logoutUser();
          });
          }
        }
      ]
    });
    confirm.present();
  }

  openPage(page) {
    if(page.component == "home"){
      this.nav.setRoot(HomePage);
    }else{
      this.nav.setRoot(page.component);
    }
    
  }
}
