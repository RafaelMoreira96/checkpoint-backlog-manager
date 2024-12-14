import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRoles = route.data['role']; // Pega os papéis permitidos da rota (pode ser array ou string)
    const userRole = this.authService.getUserRole(); // Pega o papel do usuário

    if (Array.isArray(requiredRoles)) {
      // Se a rota aceita múltiplos papéis
      if (requiredRoles.includes(userRole)) {
        return true;
      }
    } else if (requiredRoles === userRole) {
      // Se a rota aceita um único papel
      return true;
    }

    // Se o usuário não tem permissão
    this.router.navigate(['unauthorized']); // Redireciona para uma página de acesso negado
    return false;
  }
}
