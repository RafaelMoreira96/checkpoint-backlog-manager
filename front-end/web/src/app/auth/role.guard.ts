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
    const requiredRoles = route.data['role']; 
    const userRole = this.authService.getUserRole();

    if (Array.isArray(requiredRoles)) {
      if (requiredRoles.includes(userRole)) {
        return true;
      }
    } else if (requiredRoles === userRole) {
      return true;
    }

    this.router.navigate(['unauthorized']); 
    return false;
  }
}
