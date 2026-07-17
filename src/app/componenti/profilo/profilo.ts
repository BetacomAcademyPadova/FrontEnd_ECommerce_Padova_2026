import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { UtenteServices } from '../../services/utente-services';

@Component({
  selector: "app-profilo",
  imports: [FormsModule],
  templateUrl: "./profilo.html",
  styleUrl: "./profilo.css",
})
export class Profilo 
{
  private utenteService = inject(UtenteServices);

  nuovoUtente = { 
    userName: '', 
    password: '', 
    nome: '', 
    cognome: '', 
    email: '',
    telefono: '' 
  };

  crea() {
    this.utenteService.create(this.nuovoUtente).subscribe({
      next: () => {
        console.log("Utente creato con successo!");
        this.nuovoUtente = { userName: '', password: '', nome: '', cognome: '', email: '', telefono: '' };
      },
      error: (err) => {
        console.error("Errore:", err);
      }
    });
  }
}
