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
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: "app-notifiche",
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, 
    MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule,
    MatOptionModule, MatSelectModule],
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
    tipoRichiesta: new FormControl('', Validators.required),
    messaggio: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    if (this.auth.grant().isAdmin) 
    {
      this.notificheService.getTutteNonLette().subscribe({
        next: (res) => {
          const ordinate = res.sort((a, b) => 
            new Date(b.dataCreazione).getTime() - new Date(a.dataCreazione).getTime()
          );
          this.notifiche.set(ordinate);
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
    const tipoRichiesta = this.richiestaForm.value.tipoRichiesta;
    const messaggio = this.richiestaForm.value.messaggio;

    if (userId) {
      const testoCompleto = `[${tipoRichiesta}] ${messaggio}`;
      this.notificheService.inviaRichiesta(userId, testoCompleto).subscribe({
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

  estraiIdUtente(testo: string): string {
    return testo.match(/ID:\s*(\d+)/)![1];
  }

  estraiTipo(testo: string): string {
    return testo.match(/\[(.*?)\]/)![1];
  }

  estraiTesto(testo: string): string {
     return testo.replace(/.*?\s*-\s*\[.*?\]\s*/, '');
  }
}
