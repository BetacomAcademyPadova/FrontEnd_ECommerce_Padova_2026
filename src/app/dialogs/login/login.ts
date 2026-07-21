import { Component, inject, signal } from '@angular/core';
import { NgForm, FormsModule, NgModel } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogContent, MatDialogRef , MatDialogClose} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { AuthServices } from '../../auth/auth-services';
import { Router } from '@angular/router';
import { UtilitiesServices } from '../../services/utilities-services';
import { Registrazione } from '../registrazione/registrazione';
import { AutentificazioneServices } from '../../security/autentificazione-services';
import { UserDTO } from '../../componenti/models/user-dto/user-dto';


@Component({
  selector: 'app-login',
  imports: [FormsModule, MatIconModule, MatDialogContent, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatCheckboxModule, MatDialogClose],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  msg = signal('');
  readonly dialog = inject(MatDialog);
  username = "";

  constructor(
    private account: AutentificazioneServices,
    private auth: AuthServices,
    private routing: Router,
    private util: UtilitiesServices,
    private dialogRef: MatDialogRef<Login>
  ) { }

  onSubmit(signin: NgForm) {
    this.account.login({
      username: signin.form.value.username,
      password: signin.form.value.password
    }).subscribe({
      next: (resp: UserDTO) => {
        this.msg.set("");
        console.log(resp)

        this.auth.setAutentificated(resp);

        console.log('[LoginDialog] dopo login, isAutentificated =', this.auth.isAutentificated());


        this.dialogRef.close(true);
        this.routing.navigate(['/dash']);
      },
      error: (resp: any) => {
        console.log(resp);
        this.msg.set(resp.error.msg);
        this.username = signin.form.value.username;
      }
    });
  }

  registrazione() {
    this.util.openDialog(Registrazione,
      {
        account: null,
        mode: "C"
      },
      {
        width: '90vw',
        maxWidth: '1200px',
        height: 'auto',
      }
    );

  }

  onResendChange(e: MatCheckboxChange) { }
}