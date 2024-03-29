import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { FaqComponent } from './faq/faq.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'trends' },
  {
    path: 'trends',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard]
  },
  {
    path: 'articles',
    loadChildren: './articles/articles.module#ArticlesModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'faq',
    component: FaqComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
