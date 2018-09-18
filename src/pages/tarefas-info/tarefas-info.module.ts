import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TarefasInfoPage } from './tarefas-info';

@NgModule({
  declarations: [
    TarefasInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(TarefasInfoPage),
  ],
})
export class TarefasInfoPageModule {}
