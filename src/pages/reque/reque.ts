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

  userOn(){
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOn("user_perfil/"+user).once("value",(info:any)=>{
        this.infoUser = info.val();
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

}
