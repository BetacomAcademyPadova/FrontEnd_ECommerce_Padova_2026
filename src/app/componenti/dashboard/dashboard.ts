import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthServices } from '../../auth/auth-services';
import { UtilitiesServices } from '../../services/utilities-services';
import { Login } from '../../dialogs/login/login';
import { MatMenuModule } from '@angular/material/menu';
import { Registrazione } from '../../dialogs/registrazione/registrazione';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UtenteServices } from '../../services/user-services';
import { AutentificazioneServices } from '../../security/autentificazione-services';
import { ChangePassword } from '../../dialogs/change-password/change-password';

@Component({
  selector: 'app-dashboard',
  imports: [MatSidenavModule, MatListModule, RouterLink, RouterOutlet, //RouterLinkActive, 
    MatIconModule, MatButtonModule, MatToolbarModule, MatMenuModule, MatBadgeModule, MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  //VARIABILE PER TESTARE ICONA CARRELLO
  quantitaCarrello: number = 3;

  constructor(
    public auth: AuthServices,
    private rounting: Router,
    private util: UtilitiesServices,
    private utenteServices: UtenteServices,
    private autentificazioneServices: AutentificazioneServices
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
    this.util.openDialog(ChangePassword,
      {},
      {
        width: '400px',
        disableClose: false,
      }
    )
  }

  profile() {
    const userId = this.auth.grant()?.userId;
    this.utenteServices.findByUserNameNumber(Number(userId))
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
    this.autentificazioneServices.logout()
      .subscribe({
        next: () => {
          this.rounting.navigate(['/dash'])
        }
      })
  }
}
