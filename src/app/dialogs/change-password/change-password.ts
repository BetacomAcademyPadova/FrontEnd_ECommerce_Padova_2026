import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthServices } from '../../auth/auth-services';
import { Router } from '@angular/router';
import { UtenteServices } from '../../services/user-services';


@Component({
  selector: 'app-change-password',
  imports: [MatButtonModule, MatIconModule, MatDialogModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {

  private readonly auth = inject(AuthServices);
  private readonly accountServices = inject(UtenteServices);
  private readonly routing = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<ChangePassword>);
  private readonly dialog = inject(MatDialog);

  msg = signal('');

  onSubmit(updatePwd: NgForm) {
    this.msg.set("");

    if (updatePwd.value.newpassword != updatePwd.value.cntrlpassword) {
      this.msg.set("password non identiche.")
      return
    }

    const currentUsername = this.auth.getUsername();

    this.accountServices.changePwd({
      username: currentUsername,
      oldPassword: updatePwd.value.oldpassword,
      newPassword: updatePwd.value.newpassword
    }).subscribe({
      next: ((r: any) => {
        this.dialogRef.close();
        console.log("Password modificata con successo");
      }),
      error: ((r: any) => {
        this.msg.set(r.error.msg);
      })
    })

  }

}