import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NotificheServices } from '../../services/notifiche-services';
import { AuthServices } from '../../auth/auth-services';

@Component({
  selector: "app-notifiche",
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, 
    MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./notifiche.html",
  styleUrl: "./notifiche.css",
})
export class Notifiche implements OnInit
{
  private notificheService = inject(NotificheServices);
  public auth = inject(AuthServices);

  notifiche = signal<any[]>([]);
  msg = signal('');
  successMsg = signal('');

  richiestaForm: FormGroup = new FormGroup({
    messaggio: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    if (this.auth.grant().isAdmin) 
    {
      this.notificheService.getTutteNonLette().subscribe({
        next: (res) => {
          this.notifiche.set(res);
        },
        error: () => {
          this.msg.set("Errore caricamento notifiche");
        }
      });
    }
  }

  segnaComeLetta(idNotifica: number) 
  {
    this.notificheService.segnaComeLetta(idNotifica).subscribe({
      next: () => 
      {
        this.notifiche.update(lista => lista.filter(n => n.idNotifica !== idNotifica));
      },
      error: () => 
      {
        this.msg.set("Errore durante aggiornamento notifica");
      }
    });
  }

  inviaRichiesta() 
  {
    if (this.richiestaForm.invalid) return;

    this.msg.set('');
    this.successMsg.set('');

    const userId = Number(this.auth.grant().userId);
    const messaggio = this.richiestaForm.value.messaggio;

    if (userId) {
      this.notificheService.inviaRichiesta(userId, messaggio).subscribe({
        next: () => {
          this.successMsg.set("Richiesta inviata con successo!");
          this.richiestaForm.reset();
        },
        error: () => {
          this.msg.set("Errore durante l'invio della richiesta");
        }
      });
    }
  }
}
