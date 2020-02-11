import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExperimentUsersRootComponent } from './experiment-users-root/experiment-users-root.component';

const routes: Routes = [
  {
    path: '',
    component: ExperimentUsersRootComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
