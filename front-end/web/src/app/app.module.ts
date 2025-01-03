import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/player/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { RegisterGameComponent } from './pages/player/registers/register-game/register-game.component';
import { AboutProjectComponent } from './pages/player/about-project/about-project.component';
import { ProjectUpdatesLogComponent } from './pages/player/project-updates-log/project-updates-log.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RegisterGenreComponent } from './pages/admin/genre/register-genre/register-genre.component';
import { RegisterConsoleComponent } from './pages/admin/console/register-console/register-console.component';
import { RegisterManufacturerComponent } from './pages/admin/manufacturer/register-manufacturer/register-manufacturer.component';
import { RegisterLogComponent } from './pages/admin/log/register-log/register-log.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { PlayerLoginComponent } from './pages/login/player-login/player-login.component';
import { AdminLoginComponent } from './pages/login/admin-login/admin-login.component';
import { RegisterUserComponent } from './pages/admin/user/register-user/register-user.component';
import { ListConsoleComponent } from './pages/admin/console/list-console/list-console.component';
import { ListGenreComponent } from './pages/admin/genre/list-genre/list-genre.component';
import { ListManufacturerComponent } from './pages/admin/manufacturer/list-manufacturer/list-manufacturer.component';
import { ListUserComponent } from './pages/admin/user/list-user/list-user.component';

import { ListLogComponent } from './pages/admin/log/list-log/list-log.component';
import { ProfileComponent } from './pages/admin/profile/profile.component';
import { CsvModeComponent } from './pages/admin/csv-mode/csv-mode.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { SidebarItemComponent } from './components/layout/sidebar/sidebar-item/sidebar-item.component';
import { BacklogFormComponent } from './pages/player/registers/backlog-form/backlog-form.component';
import { BacklogListComponent } from './pages/player/lists/backlog-list/backlog-list.component';
import { GameBeatenListComponent } from './pages/player/lists/game-beaten-list/game-beaten-list.component';
import { PlayerProfileComponent } from './pages/player/player-profile/player-profile.component';
import { UnauthorizedComponent } from './components/error-pages/unauthorized/unauthorized.component';
import { NotFoundComponent } from './pages/default-pages/not-found/not-found.component';
import { ImportCsvComponent } from './pages/player/import-csv/import-csv.component';
import { IndexComponent } from './pages/public/index/index.component';
import { RegisterPlayerComponent } from './pages/public/register-player/register-player.component';
import { PageTestComponent } from './pages/player/page-test/page-test.component';


@NgModule({
  declarations: [
    GameBeatenListComponent,
    HeaderComponent,
    SidebarComponent,
    SidebarItemComponent,
    AppComponent,
    PlayerLoginComponent,
    HomeComponent,
    RegisterGameComponent,
    AboutProjectComponent,
    ProjectUpdatesLogComponent,
    RegisterGenreComponent,
    RegisterConsoleComponent,
    RegisterManufacturerComponent,
    RegisterLogComponent,
    DashboardComponent,
    AdminLoginComponent,
    RegisterUserComponent,
    ListConsoleComponent,
    ListGenreComponent,
    ListManufacturerComponent,
    ListUserComponent,
    ListLogComponent,
    ProfileComponent,
    CsvModeComponent,
    BacklogFormComponent,
    BacklogListComponent,
    PlayerProfileComponent,
    UnauthorizedComponent,
    NotFoundComponent,
    ImportCsvComponent,
    IndexComponent,
    RegisterPlayerComponent,
    PageTestComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
