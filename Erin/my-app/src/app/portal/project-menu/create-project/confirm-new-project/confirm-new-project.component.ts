import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateProjectResponse } from '../create-project-response.class';

@Component({
  selector: 'app-confirm-new-project',
  templateUrl: './confirm-new-project.component.html',
  styleUrls: ['./confirm-new-project.component.scss'],
})
export class ConfirmNewProjectComponent implements OnInit {
  newProjectParams: any;
  createProjectParams: any;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.newProjectParams = params;
    });

    this.newProjectParams = JSON.parse(this.newProjectParams.data);
  }

  onBack() {
    const formData = JSON.stringify(this.newProjectParams);
    this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParams: {
        data: formData
      },
    });
  }


  onSubmit() {
    // TODO
  }
}
