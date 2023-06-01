import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth-service/auth.service';
import { Router } from '@angular/router'; // Import the Router

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  userType: string | undefined;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.userType = this.authService.getUserType();
    }
  }

  logout(): void {
    this.authService.logout(); // Call the necessary logout logic

    // Redirect the user to the login page
    this.router.navigate(['/']);
  }
}
