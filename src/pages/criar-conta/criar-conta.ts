import { Component } from '@angular/core';
import {
Alert,
AlertController,
IonicPage,
Loading,
LoadingController,
NavController,
NavParams,
ActionSheetController,
ToastController 
} from "ionic-angular";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { EmailValidator } from "../../validators/email";
import { HomePage } from "../home/home";
import { BackgroundMode } from '@ionic-native/background-mode';
import { Platform, ViewController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AutenticacaoProvider } from '../../providers/autenticacao/autenticacao';
import { LoginPage } from '../login/login';
/**
 * Generated class for the CriarContaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-criar-conta',
  templateUrl: 'criar-conta.html',
})
export class CriarContaPage {
  public imageURL:any = "assets/images/newUser-b.png";
  public signupForm: FormGroup;
  cont = false;
  public singup:any = [];
  public imageuid;
  public myPhotosRef: any;
  public fotooff: any ="";
  public myPhoto: any = null;
  public myPhotoURL: any;
  public loading: Loading;
  public loading2: Loading;
  cargos:any = [];
  setores:any = [];
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              formBuilder: FormBuilder,
              private firebaseProvider: FirebaseProvider,
              private authProvider: AutenticacaoProvider,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private actionSheetCtrl: ActionSheetController,
              private toastCtrl: ToastController,
              private camera: Camera,
              private platform: Platform,
              private viewCtrl: ViewController,
              private backgroundMode: BackgroundMode){
  this.setoresOn();
  this.cargosOn();
	this.imageuid = this.generateUUID();
  this.signupForm = formBuilder.group({
    email: ["",
        Validators.compose([Validators.required, EmailValidator.isValid])
        ],
    password: ["",
          Validators.compose([Validators.minLength(6), Validators.required])
        ],
    setor: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],
    cargo: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],
    nome: ["",
        Validators.compose([Validators.minLength(1), Validators.required])
        ],
    telefone: ["",
        Validators.compose([Validators.minLength(1), Validators.required])
      ]	 
  });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CriarContaPage');
  }

  setoresOn(){
   this.firebaseProvider.refOn("config/setores").on("value",(setores:any)=>{
    console.log("setores: ",setores.val());
     this.setores = setores.val();
     console.log("setores: ",this.setores);
   });
  }


  cargosOn(){
    this.firebaseProvider.refOn("config/cargos").on("value",(cargos:any)=>{
      console.log("cargos: ",cargos.val());
      this.cargos = cargos.val();
      console.log("cargos: ",this.cargos);
    });
  }

  
  signupUser(): void {
    console.log("signupUser:",this.signupForm.value);
		if (!this.signupForm.valid ){
			console.log("Complete o formulário, valor atual: ",this.signupForm.value);
		}else{
          this.cont = true;
          let email: string = this.signupForm.value.email;
          let password: string = this.signupForm.value.password;
          let nome: string = this.signupForm.value.nome;
          let setor: string = this.signupForm.value.setor;
          let cargo: string = this.signupForm.value.cargo;
          let telefone: string = this.signupForm.value.telefone;
          this.authProvider.getModulos().then(modulos=>{
              this.singup = {
                cargo:cargo,
                email:email,
                senha:password,
                imagem:this.imageURL,
                imagemuid:this.imageuid,
                modulos:modulos,
                nome:nome,
                perfil:"user",
                setor:setor,  
                telefone: telefone
              }
              console.log("singup: ", this.singup);
              this.authProvider.criarConta(this.singup).then( user => {
                this.loading.dismiss().then(() => {
                  const confirm = this.alertCtrl.create({
                    title: 'Enviamos um link de confirmação para o seu email '+email,
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
                  confirm.present();

                  this.navCtrl.setRoot(HomePage);
                });
              },error =>{
                  this.cont = false;
                  if(error == "Error: The email address is already in use by another account."){
                    this.loading.dismiss().then(() => {
                        const alert2: Alert = this.alertCtrl.create({
                        title:'O endereço de e-mail já está sendo usado por outra conta.',
                        buttons: ["Ok"]
                    });
                    alert2.present();
                    });
                  }else{
                    this.loading.dismiss().then(() => {
                      const alert2: Alert = this.alertCtrl.create({
                        title:'Ocorreu algum probelma inesperado, Por favor, tente novamente',
                        subTitle: this.singup,
                        message: error,
                        buttons: [{ text: "Ok", role: "cancel" }]
                      });
                      alert2.present();
                    });
                  }
                }).catch(error => {
                    this.cont = false;
                    this.loading.dismiss().then(() => {
                      const alert2: Alert = this.alertCtrl.create({
                          title:'Ocorreu algum probelma inesperado, Por favor, tente novamente',
                          subTitle: this.singup,
                          message: error,
                          buttons: [{ text: "Ok", role: "cancel" }]
                      });
                      alert2.present();
                    });					
                    console.error(error);
                  });
                  this.loading = this.loadingCtrl.create();
                  this.loading.present();
                  
              
          });
    }
	}
	
	presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Adicionar foto',
      buttons: [
        { icon: 'md-image',
          text: 'Galeria',
          role: 'destructive',
          handler: () => {
           this.selectPhoto();
          }
        },{icon:'md-camera',
          text: 'Camera',
          handler: () => {
           this.takePhoto();
          }
        },{
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
      this.myPhoto = imageData;
      this.fotooff = imageData;
      this.loading2 = this.loadingCtrl.create();
      this.loading2.present();
      this.uploadPhoto();
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

			this.myPhoto = imageData;
			this.fotooff = imageData;
      this.loading2 = this.loadingCtrl.create();
      this.loading2.present();
      this.uploadPhoto();
			
    }, error => {

		 //alert("ERROR -> " + JSON.stringify(error));
		 
    });
  }
	
	 public uploadPhoto(): void { 
		this.firebaseProvider.uploadFotoPerfil(this.imageuid,this.myPhoto).then((resp:any)=>{
      if(resp.status == "OK"){
        console.log('File available at', resp.body);
        this.imageURL = resp.body;
        this.loading2.dismiss();
      }else{
        this.loading2.dismiss();
        let alert = this.alertCtrl.create({
          title:"Erro no carregamento da imagem",
          subTitle:"Tente novamente"
        });
        alert.present();
      }
    });
	}
	
	private generateUUID(): any {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
	}

	toast(status) {

    let toast = this.toastCtrl.create({
      message:status,
      duration: 4000
    });
    toast.present();
  }
	
	ionViewDidLeave(){
		if( this.imageURL != "assets/images/newUser-b.png" && this.cont == false ){
			 console.log("deletar foto de perfil que não será usada");
			this.authProvider.delImage(this.imageURL).then(()=>{
        console.log("foto deletada");
      });
      }
		
	}
}
