import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
<<<<<<< HEAD
import { MatOptionModule } from '@angular/material/core';
=======
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
>>>>>>> 1877a9513fcded714e838b9654b3a7541410d824
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from "@angular/material/list";
<<<<<<< HEAD
import { MatSelectModule } from '@angular/material/select';
import { SceltaUpdateUtente } from '../../dialogs/scelta-update-utente/scelta-update-utente';
import { UtenteServices } from '../../services/utente-services';
import { UtilitiesServices } from '../../services/utilities-services';
=======
import { UtenteServices } from '../../services/user-services';
>>>>>>> 1877a9513fcded714e838b9654b3a7541410d824

@Component({
  selector: 'app-gestione-utente',
  imports: [MatCardModule, MatInputModule,
    ReactiveFormsModule, MatFormFieldModule, MatListModule, MatSelectModule,
    MatOptionModule, FormsModule],
  templateUrl: './gestione-utente.html',
  styleUrl: './gestione-utente.css',
})
export class GestioneUtente implements OnInit
{
  private readonly utenteS = inject(UtenteServices);
  private readonly util = inject(UtilitiesServices);

  utenti = this.utenteS.accounts;
  isModifica = signal<boolean>(false);
  utenteCorrente: any = null;

  filtroId: string = '';
  filtroNome: string = '';
  filtroCognome: string = '';
  filtroRuolo: string = '';

  updateForm: FormGroup = new FormGroup({
    nome: new FormControl(null, Validators.required),
    cognome: new FormControl(null, Validators.required),
    email: new FormControl(null, [Validators.required, Validators.email]),
    telefono: new FormControl(null, Validators.required),
    ruolo: new FormControl(null, Validators.required)
  })

  ngOnInit(): void {
    this.utenteS.list();
  }

  get utentiFiltrati() {
    const ricercaId = this.filtroId ? this.filtroId.trim() : '';
    const ricercaNome = this.filtroNome ? this.filtroNome.toLowerCase() : '';
    const ricercaCognome = this.filtroCognome ? this.filtroCognome.toLowerCase() : '';
    const ruolo = this.filtroRuolo ? this.filtroRuolo.trim() : '';
    const lista = this.utenti();

    return lista.filter(u => {
      const matchId = ricercaId ? u.userId.toString().includes(ricercaId) : true;
      const matchNome = u.nome.toLowerCase().includes(ricercaNome);
      const matchCognome = u.cognome.toLowerCase().includes(ricercaCognome);
      const matchRuolo = ruolo ? u.ruolo === ruolo : true;
      
      return matchId && matchNome && matchCognome && matchRuolo;
    });
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
    console.log("Modifica di:", row);
    this.utenteCorrente = row;
    console.log("Utente corrente:", this.utenteCorrente);
    this.isModifica.set(true);
    this.updateForm.patchValue({
      nome: row.nome,
      cognome: row.cognome,
      email: row.email,
      telefono: row.telefono,
      ruolo: row.ruolo
    });
  }

  annullaModifica() {
    this.isModifica.set(false);
    this.utenteCorrente = null;
    this.updateForm.reset();
  }

  salvaModifiche() {
    if (this.updateForm.valid) {

      const bodyUpdate = {
        userId: this.utenteCorrente.userId, 
        ...this.updateForm.value
      };

      this.utenteS.update(bodyUpdate).subscribe({
        next: () => {
          console.log("Aggiornamento riuscito");
          this.isModifica.set(false);
          this.utenteCorrente = null;
          this.utenteS.list(); 
        },
        error: (err) => {
          console.error("Errore durante l'update", err);
        }
      });
    }
  }

  eseguoDelete(row: any) {
    console.log("Eliminazione di:", row);
    const idUtente = row.userId; 

    this.utenteS.deleteUser(idUtente).subscribe({
      next: () => {
        console.log("Utente eliminato con successo");
        /*if (this.utenteCorrente && this.utenteCorrente.userId === idUtente) {
          this.annullaModifica();
        }*/
      },
      error: (err) => {
        console.error("Errore durante l'eliminazione dell'utente", err);
      }
    });
  }
}
