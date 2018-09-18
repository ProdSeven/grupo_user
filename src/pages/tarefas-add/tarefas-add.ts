import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, ModalController, Platform, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { BackgroundMode } from '@ionic-native/background-mode';
/**
 * Generated class for the TarefasAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:"tarefas-add"
})
@Component({
  selector: 'page-tarefas-add',
  templateUrl: 'tarefas-add.html',
})
export class TarefasAddPage {
  public signupForm: FormGroup;
  public signupForm_edit: FormGroup;
  public subtarefaForm: any;
  tarefa = [];
  subtarefas:any = [];
  subtarefas2:any = [];
  @ViewChild('myInput') myInput: ElementRef;
  @ViewChild('Recurso') Recurso: ElementRef;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private formBuilder: FormBuilder, 
              private viewCtrl: ViewController,
              private alertCtrl: AlertController,
              private firebaseProvider: FirebaseProvider,
              private modalCtrl: ModalController,
              private platform: Platform,
              private backgroundMode: BackgroundMode,
              private loadingCtrl: LoadingController) {

                this.platform.ready().then(() => {
                  this.platform.registerBackButtonAction(() => {
                      this.viewCtrl.dismiss();
                  })
                });
                this.signupForm = this.formBuilder.group({
                  titulo: ["",
                        Validators.compose([Validators.maxLength(30), Validators.required])
                      ],
                  desc: ["",
                        Validators.compose([Validators.maxLength(300), Validators.required])
                      ],
                  dataI: ["",
                        Validators.compose([Validators.minLength(1), Validators.required])
                      ],
                  dataF: ["",
                      Validators.compose([Validators.minLength(1), Validators.required])
                    ],
                  recurso: ["",
                        Validators.compose([Validators.maxLength(300), Validators.required])
                    ]
                });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TarefasAddPage');
  }

  resize() {
    this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
  }

  resizeRecurso() {
    this.Recurso.nativeElement.style.height = this.Recurso.nativeElement.scrollHeight + 'px';
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

  criarTarefa(){
    if (this.signupForm.valid){
      this.voltar();
      let loading = this.loadingCtrl.create({
        spinner: 'ios',
        duration: 30000
      });
      loading.present();
      let ok = false;
      let dataFt = this.signupForm.value.dataF;
      dataFt = dataFt.split("-");
      let dataF = dataFt[2]+"-"+dataFt[1]+"-"+dataFt[0];
      let dataIt = this.signupForm.value.dataI;
      dataIt = dataIt.split("-");
      let dataI = dataIt[2]+"-"+dataIt[1]+"-"+dataIt[0];
      this.signupForm.value.dataF = dataF;
      this.signupForm.value.dataI = dataI;
      this.signupForm.value.arquivada = false;
      this.signupForm.value.parada = false;
    console.log("singupForm: ",this.signupForm.value);
    this.signupForm.value.subtarefas = this.subtarefas2;
    let id = this.generateUUID();
    this.signupForm.value.id = id;
    console.log("signupForm.value: ",this.signupForm.value); 
    this.firebaseProvider.getuser().then(user=>{
      this.signupForm.value.idCriador = user;
      this.firebaseProvider.set("geral/tarefas/"+this.signupForm.value.id,this.signupForm.value).then(()=>{
        this.firebaseProvider.update("func_perfil/"+user+"/tarefas/"+this.signupForm.value.id,{id:this.signupForm.value.id}).then(()=>{
          console.log(this.subtarefas.length+" subtarefas");
          if(this.subtarefas.length > 0){
            for (let i = 0; i < this.subtarefas.length; i++){
              if(this.subtarefas[i].participantes.length > 0){
                console.log(this.subtarefas[i].participantes.length+" participante");
                for (let j = 0; j < this.subtarefas[i].participantes.length; j++){
                  console.log("participante "+j);
                    this.firebaseProvider.update("func_perfil/"+this.subtarefas[i].participantes[j]+"/tarefas/"+this.signupForm.value.id,{id:this.signupForm.value.id}).then(()=>{
                      console.log("participante "+j+", id: "+this.subtarefas[i].participantes[j]);
                    });
                  }
              }
              if(i == this.subtarefas.length - 1){
                let idlog = this.generateUUID();
                let data = this.firebaseProvider.DataHora();
                this.firebaseProvider.set("geral/logTarefas/"+idlog,{
                      id:idlog,
                      data:data,
                      procedimento:"criou a tarefa < "+this.signupForm.value.titulo+" > com o id ( "+this.signupForm.value.id+" )",
                      user:user
                }).then(()=>{
                  ok = true;
                  loading.dismiss();
                });
              }
            }
          }else{
            let idlog = this.generateUUID();
            let data = this.firebaseProvider.DataHora();
            this.firebaseProvider.set("geral/logTarefas/"+idlog,{
                  id:idlog,
                  data:data,
                  procedimento:"criou a tarefa < "+this.signupForm.value.titulo+" > com o id ( "+this.signupForm.value.id+" )",
                  user:user
            }).then(()=>{
              ok = true;
              loading.dismiss();
            });
          }
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
          title:"Tarefa criada com sucesso!"
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

  addSubtarefa(){
    let modal = this.modalCtrl.create("add-subtarefa");
      this.platform.registerBackButtonAction(() => {
        this.viewCtrl.dismiss();
      });
      modal.onDidDismiss(data => {
        this.platform.registerBackButtonAction(() => {
          this.viewCtrl.dismiss();
        });
        console.log("onDidDismiss: ",data);
        if (data == undefined) {
          console.log("data indefinida");
        }else{
          let id = data.sub.id;
          id = ""+id+"";
          this.subtarefas2[id] = data.sub;
          console.log("subtarefas: ",this.subtarefas2);
          this.subtarefas.push(data.sub);
        }
      });
      modal.present();
  }

  rmSubtarefa(sub){
        for(let i = 0; i < this.subtarefas.length; i++){
          if(sub == this.subtarefas[i]){
            this.subtarefas.splice(i,1);
            delete this.subtarefas2[""+sub.id+""];
            console.log("Item subtarefas2: ", this.subtarefas2);
            console.log("Item removido: ", this.subtarefas);
            console.log("Item removido/sub: ", sub);
            break;
          }
        }
  }
}
