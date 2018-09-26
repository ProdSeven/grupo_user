import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, ViewController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { BackgroundMode } from '@ionic-native/background-mode';

/**
 * Generated class for the RequePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:'page-reque'
})
@Component({
  selector: 'page-reque',
  templateUrl: 'reque.html',
})
export class RequePage {
  signupForm:any;
  requerimeto:any = [];
  infoUser:any = [];
  requerimentos:any = null;
  requePesq = null;
  @ViewChild('myInput') myInput: ElementRef;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private formBuilder: FormBuilder, 
              private firebaseProvider: FirebaseProvider,
              private modalCtrl: ModalController,
              private platform: Platform,
              private viewCtrl: ViewController,
              private backgroundMode: BackgroundMode
              ) {
  this.signupForm = this.formBuilder.group({
    academico: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],
    corpo: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],
    ano: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],
    cep: ["",
        Validators.compose([Validators.minLength(1), Validators.required])
      ],
    curso: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
      ],
    endereco: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
      ],
    telefone: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
      ],
    turma: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
      ],
    turno: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
      ],
    semestre: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
      ]
  });
  this.userOn();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequePage');
  }

  resize() {
    this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
  }

  requeOn(){
    this.firebaseProvider.getuser().then((user:any)=>{
          this.firebaseProvider.refOn("SIM/requerimentos/").orderByChild('idAcad').equalTo(user).on("value",requeSnap=>{
            this.firebaseProvider.TransformList(requeSnap).then(reques=>{
              console.log("reques: ", reques);
              this.requerimentos = reques;
            });
          });
    });
  }

  ionViewDidLeave(){
  }

  userOn(){
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOff("user_perfil/"+user);
      this.firebaseProvider.refOn("user_perfil/"+user).on("value",(info:any)=>{
        this.infoUser = info.val();
        this.firebaseProvider.refOff("SIM/requerimentos/");
        this.requeOn();
        console.log("infoUser: ",this.infoUser);
      });
    });
  }

  addReque(){
      let modal = this.modalCtrl.create("page-reque-add");
      modal.onDidDismiss(data => {
        this.platform.registerBackButtonAction(() => {
          if(!this.viewCtrl.enableBack()) { 
            this.backgroundMode.moveToBackground();
          }else{
              this.navCtrl.pop();
          } 
        });
      });
      modal.present();
  }

  getUsers(ev: any) {
    console.log('usuarios/gusuarios', this.requerimentos);
    this.requePesq = this.requerimentos; 
    const val = ev.target.value; 
    if(val && val.trim() != ''){ 
      this.requePesq = this.requePesq.filter((usuario) => {
        return (usuario.academico.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
      if (this.requePesq.length == 0) {
        this.requePesq = this.requerimentos;
        this.requePesq = this.requePesq.filter((usuario) => {
          return (usuario.dia.toLowerCase().indexOf(val.toLowerCase()) > -1);
        });
        console.log("requePesq-dia: ",this.requePesq);
        if (this.requePesq.length == 0) {
          this.requePesq = this.requerimentos;
          this.requePesq = this.requePesq.filter((usuario) => {
            return (usuario.hora.toLowerCase().indexOf(val.toLowerCase()) > -1);
          });
          console.log("requePesq-hora: ",this.requePesq);
        }
      }
      console.log("requePesq: ",this.requePesq);
    }else{
      this.requePesq = null;
    }
  }

  requeInfo(requerimento){
    console.log("requerimento: ",requerimento.id);
    let modal = this.modalCtrl.create("page-reque-info", {id: requerimento.id});
    modal.onDidDismiss(data => {
      this.platform.registerBackButtonAction(() => {
        if(!this.viewCtrl.enableBack()) { 
          this.backgroundMode.moveToBackground();
        }else{
          this.viewCtrl.dismiss();
        }
      });
    });
    modal.present();
  }

}
