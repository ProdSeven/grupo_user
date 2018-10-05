import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home'
import { LoginPage } from '../pages/login/login';
import { CriarContaPage } from '../pages/criar-conta/criar-conta'; 

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { AutenticacaoProvider } from '../providers/autenticacao/autenticacao';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Camera } from '@ionic-native/camera';
import { Keyboard } from '@ionic-native/keyboard';
 
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    CriarContaPage,
    LoginPage
  ],
  imports: [ 
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp], 
  entryComponents: [
    MyApp,
    HomePage,
    CriarContaPage,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseProvider,
    AutenticacaoProvider,
    AndroidPermissions,
    BackgroundMode,
    Camera,
    Keyboard
  ]
})
export class AppModule {}
