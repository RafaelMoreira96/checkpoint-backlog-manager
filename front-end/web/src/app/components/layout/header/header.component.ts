import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isDarkMode: boolean = false; 

  constructor(private toast: ToastrService, private router: Router) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.updateTheme();
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
}
