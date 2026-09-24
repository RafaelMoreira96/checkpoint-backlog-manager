import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/player/home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { GameBeatenListComponent } from './pages/player/lists/game-beaten-list/game-beaten-list.component';
import { RegisterGameComponent } from './pages/player/registers/register-game/register-game.component';
import { AboutProjectComponent } from './pages/player/about-project/about-project.component';
import { ProjectUpdatesLogComponent } from './pages/player/project-updates-log/project-updates-log.component';
import { RoleGuard } from './auth/role.guard';
import { PlayerLoginComponent } from './pages/login/player-login/player-login.component';
import { AdminLoginComponent } from './pages/login/admin-login/admin-login.component';
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

  // Admin routes (Lazy loaded)
  {
    path: 'admin',
    component: SidebarComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
