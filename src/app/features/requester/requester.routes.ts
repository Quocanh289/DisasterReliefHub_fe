import { Routes } from '@angular/router';
import { CreateRequestComponent } from './create-request/create-request.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';

export const requesterRoutes: Routes = [
  { path: 'new', component: CreateRequestComponent },
  { path: 'my', component: MyRequestsComponent },
  { path: '', pathMatch: 'full', redirectTo: 'new' }
];
