import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, Alert, ToastController, Platform, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { BackgroundMode } from '@ionic-native/background-mode';
import { ItemPage } from '../item/item';

/**
 * Generated class for the CautelaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cautela',
  templateUrl: 'cautela.html',
})
export class CautelaPage {
  public signupForm: FormGroup;
  public signupForm_edit: FormGroup;
  usuarios = [];
  items:any = [];
  usuPesq = [];
  aprovadores = [];
  aprovacao = [];
  cautela:any = [];
  cautela_edit:any = [];
  modo;
  modulo = [];
  editar = false;
  total = 0;
  setores = [];
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private formBuilder: FormBuilder,
              private firebaseProvider: FirebaseProvider,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private platform: Platform,
              private backgroundMode:BackgroundMode,
              private modalCtrl: ModalController){

    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        if(!this.viewCtrl.enableBack()) { 
          this.backgroundMode.moveToBackground();
        }else{
            this.navCtrl.pop();
        } 
      });
    });
    
    this.aprovadores = [];
    this.signupForm = this.formBuilder.group({
		  titulo: ["",
           Validators.compose([Validators.maxLength(30), Validators.required])
					],
		  data: ["",
					 Validators.compose([Validators.minLength(1), Validators.required])
					],
		  setor: ["",
					 Validators.compose([Validators.minLength(1), Validators.required])
					]
    });
    
    this.signupForm_edit = this.formBuilder.group({
		  titulo_edit: ["",
           Validators.compose([Validators.maxLength(30), Validators.required])
					],
		  data_edit: ["",
					 Validators.compose([Validators.minLength(1), Validators.required])
					],
		  setor_edit: ["",
					 Validators.compose([Validators.minLength(1), Validators.required])
					]
    });
  }

  ionViewDidLoad() {
    let id = this.navParams.get('cautela'); 
    
    if(id == "add"){
      this.cautela = id;
      this.setoresOn();
      this.getUsers();
    }else{
      id = id.id;
      this.firebaseProvider.refOn("administrativo/cautelas/"+ id).once("value",list=>{
        console.log("list, ",list.val());
        this.cautela = list.val();
        this.modo = this.navParams.get('modo'); 
        console.log('cautela/cautela.ts', this.cautela);
        console.log('modo', this.modo);
            this.aprovacao = this.cautela.aprovacao;
            this.total = this.cautela.total;
            this.items = this.cautela.items;
            this.moduloOn();
            this.setoresOn();
            this.getUsers();  
      });
    }
    
    console.log('ionViewDidLoad CautelaPage');
  }

  moduloOn(){
    this.firebaseProvider.getuser().then(user=>{
      this.firebaseProvider.refOn("/func_perfil/"+user+"/modulos/0").on("value",(resp:any)=>{
        this.modulo = resp.val();
        console.log("modulo: ",this.modulo);
        this.getAprovadores(this.cautela.id);
      });
    });
  }
  setoresOn(){
    this.firebaseProvider.refOn("config/setores").on("value",(setores:any)=>{
      this.setores = setores.val();
      console.log("setores: ", setores.val());
    });
  }

  getUsers(){
    this.firebaseProvider.refOn("func_perfil/").once("value",(resp:any)=>{
      console.log("resp: ",resp.val());
      this.firebaseProvider.TransformList(resp).then((list:any)=>{
        this.usuarios = list;
        console.log("usuarios: ",this.usuarios);
      });
    });
  }
  
  getItems(ev: any) { 
    this.usuPesq = this.usuarios; 
    const val = ev.target.value; 
    if (val && val.trim() != '') { 
      this.usuPesq = this.usuPesq.filter((usuario) => {
        return (usuario.nome.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }else{ 
      this.usuPesq = [];
    }
  } 

  getAprovadores(id){
    this.firebaseProvider.refOn("administrativo/cautelas/"+id+"/aprovacao").on("value",(resp:any)=>{
      console.log("resp: ",resp.val());
      this.aprovadores = [];
      let result = resp.val();
      if(result){
      for (let i = 0; i < result.length; i++) {
        this.firebaseProvider.object("func_perfil/"+result[i].id).then((object:any)=>{
            if(result[i].aprovado == true){
              object.aprovado = "secondary"; 
              if(result[i].obs) {object.obs = result[i].obs;}
              this.aprovadores.push(object);
            }
            if(result[i].aprovado == false){
              object.aprovado = "danger"; 
              if(result[i].obs) {object.obs = result[i].obs;}
              this.aprovadores.push(object);
            }
            if(result[i].aprovado == "wait"){
              object.aprovado = "dark"; 
              this.aprovadores.push(object);
            }
            if(result[i].aprovado == "reuniao"){
              object.aprovado = "primary"; 
              if(result[i].obs) {object.obs = result[i].obs;}
              this.aprovadores.push(object);
            }
            if(result[i].aprovado == "atencao"){
              object.aprovado = "yell";
              if(result[i].obs) {object.obs = result[i].obs;}
              this.aprovadores.push(object);
            }
        });        
      }}
    });
  }

  addAprovador(usuario){
    if(this.aprovadores.length != 0){
    for (let i = 0; i < this.aprovadores.length; i++) {
      if(this.aprovadores[i]){
      if(usuario.id == this.aprovadores[i].id){
        console.log("Aprovador ja adicionado: "+ this.aprovadores );
        break;
      }
      if(i == this.aprovadores.length-1){
        console.log("Aprovador"+ usuario.nome + " adicionado");
        this.aprovadores.push(usuario); 
        this.aprovacao.push({id:usuario.id,aprovado:"wait",obs:false});
        this.usuPesq = [];
      }}else{
        console.log("Erro");
      }
     }}else{
        console.log("Aprovador"+ usuario.nome + " adicionado");
        this.aprovadores.push(usuario);
        this.aprovacao.push({id:usuario.id,aprovado:"wait",obs:false});
        this.usuPesq = [];
     }
    
  }

  rmAprovador(usuario){
    console.log("Aprovador"+ usuario.nome + " removido");
    for (let i = 0; i < this.aprovadores.length; i++) {
     if(usuario.id == this.aprovadores[i].id){
       this.aprovadores.splice(i,1);
       this.aprovacao.splice(i,1);
       console.log("Aprovador removido: "+ this.aprovadores );
     }
    }
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  criarCautela(){
    if (!this.signupForm.valid ) {
			console.log(`Complete o formulário, valor atual: ${this.signupForm.value}`);
		}else{
      console.log("aprovadores: ",this.aprovadores);
      if(this.aprovadores.length != 0 && this.items.length != 0){
        let dataA = this.signupForm.value.data;
        dataA = dataA.split("-");
        let dataF = dataA[2]+"-"+dataA[1]+"-"+dataA[0];
        let data = dataF;
        let id = this.generateUUID();
        let setor = this.signupForm.value.setor;
        let titulo = this.signupForm.value.titulo;
        let aprovacao = this.aprovacao;

        let cautela = {
          data:data,
          id:id,
          setor:setor,
          titulo:titulo,
          aprovacao:aprovacao,
          items:this.items,
          total:this.total
        }

        console.log("Nova cautela: ",cautela);
        this.firebaseProvider.set("administrativo/cautelas/"+id,cautela).then(resp=>{
          for (let i = 0; i < this.aprovacao.length; i++) {
            this.firebaseProvider.update("func_perfil/"+this.aprovacao[i].id+"/cautelas_pa/"+id,{id:id}).then(resp=>{

            });
            if(i == this.aprovacao.length-1){
              console.log("Nova cautela criada: ",resp);
              this.dismiss();
            }
          }
        });
      }else{
        if(this.aprovadores.length == 0){
          const alert: Alert = this.alertCtrl.create({
            message: "É obrigatório adicionar um aprovador.",
            buttons: ["Ok"]
          });
          alert.present();
        }else{
          if(this.items.length == 0){
            const alert: Alert = this.alertCtrl.create({
              message: "É obrigatório adicionar um item.",
              buttons: ["Ok"]
            });
            alert.present();
          }
        }
      }
    } 
  }

  votar(cautela,aprovado,obs?){
    if(!obs){
      obs = false       
    }
  this.firebaseProvider.getuser().then(user=>{
    this.firebaseProvider.list("administrativo/cautelas/"+cautela.id+"/aprovacao").then((list:any)=>{
      for(let i = 0; i < list.length; i++) {
        if(list[i].id == user){
          this.firebaseProvider.update("administrativo/cautelas/"+cautela.id+"/aprovacao/"+i,{aprovado:aprovado,obs:obs}).then((list:any)=>{
            this.firebaseProvider.update("func_perfil/"+user+"/cautelas_pa/"+cautela.id,{id:null}).then(()=>{
              console.log("Cautela votada para: ",aprovado);
              this.modo = "view";
            });
          });
        }
      }
    });
  });
  }

  alert(cautela,aprovado){
    if(aprovado == false){
      const alert: Alert = this.alertCtrl.create({
        message: "Deseja realmente recusar esta cautela?.",
        inputs: [
          {
            name: 'obs',
            placeholder: 'Observação',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {
              console.log('Saved clicked');
              if(data.obs){
                this.votar(cautela,false,data.obs);
              }else{
              this.votar(cautela,false);
              }
            }
          }
        ]
      });
      alert.present();
    }
    if(aprovado == true){
      const alert: Alert = this.alertCtrl.create({
        message: "Deseja realmente aprovar esta cautela?",
        inputs: [
          {
            name: 'obs',
            placeholder: 'Observação',
          },
        ],
        buttons: [
          {
            text: 'Não',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Sim',
            handler: data => {
              console.log('Saved clicked');
              if(data.obs){
                this.votar(cautela,true,data.obs);
              }else{
              this.votar(cautela,true);
              }
            }
          }
        ]
      });
      alert.present();
    }
    if(aprovado == "atencao"){
      const alert: Alert = this.alertCtrl.create({
        message: "Deseja realmente aprovar esta cautela com restrições?.",
        inputs: [
          {
            name: 'obs',
            placeholder: 'Observação',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {
              console.log('Saved clicked');
              if(data.obs){
                this.votar(cautela,"atencao",data.obs);
              }else{
              this.votar(cautela,"atencao");
              }
            }
          }
        ]
      });
      alert.present();
    }
    if(aprovado == "reuniao"){
      const alert: Alert = this.alertCtrl.create({
        message: "Deseja realmente solicitar uma reunião para esta cautela?",
        inputs: [
          {
            name: 'obs',
            placeholder: 'Observação',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {
              console.log('Saved clicked');
              if(data.obs){
                this.votar(cautela,"reuniao",data.obs);
              }else{
              this.votar(cautela,"reuniao");
              }
            }
          }
        ]
      });
      alert.present();
    }
    
  }

  alertDelete(cautela){
    const alert: Alert = this.alertCtrl.create({
        message: "Deseja realmente excluir esta cautela?",
        buttons: [
          {
            text: 'Não',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Sim',
            handler: data => {
              this.delete(cautela);
            }
          }
        ]
      });
      alert.present();
  }

  delete(cautela){
    console.log("Deletar cautela: ",cautela);
    this.dismiss();
    this.firebaseProvider.delete("administrativo/cautelas/"+cautela.id).then(resp=>{ 
      for (let i = 0; i < cautela.aprovacao.length; i++) {
        this.firebaseProvider.delete("func_perfil/"+cautela.aprovacao[i].id+"/cautelas_pa/"+cautela.id).then(resp=>{
          console.log("Cautela deletada do usuario: ", cautela.aprovacao[i].id);
        });
        if(i == cautela.aprovacao.length-1){
          const toast = this.toastCtrl.create({
            message:"cautela excluida",
            duration:2000
          });
          toast.present();
        }
      }
    });
  }

  addItem(){
    const alert: Alert = this.alertCtrl.create({
      message: "Adicionar item.",
      inputs: [
        {
          name: 'id',
          placeholder: 'Identificação',
        },
        {
          name: 'desc',
          placeholder: 'Descricao',
        },
        {
          name: 'quant',
          placeholder: 'Quantidade',
        },
        {
          name: 'valor',
          placeholder:'Valor'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log("adicionando/items: ", this.items);
            if(data.id && data.quant && data.valor){
              if(this.editar == true){
                let total = this.cautela_edit.total;
                let valor = data.valor.replace(",",".");
                let item = {id:data.id,descricao:data.desc,quantidade:data.quant,valor:valor};
                total += parseFloat(valor) * parseFloat(data.quant);
                let quant = parseInt(data.quant);
                if(total && quant){
                  console.log("items",this.cautela_edit.items);
                  this.cautela_edit.total = total;
                  if(this.cautela_edit.items == undefined){
                    this.cautela_edit.items = [];
                    this.cautela_edit.items.push(item);
                  }else{
                    this.cautela_edit.items.push(item);
                  }
                  console.log("Item adicionado/cautela_edit: ", this.cautela_edit.items);
                  console.log("Item adicionado/items: ", this.items);
                }else{}
              }else{
                let total = this.total;
                let valor = data.valor.replace(",",".");
                let item = {id:data.id,descricao:data.desc,quantidade:data.quant,valor:valor};
                total += parseFloat(valor) * parseFloat(data.quant);
                let quant = parseInt(data.quant);
                if(total && quant){
                  console.log("items",this.items);
                  this.total = total;
                  this.items.push(item);
                  console.log('Item adicionado');
                }else{}
              }
            }else{}
          }
        }
      ]
    });
    alert.present();
  }

  deletarItem(item){
    if(this.editar == true){
      if(this.cautela_edit.items.length > 0){
        this.cautela_edit.total -= item.valor * item.quantidade;
        for(let i = 0; i < this.cautela_edit.items.length; i++){
          if(item == this.cautela_edit.items[i]){
            this.cautela_edit.items.splice(i,1);
            console.log("Item removido: ", this.cautela_edit.items);
            console.log("Item removido: ", this.items);
            break;
          }
         }
        }
    }else{
      if(this.items.length > 0){
        this.total -= item.valor * item.quantidade;
        for(let i = 0; i < this.items.length; i++){
          if(item == this.items[i]){
            this.items.splice(i,1);
            console.log("Item removido: ", this.items);
            break;
          }
        }
        }
    }
  }

  deletarItem_edit(item){
      if(this.cautela_edit.items.length > 0){
        let valorMenos:any = item.valor * item.quantidade
        valorMenos = valorMenos + "";
        valorMenos = valorMenos.trim();
        valorMenos = parseFloat(valorMenos);
        valorMenos = valorMenos.toFixed(2);
        let valorTemp:any = this.cautela_edit.total;
        valorTemp -= valorMenos;
        valorTemp = valorTemp.toFixed(2);
        console.log("valorTemp : ", valorTemp);
        console.log("valorMenos : ", valorMenos);
        this.cautela_edit.total = valorTemp;
        console.log("cautela_edit.total : ", this.cautela_edit.total);
        for(let i = 0; i < this.cautela_edit.items.length; i++){
          if(item == this.cautela_edit.items[i]){
            this.cautela_edit.items.splice(i,1);
            console.log("Item removido_edit: ", this.cautela_edit.items);
            console.log("Item removido_edit/items: ", this.items);
            break;
          }
         }
        }
  }

  Editar(){
    console.log("Editar/cautela");
    if (this.editar == false) {
        this.editar = true;
        this.signupForm_edit.value.data_edit = this.cautela.data;
        this.cautela_edit = this.cautela;
        console.log("cautela_edit = this.cautela:",this.cautela_edit , " + " , this.cautela);
        console.log("data_edit: ",this.signupForm_edit.value.data_edit);
        console.log("titulo_edit: ",this.signupForm_edit.value.titulo_edit);
        console.log("setor_edit: ",this.signupForm_edit.value.setor_edit);
    }else{
      if (!this.signupForm_edit.valid ) {
        console.log(`Complete o formulário, valor atual: ${this.signupForm_edit.value}`);
      }else{
        console.log("aprovadores: ",this.aprovadores);
        let data;
        if(this.signupForm_edit.value.data_edit != this.cautela.data){
          let dataA = this.signupForm_edit.value.data_edit;
          dataA = dataA.split("-");
          let dataF = dataA[2]+"-"+dataA[1]+"-"+dataA[0];
          data = dataF;
        }else{
          data = this.cautela.data;
        }
        
        let id = this.cautela.id;
        let setor = this.signupForm_edit.value.setor_edit;
        let titulo = this.signupForm_edit.value.titulo_edit;
        let aprovacao = this.aprovacao;

        let cautela = {
          data:data,
          id:id,
          setor:setor,
          titulo:titulo,
          aprovacao:aprovacao,
          items:this.cautela_edit.items,
          total:this.cautela_edit.total
        }
  
          console.log("Atualizando cautela: ",cautela);
          this.firebaseProvider.update("administrativo/cautelas/"+id,cautela).then(resp=>{
            console.log("Cautela atualizada: ",cautela);
            for (let i = 0; i < aprovacao.length; i++){
              this.firebaseProvider.update("/func_perfil/"+aprovacao[i].id+"/cautelas_pa/"+id,{editado:true}).then(()=>{
                console.log("Cautela editada:");
                this.firebaseProvider.delete("/func_perfil/"+aprovacao[i].id+"/cautelas_pa/"+id+"/editado").then(()=>{
                  console.log("Editada excluido:");
                });
              });
            }
            this.cautela = cautela;
            this.editar = false;
            this.cautela_edit = [];
            this.signupForm_edit.value.data_edit = null;
            console.log("data_edit: ",this.signupForm_edit.value.data_edit);
            this.signupForm_edit.value.titulo_edit = null;
            console.log("titulo_edit: ",this.signupForm_edit.value.titulo_edit);
            this.signupForm_edit.value.setor_edit = null;
            console.log("setor_edit: ",this.signupForm_edit.value.setor_edit);
          });
      }
    }
  }

  cancelEdit(){
    this.firebaseProvider.refOn("administrativo/cautelas/"+ this.cautela.id).once("value",list=>{
      this.cautela = list.val();
    });
    this.editar = false;
    console.log("cautela_edit: ",this.cautela_edit);
    this.cautela_edit = [];
    this.signupForm_edit.value.data_edit = null;
    console.log("cautela: ",this.cautela);
    console.log("data_edit: ",this.signupForm_edit.value.data_edit);
    this.signupForm_edit.value.titulo_edit = null;
    console.log("titulo_edit: ",this.signupForm_edit.value.titulo_edit);
    this.signupForm_edit.value.setor_edit = null;
    console.log("setor_edit: ",this.signupForm_edit.value.setor_edit);
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

  modalItem(item){
    let modal = this.modalCtrl.create(ItemPage, { item: item });
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
  
  
  ionViewDidLeave(){
    this.firebaseProvider.refOff("administrativo/cautelas/"+this.cautela.id+"/aprovacao");
    this.firebaseProvider.refOff("config/setores");
      console.log("off/cautela");
    this.cautela_edit = [];
	}

}