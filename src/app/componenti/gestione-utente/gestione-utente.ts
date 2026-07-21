import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { UtenteServices } from '../../services/utente-services';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UtilitiesServices } from '../../services/utilities-services';
import { SceltaUpdateUtente } from '../../dialogs/scelta-update-utente/scelta-update-utente';
import { ComponentType } from '@angular/cdk/overlay';
import { MatListModule } from "@angular/material/list";

@Component({
  selector: 'app-gestione-utente',
  imports: [MatCardModule, MatInputModule,
    ReactiveFormsModule, MatFormFieldModule, MatListModule],
  templateUrl: './gestione-utente.html',
  styleUrl: './gestione-utente.css',
})
export class GestioneUtente implements OnInit
{
  private readonly utenteS = inject(UtenteServices);
  private readonly util = inject(UtilitiesServices);

  utenti = this.utenteS.accounts;

  ngOnInit(): void {
    this.utenteS.list();
  }

  onSelected(row: any) {
    console.log("Riga selezionata:", row);
    let dialogRef = this.util.openDialog(SceltaUpdateUtente, row, {
      width: '400px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '100vh'
    });
    dialogRef.afterClosed().subscribe(r => {
      if (r === 'update') {
        this.eseguoUpdate(row);
      } else if (r === 'delete') {
        this.eseguoDelete(row);
      }
    });
  }

  eseguoUpdate(row: any) 
  {
    console.log("eseguo l'update");
    let dialogComponent: ComponentType<any>;

    let dialogRef = this.util.openDialog(dialogComponent,
      {
        mod: 'U',
        utente: row
      },
      {
        width: '1100px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        panelClass: 'wide-dialog',
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '500ms'
      },
    )

    dialogRef.afterClosed().subscribe(() => {
      this.utenteS.list(); 
    });
  }

  eseguoDelete(row:any)
  {

  }
}
