import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/player/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { RegisterGameComponent } from './pages/player/registers/register-game/register-game.component';
import { AboutProjectComponent } from './pages/player/about-project/about-project.component';
import { ProjectUpdatesLogComponent } from './pages/player/project-updates-log/project-updates-log.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerLoginComponent } from './pages/login/player-login/player-login.component';
import { AdminLoginComponent } from './pages/login/admin-login/admin-login.component';
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
import { GamingInformationComponent } from './pages/player/gaming-information/gaming-information.component';
import { StatisticInfoComponent } from './pages/player/gaming-information/statistic-info/statistic-info.component';
import { ListMissingDataComponent } from './pages/player/lists/list-missing-data/list-missing-data.component';
import { ItemDetailsComponent } from './pages/player/gaming-information/item-details/item-details.component';
import { StatsByYearComponent } from './pages/player/gaming-information/stats-by-year/stats-by-year.component';


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
    AdminLoginComponent,
    BacklogFormComponent,
    BacklogListComponent,
    PlayerProfileComponent,
    UnauthorizedComponent,
    NotFoundComponent,
    ImportCsvComponent,
    IndexComponent,
    RegisterPlayerComponent,
    PageTestComponent,
    GamingInformationComponent,
    StatisticInfoComponent,
    ListMissingDataComponent,
    ItemDetailsComponent,
    StatsByYearComponent
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
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
