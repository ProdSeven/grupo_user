import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { resolveDefinition } from '@angular/core/src/view/util';
/*
  Generated class for the FirebaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FirebaseProvider {
  user;
  cpf = null;
  constructor() {
    console.log('Hello FirebaseProvider Provider');
  }

  menuItns(id){
    return new Promise((resolve, reject)=>{
      let list:any = [];
			firebase.database().ref("user_perfil/"+id+"/modulos").once("value",userProfileSnapshot=>{
        let result = userProfileSnapshot;
        console.log("menuItns/userProfileSnapshot: ",userProfileSnapshot.val());
        firebase.database().ref("config/setores").once("value",setoresSnap=>{
          console.log("menuItns/setoresSnap: ",setoresSnap.val());
          let setores = setoresSnap;
          setores.forEach(setor => {
              let moduloTemp:any = [];
              list[setor.val()] = [];
              if(setor.val() == "Geral"){
                list[setor.val()].push({title:"Home",component:'home',acesso:true});
                //list[setor.val()].push({title:"Perfil",component:'home',acesso:true});
              }
              result.forEach(modulo => {
              if(modulo.val().acesso == true && modulo.val().title != "Home"){
                moduloTemp = list[setor.val()];
                console.log("moduloTemp: ", moduloTemp);
                console.log("modulo.val().setor/setor.val(): ", modulo.val().setor," / ",setor.val());
                if(modulo.val().setor == setor.val()){
                  moduloTemp.push(modulo.val());
                  list[setor.val()] = moduloTemp;
                  console.log("menuItns/list1: ",list);
                }
              }
            });
          });
        },error=>{
          console.log("menuItns/Erro: ",error);
          resolve("Erro");
        });
          console.log("menuItns/list: ",list);
          resolve(list);
        },error=>{
          console.log("menuItns/Erro: ",error);
          resolve("Erro");
        });
        });
  }

  list(path){ 
    return new Promise((resolve, reject)=>{
			let list = [];
			firebase.database().ref(path).once("value",userProfileSnapshot=>{
				let result = userProfileSnapshot;
				result.forEach(element => {
					list.push(element.val());
        });
        //console.log("result/list: ",list);
				resolve(list);
			},error=>{
        console.log("Erro/list: ",error);
				resolve("Erro");
			});
		  });
  }
  object(path){
    return new Promise((resolve, reject)=>{
			firebase.database().ref(path).once("value",userProfileSnapshot=>{
				let object = userProfileSnapshot.val();
				//console.log("result/object:",object);
				resolve(object);
			},error=>{
        console.log("Erro/object: ",error);
				resolve("Erro");
			});
		  });
  }
  refOn(path){
    return firebase.database().ref(path);
  }
  refOff(path){
    return firebase.database().ref(path).off();
  }


  getuser(){
    return new Promise((resolve,reject)=>{
      const unsubscribe = firebase.auth().onAuthStateChanged((user:any) => {
        console.log("user: ",user.uid);
        if (user) {
          firebase.database().ref("user_perfil/").orderByChild("id").equalTo(user.uid).once("value",perfilUser => {
            this.TransformList(perfilUser).then(userPerfil=>{
              resolve(userPerfil[0].matricula);
              unsubscribe();
            });
          });
        }else{
          resolve("Erro");
        }
      });
  }); 
  }

  getMatricula(cpf){
    return new Promise((resolve,reject)=>{
		  	firebase.database().ref("user_perfil/").orderByChild("cpf").equalTo(cpf).once("value",perfilUser => {
          this.TransformList(perfilUser).then(userPerfil=>{
            resolve(userPerfil[0]);
          });
        });
    }); 
  }

  setCpf(cpf){
    this.cpf = cpf;
  }

  getCpf(){
    return this.cpf;
  }

  TransformList(result){
    return new Promise((resolve, reject)=>{
			  let list = [];
				result.forEach(element => {
					list.push(element.val());
        });
        //console.log("result/TransformList: ",list);
				resolve(list);
		});
  }

  update(path,data){
      return firebase.database().ref(path).update(data);
  }
  set(path,valor){
    return firebase.database().ref(path).set(valor);
  }
  push(path,valor){
    return firebase.database().ref(path).push(valor);
  }
  delete(path){ 
    return firebase.database().ref(path).remove();
  }

  uploadFotoPerfil(imageuid,myPhoto){ 
    let fotoPerfilRef = firebase.storage().ref('image/');
    return new Promise((resolve, reject)=>{
      let uploadTask = fotoPerfilRef.child(imageuid).child('perfil.jpeg')
      .putString(myPhoto, 'base64', { contentType: 'image/jpeg' });
      uploadTask.on('state_changed',(savedPicture:any) => {
        let progress:any = (savedPicture.bytesTransferred / savedPicture.totalBytes) * 100;
        progress = parseInt(progress);
        console.log('Upload is ' + progress + '% done');
      }, error => {
        resolve({status:"Erro"});
			},()=>{
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL)=>{
          console.log('File available at', downloadURL);
          resolve({status:"OK",body:downloadURL})
        });
      });
    });
		
  }
  
  DataHora(){
		let ano:any = new Date().getFullYear();
		let mes:any = new Date().getMonth() + 1;
		let dia:any = new Date().getDate();
		let horas:any = new Date().getHours();
		let minutos:any = new Date().getMinutes();
		let segundos:any = new Date().getSeconds();
		
			if(mes < 10){
				mes = "0" + mes;
			}
			if(dia < 10){
				dia = "0" + dia;
			}
			if(horas < 10){
				horas = "0" + horas;
			}
			if(minutos < 10){
				minutos = "0" + minutos;
			}
			if(segundos < 10){
				segundos = "0" + segundos;
			}
		
		let dataNow = dia +"/"+ mes +"/"+ ano + "-" + horas + ":" + minutos + ":" + segundos;
		return dataNow;
  }
  
  Hora(){
		let horas:any = new Date().getHours();
		let minutos:any = new Date().getMinutes();
			if(horas < 10){
				horas = "0" + horas;
			}
			if(minutos < 10){
				minutos = "0" + minutos;
			}
		
    let dataNow:any = horas + ":" + minutos;
		return dataNow;
  }

  Dia(){
		let ano:any = new Date().getFullYear();
		let mes:any = new Date().getMonth() + 1;
		let dia:any = new Date().getDate();
		
			if(mes < 10){
				mes = "0" + mes;
			}
			if(dia < 10){
				dia = "0" + dia;
			}
		
		let dataNow:any = dia +"-"+ mes +"-"+ ano;
		return dataNow;
  }
  
  fila(){
		let ano:any = new Date().getFullYear();
		let mes:any = new Date().getMonth() + 1;
		let dia:any = new Date().getDate();
		let horas:any = new Date().getHours();
		let minutos:any = new Date().getMinutes();
		let segundos:any = new Date().getSeconds();
		
			if(mes < 10){
				mes = "0" + mes;
			}
			if(dia < 10){
				dia = "0" + dia;
			}
			if(horas < 10){
				horas = "0" + horas;
			}
			if(minutos < 10){
				minutos = "0" + minutos;
			}
			if(segundos < 10){
				segundos = "0" + segundos;
			}
		
    let dataNow:any = ano +""+mes+""+dia+""+horas +""+ minutos;
    dataNow = parseInt(dataNow);
		return dataNow;
  }

  inverteArray(array){
    return new Promise((resolve,reject)=>{
      let result = [];
      for (let i = array.length - 1; i >= 0 ; i--) {
        result.push(array[i]);
      }
      resolve(result);
    });
  }

}
