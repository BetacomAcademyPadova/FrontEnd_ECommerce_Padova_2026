import { Component, Inject, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogRef , MatDialogClose, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtenteServices } from '../../services/utente-services';

@Component({
  selector: 'app-registrazione',
  imports: [MatDialogContent, MatDialogClose, MatIconModule,MatInputModule, MatButtonModule, MatCardModule, 
    MatRadioModule, MatFormFieldModule, FormsModule,ReactiveFormsModule],
  templateUrl: './registrazione.html',
  styleUrl: './registrazione.css',
})
export class Registrazione implements OnInit{
   account = signal<any>(null);
  mod: any;
  msg = signal('');

  updateForm: FormGroup = new FormGroup({
    nome: new FormControl(null, Validators.required),
    cognome: new FormControl(null, Validators.required),
    email: new FormControl(null, Validators.required),
    sesso: new FormControl('M', Validators.required),
    telefono: new FormControl(null, Validators.required),
    via: new FormControl(null, Validators.required),
    comune: new FormControl(null, Validators.required),
    cap: new FormControl(null, Validators.required),
    userName: new FormControl(null),
    password: new FormControl(null),
    passwordControl: new FormControl(null)
  })

  constructor(
    private accoutServices: UtenteServices,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<Registrazione>
  ){
if (data) {
      this.account.set(data.account);
      this.mod = data.mode;
    }
  }


   ngOnInit(): void {
     if (this.mod == "U") {
      this.updateForm.patchValue({
        nome: this.account().nome,
        cognome: this.account().cognome,
        email: this.account().email,
        sesso: this.account().sesso ? 'M' : 'F',
        telefono: this.account().telefono,
        via: this.account().via,
        comune: this.account().comune,
        cap: this.account().cap,
        userName: this.account().userName
      })
    }
  }
  onSubmit() {
    if (this.mod == 'C') this.onSubmitCreate();
    if (this.mod == 'U') this.onSubmitUpdate();
  }
 onSubmitUpdate() {
    this.msg.set('');
    const updateBody: any = { userName: this.account().userName };

    if (this.updateForm.controls['nome'].dirty)
      updateBody.nome = this.updateForm.value.nome;

    if (this.updateForm.controls['cognome'].dirty)
      updateBody.cognome = this.updateForm.value.cognome;

    if (this.updateForm.controls['email'].dirty)
      updateBody.email = this.updateForm.value.email;

    if (this.updateForm.controls['sesso'].dirty)
      updateBody.sesso = this.updateForm.value.sesso == 'M' ? true : false;

    if (this.updateForm.controls['telefono'].dirty)
      updateBody.telefono = this.updateForm.value.telefono;

    if (this.updateForm.controls['via'].dirty)
      updateBody.via = this.updateForm.value.via;

    if (this.updateForm.controls['comune'].dirty)
      updateBody.commune = this.updateForm.value.comune;

    if (this.updateForm.controls['cap'].dirty)
      updateBody.cap = this.updateForm.value.cap;

    console.log(updateBody);

    this.accoutServices.update(updateBody)
      .subscribe({
        next: ((resp: any) => {
          console.log(resp);
          this.dialogRef.close();
        }),
        error: ((resp: any) => {
          this.msg.set(resp.error.msg);
        })
      })
  }
onSubmitCreate() {
    this.msg.set("");

    if (this.updateForm.value.password != this.updateForm.value.passwordControl) {
      this.msg.set("passord non coindicidenti");
      return;
    }
    console.log("nome" + this.updateForm.value.nome);
    console.log("cognome" + this.updateForm.value.cognome);

    this.accoutServices.create({
      nome: this.updateForm.value.nome,
      cognome: this.updateForm.value.cognome,
      email: this.updateForm.value.email,
      sesso: this.updateForm.value.sesso == 'M' ? true : false,
      telefono: this.updateForm.value.telefono,
      via: this.updateForm.value.via,
      commune: this.updateForm.value.comune,
      cap: this.updateForm.value.cap,
      userName: this.updateForm.value.userName,
      pwd: this.updateForm.value.password,
      role: 'USER'
    }).subscribe({
      next: ((resp: any) => {
        console.log(resp);
        this.dialogRef.close();
      }),
      error: ((resp: any) => {
        console.log(resp.error.msg)
        this.msg.set(resp.error.msg);
      })
    })
  }




}
