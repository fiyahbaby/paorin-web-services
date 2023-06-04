import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth-service/auth.service';
import { Router } from '@angular/router'; // Import the Router
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
      },
    ];

    this.buildId = [
      {
        label: 'View Build IDs',
      },
      {
        label: 'Create Build ID',
      },
    ];
  }

  logout(): void {
    this.authService.logout(); // Call the necessary logout logic

    // Redirect the user to the login page
    this.router.navigate(['/']);
  }
}
