import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterLogComponent } from './log/register-log/register-log.component';
import { ListLogComponent } from './log/list-log/list-log.component';
import { RegisterConsoleComponent } from './console/register-console/register-console.component';
import { ListConsoleComponent } from './console/list-console/list-console.component';
import { RegisterGenreComponent } from './genre/register-genre/register-genre.component';
import { ListGenreComponent } from './genre/list-genre/list-genre.component';
import { RegisterManufacturerComponent } from './manufacturer/register-manufacturer/register-manufacturer.component';
import { ListManufacturerComponent } from './manufacturer/list-manufacturer/list-manufacturer.component';
import { RegisterUserComponent } from './user/register-user/register-user.component';
import { ListUserComponent } from './user/list-user/list-user.component';
import { ProfileComponent } from './profile/profile.component';
import { CsvModeComponent } from './csv-mode/csv-mode.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'register-log', component: RegisterLogComponent },
  { path: 'register-console', component: RegisterConsoleComponent },
  { path: 'register-console/:id_console', component: RegisterConsoleComponent },
  { path: 'register-genre', component: RegisterGenreComponent },
  { path: 'register-genre/:id_genre', component: RegisterGenreComponent },
  { path: 'register-manufacturer', component: RegisterManufacturerComponent },
  { path: 'register-manufacturer/:id_manufacturer', component: RegisterManufacturerComponent },
  { path: 'register-user', component: RegisterUserComponent },
  { path: 'register-user/:id_admin', component: RegisterUserComponent },
  { path: 'list-logs', component: ListLogComponent },
  { path: 'list-console', component: ListConsoleComponent },
  { path: 'list-genre', component: ListGenreComponent },
  { path: 'list-manufacturer', component: ListManufacturerComponent },
  { path: 'list-user', component: ListUserComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'csv-mode', component: CsvModeComponent },
];

@NgModule({
  declarations: [
    DashboardComponent,
    RegisterLogComponent,
    ListLogComponent,
    RegisterConsoleComponent,
    ListConsoleComponent,
    RegisterGenreComponent,
    ListGenreComponent,
    RegisterManufacturerComponent,
    ListManufacturerComponent,
    RegisterUserComponent,
    ListUserComponent,
    ProfileComponent,
    CsvModeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterModule.forChild(routes),
  ],
})
export class AdminModule {}
