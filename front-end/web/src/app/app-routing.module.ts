import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/player/home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { GameBeatenListComponent } from './pages/player/lists/game-beaten-list/game-beaten-list.component';
import { RegisterGameComponent } from './pages/player/registers/register-game/register-game.component';
import { AboutProjectComponent } from './pages/player/about-project/about-project.component';
import { ProjectUpdatesLogComponent } from './pages/player/project-updates-log/project-updates-log.component';
import { RegisterLogComponent } from './pages/admin/log/register-log/register-log.component';
import { RoleGuard } from './auth/role.guard';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { PlayerLoginComponent } from './pages/login/player-login/player-login.component';
import { AdminLoginComponent } from './pages/login/admin-login/admin-login.component';
import { RegisterConsoleComponent } from './pages/admin/console/register-console/register-console.component';
import { RegisterGenreComponent } from './pages/admin/genre/register-genre/register-genre.component';
import { RegisterManufacturerComponent } from './pages/admin/manufacturer/register-manufacturer/register-manufacturer.component';
import { RegisterUserComponent } from './pages/admin/user/register-user/register-user.component';
import { ListLogComponent } from './pages/admin/log/list-log/list-log.component';
import { ListConsoleComponent } from './pages/admin/console/list-console/list-console.component';
import { ListGenreComponent } from './pages/admin/genre/list-genre/list-genre.component';
import { ListManufacturerComponent } from './pages/admin/manufacturer/list-manufacturer/list-manufacturer.component';
import { ListUserComponent } from './pages/admin/user/list-user/list-user.component';
import { ProfileComponent } from './pages/admin/profile/profile.component';
import { CsvModeComponent } from './pages/admin/csv-mode/csv-mode.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { BacklogFormComponent } from './pages/player/registers/backlog-form/backlog-form.component';
import { BacklogListComponent } from './pages/player/lists/backlog-list/backlog-list.component';
import { PlayerProfileComponent } from './pages/player/player-profile/player-profile.component';
import { RegisterPlayerComponent } from './pages/public/register-player/register-player.component';
import { IndexComponent } from './pages/public/index/index.component';
import { PageTestComponent } from './pages/player/page-test/page-test.component';
import { GamingInformationComponent } from './pages/player/gaming-information/gaming-information.component';
import { ListMissingDataComponent } from './pages/player/lists/list-missing-data/list-missing-data.component';

const routes: Routes = [
  { path: '', component: IndexComponent},
  { path: 'login', component: PlayerLoginComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'register-player', component: RegisterPlayerComponent },

  // Player routes
  {
    path: '',
    component: SidebarComponent,
    canActivate: [AuthGuard],
    data: { role: 'player' },
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'game-beaten-list', component: GameBeatenListComponent },
      { path: 'backlog-list', component: BacklogListComponent },
      { path: 'register-game', component: RegisterGameComponent },
      { path: 'register-game/:id_game', component: RegisterGameComponent },
      { path: 'register-backlog', component: BacklogFormComponent },
      { path: 'register-backlog/:id_game', component: BacklogFormComponent },
      { path: 'list-missing-data', component: ListMissingDataComponent},
      { path: 'about-project', component: AboutProjectComponent },
      { path: 'project-updates-log', component: ProjectUpdatesLogComponent },
      { path: 'player-profile', component: PlayerProfileComponent },
      { path: 'page-test', component: PageTestComponent },
      { path: 'gaming-information', component: GamingInformationComponent }
    ],
  },

  // Admin routes
  {
    path: 'admin',
    component: SidebarComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'register-log', component: RegisterLogComponent },
      { path: 'register-console', component: RegisterConsoleComponent },
      {
        path: 'register-console/:id_console',
        component: RegisterConsoleComponent,
      },
      { path: 'register-genre', component: RegisterGenreComponent },
      { path: 'register-genre/:id_genre', component: RegisterGenreComponent },
      {
        path: 'register-manufacturer',
        component: RegisterManufacturerComponent,
      },
      {
        path: 'register-manufacturer/:id_manufacturer',
        component: RegisterManufacturerComponent,
      },
      { path: 'register-user', component: RegisterUserComponent },
      { path: 'register-user/:id_admin', component: RegisterUserComponent },

      { path: 'list-logs', component: ListLogComponent },
      { path: 'list-console', component: ListConsoleComponent },
      { path: 'list-genre', component: ListGenreComponent },
      { path: 'list-manufacturer', component: ListManufacturerComponent },
      { path: 'list-user', component: ListUserComponent },

      { path: 'profile', component: ProfileComponent },
      { path: 'csv-mode', component: CsvModeComponent },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
