import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TarefasEditarPage } from './tarefas-editar';

@NgModule({
  declarations: [
    TarefasEditarPage,
  ],
  imports: [
    IonicPageModule.forChild(TarefasEditarPage),
  ],
})
export class TarefasEditarPageModule {}
