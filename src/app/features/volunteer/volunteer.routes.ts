import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { TasksComponent } from './tasks/tasks.component';

export const volunteerRoutes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'tasks', component: TasksComponent }
];
