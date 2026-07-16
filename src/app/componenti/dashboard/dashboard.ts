import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthServices } from '../../auth/auth-services';
import { UtilitiesServices } from '../../services/utilities-services';
import { Login } from '../../dialogs/login/login';
import {MatMenuModule} from '@angular/material/menu';
import { UtenteServices } from '../../services/utente-services';
import { Registrazione } from '../../dialogs/registrazione/registrazione';
@Component({
  selector: 'app-dashboard',
  imports: [MatSidenavModule, MatListModule, RouterLink, RouterOutlet, RouterLinkActive, MatIconModule,
    MatButtonModule, MatToolbarModule, MatMenuModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  constructor(
    public auth: AuthServices,
    private rounting: Router,
    private util: UtilitiesServices,
    private utenteServices:UtenteServices
  ) {}

  login() {
    this.util.openDialog(Login,
      {},
      {
        width: '500px',
        disableClose: false
      }
    )
  }

  changePWD(){
  }

 profile() {
    this.utenteServices.findByUserName(this.auth.grant().userId)
      .subscribe({
        next: ((r: any) => {
          this.util.openDialog(Registrazione,
            {
              account: r,
              mode: "U"
            },
            {
              width: '90vw',
              maxWidth: '1200px',
              height: 'auto',
            }
          );
        }),
        error: ((r: any) => {
          console.log("error getAccount:" + r.error.msg);
        })
      })
  }
  logout() {
    console.log("logout");
    this.auth.resetAll();
    this.rounting.navigate(['/dash'])
  }
}
