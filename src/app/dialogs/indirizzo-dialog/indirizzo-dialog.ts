import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

import { IndirizzoServices } from '../../services/indirizzo-services';
import { AuthServices } from '../../auth/auth-services';
import { IndirizzoDTO } from '../../componenti/models/ordine-types';

export interface IndirizzoDialogData {
  indirizzo: IndirizzoDTO | null;
  mode: 'C' | 'U';
}

@Component({
  selector: 'app-indirizzo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './indirizzo-dialog.html'
})
export class IndirizzoDialog {

  private readonly fb = inject(FormBuilder);
  private readonly indirizzoS = inject(IndirizzoServices);
  private readonly auth = inject(AuthServices);
  private readonly dialogRef = inject(MatDialogRef<IndirizzoDialog>);
  readonly data: IndirizzoDialogData = inject(MAT_DIALOG_DATA);

  salvando = false;
  errore: string | null = null;

  form = this.fb.group({
    via: [this.data.indirizzo?.via ?? '', Validators.required],
    citta: [this.data.indirizzo?.citta ?? '', Validators.required],
    cap: [this.data.indirizzo?.cap ?? '', Validators.required],
    predefinito: [this.data.indirizzo?.predefinito ?? false]
  });

  get isModifica(): boolean {
    return this.data.mode === 'U';
  }

  salva(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    this.errore = null;

    const valori = this.form.getRawValue();

    if (this.isModifica) {
      const req = {
        idIndirizzo: this.data.indirizzo!.idIndirizzo,
        via: valori.via!,
        citta: valori.citta!,
        cap: valori.cap!,
        predefinito: valori.predefinito!
      };

      this.indirizzoS.update(req).subscribe({
        next: () => {
          this.salvando = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.salvando = false;
          this.errore = 'Errore durante il salvataggio.';
          console.error(err);
        }
      });
    } else {
      const userId = this.auth.grant().userId;
      const req = {
        via: valori.via!,
        citta: valori.citta!,
        cap: valori.cap!,
        predefinito: valori.predefinito!,
        idUser: Number(userId)
      };

      this.indirizzoS.create(req).subscribe({
        next: () => {
          this.salvando = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.salvando = false;
          this.errore = 'Errore durante il salvataggio.';
          console.error(err);
        }
      });
    }
  }

  chiudi(): void {
    this.dialogRef.close(false);
  }
}