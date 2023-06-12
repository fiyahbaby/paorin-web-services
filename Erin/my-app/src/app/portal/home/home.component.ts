import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  onRedirect(field: string) {
    switch (field) {
      case 'createProject':
        this.router.navigate(['/project-menu/create-project']);
        break;
      case 'editProject':
        this.router.navigate(['/project-menu/edit-project']);
        break;
      default:
        break;
    }
  }
}
