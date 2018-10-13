import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
/**
 * Generated class for the RequeAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:"page-reque-add"
})
@Component({
  selector: 'page-reque-add',
  templateUrl: 'reque-add.html',
})
export class RequeAddPage {

  signupForm:any;
  requerimeto:any = [];
  infoUser:any = [];
  RequeTipos = [];
  outro = false;
  Tema = "";
  @ViewChild('myInput') myInput: ElementRef;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private formBuilder: FormBuilder, 
              private firebaseProvider: FirebaseProvider,
              private viewCtrl: ViewController,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private platform: Platform) {

  this.platform.registerBackButtonAction(() => {
    this.viewCtrl.dismiss();
  });
  this.signupForm = this.formBuilder.group({
    academico: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],
    corpo: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],
        /*
    ano: ["",
          Validators.compose([Validators.minLength(1), Validators.required])
        ],*/
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
  this.requeTipos();
  this.userOn();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequePage');
  }

  resize() {
    this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
  }

  requeTipos(){
    this.firebaseProvider.list("config/RequeTipos").then((RequeTipos:any)=>{
      this.RequeTipos = RequeTipos;
    });
  }

  tema(){
    let alert = this.alertCtrl.create();
    alert.setTitle('Setor');

      for (let i = 0; i < this.RequeTipos.length; i++) {
        alert.addInput({
          type: 'radio',
          label: this.RequeTipos[i],
          value: this.RequeTipos[i],
          checked: (this.signupForm.value.tema == this.RequeTipos[i]),
        });
      }

    alert.addButton('Cancelar');
    alert.addButton({
      text: 'Salvar',
      handler: data => {
        if(data != 'Outro'){
          this.outro = false;
          this.Tema = data;
        }else{
          this.outro = true;
          this.Tema = data;
        }
      }
    });
    alert.present();
  }

  userOn(){
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOn("user_perfil/"+user).once("value",(info:any)=>{
        this.infoUser = info.val();
        console.log("infoUser: ",this.infoUser);
      });
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
  
  voltar(){
    this.viewCtrl.dismiss();
  }

  addReque(){
    if (this.signupForm.valid && (this.Tema != 'Outro' && this.Tema != '')){
      this.voltar();
      let loading = this.loadingCtrl.create({
        spinner: 'ios',
        duration: 30000
      });
      loading.present();
      let ok = false;
      let dia = this.firebaseProvider.Dia();
      let hora = this.firebaseProvider.Hora();
      this.signupForm.value.dia = dia;
      this.signupForm.value.hora = hora;
      this.signupForm.value.setor = "SIM";
      this.signupForm.value.situacao = "enviado";
      this.signupForm.value.fila = this.firebaseProvider.fila();
      this.signupForm.value.tema = this.Tema;
    console.log("singupForm: ",this.signupForm.value);
    let id = this.generateUUID();
    this.signupForm.value.id = id;
    console.log("signupForm.value: ",this.signupForm.value); 
    this.firebaseProvider.getuser().then(user=>{
      this.signupForm.value.idAcad = user;
      this.firebaseProvider.set("SIM/requerimentos/"+this.signupForm.value.id,this.signupForm.value).then(()=>{
        this.firebaseProvider.update("user_perfil/"+user+"/requerimentos/"+this.signupForm.value.id,{id:this.signupForm.value.id}).then(()=>{
          console.log("this.signupForm.value: ",this.signupForm.value);
          ok = true;
          loading.dismiss();
        },error=>{
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title:"Houve um erro na comunicação com o servidor",
            subTitle:"não foi possivel efetuar a alteração: "+ error,
          });
          alert.present();
        });
      },error=>{
        loading.dismiss();
        let alert = this.alertCtrl.create({
          title:"Houve um erro na comunicação com o servidor",
          subTitle:"não foi possivel efetuar a alteração: "+ error,
        });
        alert.present();
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
        let alert = this.alertCtrl.create({
          title:"Requerimento enviado com sucesso!"
        });
        alert.present();
        }
      });
    }else{
      let alert = this.alertCtrl.create({
        title:"Preencha os campos corretamente."
      });
      alert.present();
    }
  }
}
