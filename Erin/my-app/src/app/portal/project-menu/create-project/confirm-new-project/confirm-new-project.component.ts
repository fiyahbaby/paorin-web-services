import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-confirm-new-project',
  templateUrl: './confirm-new-project.component.html',
  styleUrls: ['./confirm-new-project.component.scss'],
})
export class ConfirmNewProjectComponent implements OnInit {
  newProjectParams: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.newProjectParams = params;
      console.log(this.newProjectParams);
    });
  }

  onBack() {
    // To-do
    this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParams: this.newProjectParams,
    });
  }

  onSubmit() {
    // To-do
  }
}
