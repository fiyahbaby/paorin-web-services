import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PortalService } from 'src/app/portal/portal.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit {
  message: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private portalService: PortalService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.message = params.get('message');
      if (this.message) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.message,
          life: 3000
        });
      }
    });
  }

  onRedirect(field: string) {
    switch (field) {
      case 'createProject':
        this.router.navigate(['/project-menu/create-project']);
        break;
      case 'editProject':
        this.router.navigate(['/project-menu/edit-project']);
        break;
      case 'viewProject':
        this.router.navigate(['/project-menu/view-project']);
        break;
      case 'deleteProject':
        this.router.navigate(['/project-menu/delete-project']);
        break;
      case 'viewData':
        this.router.navigate(['/project-menu/view-data']);
        break;
      case 'deleteData':
        this.router.navigate(['/project-menu/delete-data']);
        break;
      default:
        break;
    }
  }
}
