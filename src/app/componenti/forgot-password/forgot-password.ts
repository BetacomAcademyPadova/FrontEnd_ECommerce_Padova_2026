import { Component } from "@angular/core";
import { AutentificazioneServices } from "../../security/autentificazione-services";
import { MatDialogRef, MatDialogModule , MatDialogActions} from "@angular/material/dialog";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { ForgotPasswordReq } from "../models/user-dto"; 


@Component({
  selector: "app-forgot-password",
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatDialogActions],
  templateUrl: "./forgot-password.html",
  styleUrl: "./forgot-password.css",
})
export class ForgotPassword {

    email = "";

    constructor(
        private account: AutentificazioneServices,
        private dialogRef: MatDialogRef<ForgotPassword>
    ) {}


    invia(){

        const req: ForgotPasswordReq = {
            email: this.email
        };


        this.account.forgotPassword(req)
        .subscribe({

            next: () => {
                alert("Email inviata");
                this.dialogRef.close();
            },

            error: (err:any) => {
                console.log(err);
            }

        });

    }

}