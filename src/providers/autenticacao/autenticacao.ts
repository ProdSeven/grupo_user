import {Injectable} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import firebase from 'firebase';
import { resolveDefinition } from '@angular/core/src/view/util';
@Injectable()

export class AutenticacaoProvider{

ver = "1.2.25";
notificado = false;
status = false;
position:any = "off";
cont = 0;
userp = "vazio";  
image;
name;

aceito = false;
constructor() {}

	getData(){
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
		
		let dataNow = ano + mes + dia + horas + minutos + segundos;
		return dataNow;
	}
	
	imageUp(image): Promise<any> {
		console.log("iamge: ", image)
      return firebase.database().ref(`/DriverProfile/${image.user}`).update({image:image.image,
		      														       imageuid:image.imageuid});
	}
	delImage(image):Promise<any>{
		return firebase.storage().refFromURL(image).delete().then(function() {
		}).catch(function(error){});
	}
	
	loginUser(email: string, password: string): Promise<any> {
			return firebase.auth().signInWithEmailAndPassword(email, password);
	}
  
  	criarConta(singup,password): Promise<any> {
      return firebase.auth().createUserWithEmailAndPassword(singup.email, password).then(newUser => {
		  console.log("newUser.user.uid, ",newUser.user.uid);
		  singup.id = newUser.user.uid;
		  console.log("singup: ", singup);
          firebase.database().ref(`/user_perfil/${singup.matricula}`).update(singup).then(()=>{
																				var user = firebase.auth().currentUser;
																				user.sendEmailVerification().then(function(){
																					
																				}).catch(function(error) {

																				});			

																			 });
	});
	}

	getModulos(){
		return new Promise((resolve,reject)=>{
			firebase.database().ref("config/modulos_user").once("value",modulos=>{
				resolve(modulos.val());
			},error=>{
				console.log("error: ", error);
				reject();
			});
		});
	}
	  
	resetPassword(email:string):Promise<void> {
		return firebase.auth().sendPasswordResetEmail(email);
	}

	logoutUser(): Promise<void> {
		return firebase.auth().signOut();
	}
}