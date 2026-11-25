import { Routes } from '@angular/router';
import { CreateRequestComponent } from './create-request/create-request.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';

export const requesterRoutes: Routes = [
  { path: 'requests', component: MyRequestsComponent },
  { path: 'requests/new', component: CreateRequestComponent }
];
