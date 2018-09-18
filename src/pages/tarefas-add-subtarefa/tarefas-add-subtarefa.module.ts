import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TarefasAddSubtarefaPage } from './tarefas-add-subtarefa';

@NgModule({
  declarations: [
    TarefasAddSubtarefaPage,
  ],
  imports: [
    IonicPageModule.forChild(TarefasAddSubtarefaPage),
  ],
})
export class TarefasAddSubtarefaPageModule {}
