import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  toggleSidebar: boolean = false;
  isDarkMode: boolean = false;
  role: string = '';

  menuItemsPlayer = {
    dashboardItem: [
      { link: 'home', name: 'Home', icon: 'fas fa-home' },
      {
        link: 'gaming-information',
        name: 'Informações Gamísticas',
        icon: 'fas fa-bars',
      },
    ],

    listItems: [
      { link: 'game-beaten-list', name: 'Jogos zerados', icon: 'fas fa-table' },
      { link: 'backlog-list', name: 'Backlog', icon: 'fas fa-tasks' },
    ],

    infoProject: [
      {
        link: 'about-project',
        name: 'Sobre o projeto',
        icon: 'fab fa-stack-exchange',
      },
      {
        link: 'project-updates-log',
        name: 'Log de atualizações',
        icon: 'fas fa-book-open',
      },
    ],

    configs: [{ link: 'player-profile', name: 'Perfil', icon: 'fas fa-user' }],
  };

  menuItemsAdmin = {
    dashboardItem: [
      { link: 'dashboard', name: 'Dashboard', icon: 'fas fa-home' },
    ],
    registersItems: [
      {
        link: 'register-user',
        name: 'Registrar usuário',
        icon: 'fas fa-user-plus',
      },
      { link: 'register-log', name: 'Registrar log', icon: 'far fa-list-alt' },
      {
        link: 'register-genre',
        name: 'Registrar gênero',
        icon: 'icon-information',
      },
      {
        link: 'register-console',
        name: 'Registrar console',
        icon: 'icon-game-controller',
      },
      {
        link: 'register-manufacturer',
        name: 'Registrar fabricante',
        icon: 'icon-grid',
      },
    ],

    listsItems: [
      { link: 'list-user', name: 'Listar usuários', icon: 'fas fa-users' },
      { link: 'list-logs', name: 'Listar logs', icon: 'fas fa-tasks' },
      { link: 'list-genre', name: 'Listar gêneros', icon: 'fas fa-indent' },
      { link: 'list-console', name: 'Listar consoles', icon: 'fas fa-gamepad' },
      {
        link: 'list-manufacturer',
        name: 'Listar fabricantes',
        icon: 'fas fa-building',
      },
    ],

    othersItems: [
      { link: 'csv-mode', name: 'Importar CSV', icon: 'icon-control-play' },
      { link: 'profile', name: 'Perfil', icon: 'fas fa-user' },
    ],
  };

  constructor(private toast: ToastrService, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.updateTheme();
    this.role = this.auth.getUserRole() ?? '';
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme();
  }

  private updateTheme(): void {
    const body = document.body;
    if (this.isDarkMode) {
      body.setAttribute('data-bs-theme', 'dark');
    } else {
      body.setAttribute('data-bs-theme', 'light');
    }
  }

  logout(): void {
    this.toast.info('Logout realizado com sucesso!');
    localStorage.clear();
    window.location.href = '/login';
  }

  onToggleSidebar() {
    this.toggleSidebar =!this.toggleSidebar;
  }

  closeNavbar() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
      navbarToggler.setAttribute('aria-expanded', 'false');
      navbarCollapse.classList.remove('show');
    }
  }
}