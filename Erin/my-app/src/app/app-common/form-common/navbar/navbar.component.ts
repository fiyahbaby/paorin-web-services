import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth-service/auth.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  userType: string | undefined;
  project: MenuItem[] = [];
  buildId: MenuItem[] = [];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.userType = this.authService.getUserType();
    }

    this.project = [
      {
        label: 'View Project',
      },
      {
        label: 'Create Project',
        command: () => this.router.navigate(['/create-project']),
      },
    ];

    this.buildId = [
      {
        label: 'View Build ID',
      },
      {
        label: 'Create Build ID',
      },
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}
