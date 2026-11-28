import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { TasksComponent } from './tasks/tasks.component';

export const volunteerRoutes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'assignments', component: TasksComponent },
  { path: 'tasks', redirectTo: 'assignments', pathMatch: 'full' },
  { path: '', pathMatch: 'full', redirectTo: 'assignments' }
];
