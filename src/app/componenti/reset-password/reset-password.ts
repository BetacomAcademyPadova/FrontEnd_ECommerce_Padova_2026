import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { AutentificazioneServices } from '../../security/autentificazione-services';
import { MatCard, MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatCard, MatCardModule, MatIconModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})

export class ResetPassword {
    token = "";
    password = "";
    confirmPassword = "";
    msg = "";
    success = false;
    hidePassword = true;
    hideConfirmPassword = true;

    constructor(
        private route: ActivatedRoute,
        private account: AutentificazioneServices
    ){}

    ngOnInit(){
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
        });
    }

    cambiaPassword(){
      if(this.password !== this.confirmPassword){
        this.msg = "Le password non coincidono";
        return;
      }
      this.account.resetPassword({
        token: this.token,
        password: this.password
      })
      .subscribe({
        next:(resp:any)=>{
        this.success = true;
        this.msg = resp.msg;
      },error:(err)=>{
        this.success = false;
        console.log(err);
        this.msg = err.error?.msg || "Errore durante il cambio password";
      }
      });
    }
}