import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  role: string = '';

  menuItemsPlayer = [
    { link: 'home', name: 'Home', icon: "fas fa-home" },
    { link: 'register-game', name: 'Registrar jogo', icon: "fas fa-save" },
    { link: 'register-backlog', name: 'Registrar backlog', icon: "far fa-save" },
    { link: 'game-beaten-list', name: 'Jogos zerados', icon: "fas fa-table" },
    { link: 'backlog-list', name: 'Backlog', icon: "fas fa-tasks" },
    { link: 'about-project', name: 'Sobre o projeto', icon: "fab fa-stack-exchange" },
    { link: 'project-updates-log', name: 'Log de atualizações', icon: "fas fa-book-open" },
    { link: 'player-profile', name: 'Perfil', icon: "fas fa-user" },
  ];

  menuItemsAdmin = [
    { link: 'dashboard', name: 'Dashboard', icon: "fa-thin fa-list" },
    { link: 'register-user', name: 'Registrar usuário', icon: "fa-thin fa-list" },
    { link: 'register-log', name: 'Registrar log', icon: "fa-thin fa-list" },
    { link: 'register-genre', name: 'Registrar gênero', icon: "fa-thin fa-list" },
    { link: 'register-console', name: 'Registrar console', icon: "fa-thin fa-list" },
    { link: 'register-manufacturer', name: 'Registrar fabricante', icon: "fa-thin fa-list" },
    { link: 'list-logs', name: 'Listar logs', icon: "fa-thin fa-list" },
    { link: 'list-genre', name: 'Listar gêneros', icon: "fa-thin fa-list" },
    { link: 'list-console', name: 'Listar consoles', icon: "fa-thin fa-list" },
    { link: 'list-manufacturer', name: 'Listar fabricantes', icon: "fa-thin fa-list" },
    { link: 'list-user', name: 'Listar usuários', icon: "fa-thin fa-list" },
    { link: 'profile', name: 'Perfil', icon: "fa-thin fa-list" },
    { link: 'csv-mode', name: 'Modo CSV', icon: "fa-thin fa-list" },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.role = this.auth.getUserRole() ?? '';
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
  
}
