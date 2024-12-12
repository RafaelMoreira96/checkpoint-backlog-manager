import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(private toast: ToastrService, private router: Router) { }
  
  logout(): void {
    this.toast.info('Logout realizado com sucesso!');
    localStorage.clear();
    window.location.href = '/login'; 
  }
  
}
