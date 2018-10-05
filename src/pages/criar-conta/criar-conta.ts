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
import { SplashScreen } from '@ionic-native/splash-screen';
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
  public ConfirmarForm: FormGroup;
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
  confirme = true;
  UserPerfil:any = [];
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
              private backgroundMode: BackgroundMode,
              private splashScreen: SplashScreen){
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
    Cpassword: ["",
              Validators.compose([Validators.minLength(6), Validators.required])
            ],
    cpf: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],
    nome: ["",
        Validators.compose([Validators.minLength(1), Validators.required])
        ],
    endereco: ["",
            Validators.compose([Validators.minLength(1), Validators.required])
            ],
    telefone: ["",
            Validators.compose([Validators.minLength(1), Validators.required])
              ],
    celular: ["",
            Validators.compose([Validators.minLength(1), Validators.required])
             ],
    cep: ["",
            Validators.compose([Validators.minLength(1), Validators.required])
         ],
    semestre: ["",
                 Validators.compose([Validators.minLength(1), Validators.required])
        ],
    curso: ["",
                Validators.compose([Validators.minLength(1), Validators.required])
             ] 
  });
  
  this.ConfirmarForm = formBuilder.group({
    cpf: ["",
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

  confirmar(){
    if (this.ConfirmarForm.valid) {
      let loading = this.loadingCtrl.create({
        spinner: 'ios',
        duration: 30000
      });
      loading.present();
      let ok = false;
      console.log(String(this.ConfirmarForm.value.cpf));
      this.firebaseProvider.refOn("user_perfil/").orderByChild('cpf').equalTo(String(this.ConfirmarForm.value.cpf)).once("value",infoUser=>{
        console.log("infoUser: ",infoUser.val());
        if(infoUser.val()){
          console.log(infoUser.val());
          this.firebaseProvider.TransformList(infoUser).then(User=>{
            if(User[0].confirmado == false){
              console.log("User: ",User);
              ok = true;
              loading.dismiss();
              let toast = this.toastCtrl.create({
                message:"Bem vindo "+User[0].nome,
                duration: 3000
              });
              toast.present();
              this.confirme = false;
              this.UserPerfil = User[0];
            }else{
              ok = true;
              loading.dismiss();
              let toast = this.toastCtrl.create({
              message:"Já existe uma conta neste CPF.",
                duration: 3000
              });
              toast.present();
            }
          });
        }else{
          ok = true;
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title:"Usuário não encontrado.",
            subTitle:"Verifique sua situação finaceira no SIM"
          });
          alert.present();
        }
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
          console.log("OK");
        }
        });

    }else{
      let alert = this.alertCtrl.create({
        title:"Informe seu CPF"
      });
      alert.present();
    }
    
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
		if (!this.signupForm.controls.email.valid || !this.signupForm.controls.password.valid || !(this.signupForm.value.password == this.signupForm.value.Cpassword)){
      console.log("Complete o formulário, valor atual: ",this.signupForm.value);
      const alert2: Alert = this.alertCtrl.create({
        title:'Preencha as informações corretamente.',
        buttons: [{ text: "Ok"}]
      });
      alert2.present();
		}else{    
              this.cont = true;
              let email: string = this.signupForm.value.email;
              let password: string = this.signupForm.value.password;
              let nome: string = this.signupForm.value.nome;
              let setor: string = this.signupForm.value.setor;
              let cargo: string = this.signupForm.value.cargo;
              let telefone: string = this.signupForm.value.telefone;
              this.authProvider.getModulos().then(modulos=>{
              this.signupForm.value.imagem = this.imageURL;
              this.signupForm.value.imagemuid = this.imageuid;
              this.signupForm.value.modulos = modulos;
              this.signupForm.value.matricula = this.UserPerfil.matricula;
              this.signupForm.value.password = null;
              this.signupForm.value.Cpassword = null;
              this.signupForm.value.confirmado = true;
              console.log("singup: ", this.signupForm.value);
              this.authProvider.criarConta(this.signupForm.value,password).then( user => {
                this.loading.dismiss().then(() => {
                  console.log("splashScreen show");
                });
              },error =>{
                  this.cont = false;
                  if(error == "Error: The email address is already in use by another account."){
                    this.signupForm.value.password = password;
                    this.signupForm.value.Cpassword = password;
                    this.loading.dismiss().then(() => {
                        const alert2: Alert = this.alertCtrl.create({
                        title:'O endereço de e-mail já está sendo usado por outra conta.',
                        buttons: ["Ok"]
                    });
                    alert2.present();
                    });
                  }else{
                    this.signupForm.value.password = password;
                    this.signupForm.value.Cpassword = password;
                    this.loading.dismiss().then(() => {
                      const alert2: Alert = this.alertCtrl.create({
                        title:'Ocorreu algum probelma inesperado, Por favor, tente novamente (c-C.ts)',
                        subTitle: this.singup,
                        message: error,
                        buttons: [{ text: "Ok", role: "cancel" }]
                      });
                      alert2.present();
                    });
                  }
                }).catch(error => {
                    this.cont = false;
                    this.signupForm.value.password = password;
                    this.signupForm.value.Cpassword = password;
                    this.loading.dismiss().then(() => {
                      const alert2: Alert = this.alertCtrl.create({
                          title:'Ocorreu algum probelma inesperado, Por favor, tente novamente (c-C.ts)',
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
