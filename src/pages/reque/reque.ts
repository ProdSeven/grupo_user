import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { BackgroundMode } from '@ionic-native/background-mode';
import { HomePage } from '../home/home';

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
  filtro = "Todos";
  requeSnap = null;
  situacoes = ["Todos","enviado","espera","encaminhado","deferido","indeferido","aberto","andamento"];
  @ViewChild('myInput') myInput: ElementRef;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private formBuilder: FormBuilder, 
              private firebaseProvider: FirebaseProvider,
              private modalCtrl: ModalController,
              private platform: Platform,
              private viewCtrl: ViewController,
              private backgroundMode: BackgroundMode,
              private alertCtrl: AlertController
              ) {
      this.platform.registerBackButtonAction(() => {
        if(!this.viewCtrl.enableBack()) { 
          this.navCtrl.setRoot(HomePage);
        }else{
          this.navCtrl.pop();
        }
      });
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
        this.requeSnap = requeSnap;
        console.log("reques: ",requeSnap.val());
        this.requeOrder(requeSnap);
      });
    });
  }

  requeOrder(requeSnap){
    this.requerimentos = [];
        this.firebaseProvider.TransformList(requeSnap).then(reques=>{
          console.log("reques: ",reques);
          this.firebaseProvider.inverteArray(reques).then((requesOrder:any)=>{
            console.log("requesOrder: ",requesOrder);
            for (let j = 0; j < requesOrder.length; j++) {
              if(requesOrder[j].situacao == this.filtro || this.filtro == "Todos"){
                this.requerimentos.push(requesOrder[j]);
              }
              if(j == this.requeOrder.length-1){
                console.log("requerimentos: ",this.requerimentos);
              }
            }
          });
        });
  }

  ionViewDidLeave(){
  }

  Filtro() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Filtro');

    for (let i = 0; i < this.situacoes.length; i++) {
      console.log("situacoes:",this.situacoes[i]);
      alert.addInput({
        type: 'radio',
        label: this.ucFirstAllWords(this.situacoes[i]),
        value: this.Trim(this.situacoes[i]),
        checked: (this.filtro == this.situacoes[i])
      });
    }

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.filtro = data;
        console.log("filtro: ",this.filtro);
        if (this.requeSnap != null) {
          this.requeOrder(this.requeSnap);
        }
      }
    });
    alert.present();
  }

  ucFirstAllWords(str){
    return str.substr(0,1).toUpperCase()+str.substr(1);
  }

  Trim(vlr) {
    while(vlr.indexOf(" ") != -1){
      vlr = vlr.replace(" ", "");
    }
    return vlr;
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
          this.navCtrl.setRoot(HomePage);
        }else{
          this.navCtrl.pop();
        }
      });
    });
    modal.present();
  }

}
