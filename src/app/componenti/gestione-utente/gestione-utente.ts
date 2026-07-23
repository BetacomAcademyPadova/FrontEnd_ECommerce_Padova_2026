import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from "@angular/material/list";
import { SceltaUpdateUtente } from '../../dialogs/scelta-update-utente/scelta-update-utente';
import { UtilitiesServices } from '../../services/utilities-services';
import { MatSelectModule } from '@angular/material/select';
import { UtenteServices } from '../../services/user-services';

@Component({
  selector: 'app-gestione-utente',
  imports: [MatCardModule, MatInputModule,
    ReactiveFormsModule, MatFormFieldModule, MatListModule,
    MatOptionModule, FormsModule, MatSelectModule],
  templateUrl: './gestione-utente.html',
  styleUrl: './gestione-utente.css',
})
export class GestioneUtente implements OnInit
{
  private readonly userS = inject(UtenteServices);
  private readonly util = inject(UtilitiesServices);

  utenti = this.userS.accounts;
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
    ruolo: new FormControl(null, Validators.required),
    username: new FormControl(null)
  })

  ngOnInit(): void {
    this.userS.list();
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
    this.userS.findByUserNameNumber(row.userId).subscribe({
      next: (dettaglioUtente: any) => {
        this.updateForm.patchValue({
          nome: dettaglioUtente.nome,
          cognome: dettaglioUtente.cognome,
          email: dettaglioUtente.email,
          telefono: dettaglioUtente.telefono,
          ruolo: dettaglioUtente.ruolo,
          username: dettaglioUtente.username 
        });
      },
      error: (err) => {
        console.error("Errore nel recupero dello username", err);
      }
    });
  }

  annullaModifica() {
    this.isModifica.set(false);
    this.utenteCorrente = null;
    this.updateForm.reset();
  }

  salvaModifiche() {
    if (this.updateForm.valid) {
      const formValues = this.updateForm.value;

      const bodyUpdate = {
        userId: this.utenteCorrente.userId, 
        nome: formValues.nome,
        cognome: formValues.cognome,
        email: formValues.email,
        telefono: formValues.telefono
      };

      this.userS.update(bodyUpdate).subscribe({
        next: () => 
        {
          const usernameCorrente = formValues.username;

          if (formValues.ruolo && formValues.ruolo !== this.utenteCorrente.ruolo) 
          {
            this.userS.setRole(usernameCorrente, formValues.ruolo).subscribe({
              next: () => 
              {
                console.log("Aggiornamento e ruolo riusciti");
                this.isModifica.set(false);
                this.utenteCorrente = null;
                this.userS.list();
              },
              error: (err) => 
              {
                console.error("Errore durante l'aggiornamento del ruolo", err)
              }
            });
          } 
          else 
          {
            console.log("Aggiornamento riuscito");
            this.isModifica.set(false);
            this.utenteCorrente = null;
            this.userS.list();
          }
        },
        error: (err) => 
        {
          console.error("Errore durante l'update", err);
        }
      });
    }
  }

  eseguoDelete(row: any) {
    console.log("Eliminazione di:", row);
    const idUtente = row.userId; 

    this.userS.deleteUser(idUtente).subscribe({
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
