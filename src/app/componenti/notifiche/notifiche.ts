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
import { MatBadgeModule } from '@angular/material/badge';
import { ProdottoServices } from '../../services/prodotto-services';

@Component({
  selector: "app-notifiche",
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, 
    MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule,
    MatOptionModule, MatSelectModule, MatBadgeModule],
  templateUrl: "./notifiche.html",
  styleUrl: "./notifiche.css",
})
export class Notifiche implements OnInit
{
  private notificheService = inject(NotificheServices);
  private prodottoService = inject(ProdottoServices);
  public auth = inject(AuthServices);

  notifiche = signal<any[]>([]);
  prodottiList = signal<any[]>([]);
  msg = signal('');
  successMsg = signal('');

  richiestaForm: FormGroup = new FormGroup({
    tipoRichiesta: new FormControl('', Validators.required),
    prodottoId: new FormControl(null),
    messaggio: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.prodottoService.getAll().subscribe({
      next: (res: any) => {
        console.log("DATI PRODOTTO RICEVUTI:", res);
        this.prodottiList.set(res);
      },
      error: () => {
        this.msg.set("Errore caricamento prodotti");
      }
    });
    this.richiestaForm.get('tipoRichiesta')?.valueChanges.subscribe(tipo => {
      const prodottoCtrl = this.richiestaForm.get('prodottoId');
      if (tipo === 'Rimuovere prodotto') {
        prodottoCtrl?.setValidators([Validators.required]);
      } else {
        prodottoCtrl?.clearValidators();
        prodottoCtrl?.setValue(null);
      }
      prodottoCtrl?.updateValueAndValidity();
    });
    if (this.auth.grant().isAdmin) {
      this.notificheService.getTutteNonLette().subscribe({
        next: (res) => {
          const ordinate = res.sort((a, b) => 
            new Date(b.dataCreazione).getTime() - new Date(a.dataCreazione).getTime()
          );
          this.notifiche.set(ordinate);
          this.notificheService.badgeCount.set(res.length);
        },
        error: () => {
          this.msg.set("Errore caricamento notifiche");
          this.notificheService.badgeCount.set(0);
        }
      });
    }
    else if (this.auth.grant().isLogged) {
      this.caricaMieRichieste();
    }
  }

  caricaMieRichieste() {
    const userId = Number(this.auth.grant().userId);
    if (userId) {
      this.notificheService.getRichiesteUtente(userId).subscribe({
        next: (res) => {
          const ordinate = res.sort((a, b) => 
            new Date(b.dataCreazione).getTime() - new Date(a.dataCreazione).getTime()
          );
          this.notifiche.set(ordinate);
        },
        error: () => {
          this.msg.set("Errore caricamento storico richieste");
        }
      });
    }
  }

  inviaRichiesta() 
  {
    if (this.richiestaForm.invalid) return;

    this.msg.set('');
    this.successMsg.set('');

    const userId = Number(this.auth.grant().userId);
    const tipoRichiesta = this.richiestaForm.value.tipoRichiesta;
    const prodottoId = this.richiestaForm.value.prodottoId;
    const messaggio = this.richiestaForm.value.messaggio;

    if (userId) {
      let testoCompleto = `[${tipoRichiesta}] - ${messaggio}`;
      if (tipoRichiesta === 'Rimuovere prodotto' && prodottoId) {
        testoCompleto = `[${tipoRichiesta}] - ID Prodotto: ${prodottoId} - ${messaggio}`;
      }
      this.notificheService.inviaRichiesta(userId, testoCompleto).subscribe({
        next: () => {
          this.successMsg.set("Richiesta inviata con successo!");
          this.richiestaForm.reset();
          this.caricaMieRichieste();
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

  estraiIdProdotto(testo: string): string {
    return testo.match(/ID Prodotto:\s*(\d+)/)![1];
  }

  estraiTipo(testo: string): string {
    return testo.match(/\[(.*?)\]/)![1];
  }

  estraiTesto(testo: string): string {
    return testo
      .replace(/Richiesta ricevuta dall'utente ID:\s*\d+\s*-\s*/g, '') 
      .replace(/\[.*?\]\s*-\s*/g, '')                                
      .replace(/ID Prodotto:\s*\d+\s*-\s*/g, '')                      
      .trim();
  }

  accettaRichiesta(idNotifica: number) {
    this.notificheService.accettaRichiesta(idNotifica).subscribe({
      next: () => {
        this.notifiche.update(lista => {
          const nuovaLista = lista.filter(n => n.idNotifica !== idNotifica);
          // Aggiorna il badge con il nuovo numero residuo
          this.notificheService.badgeCount.set(nuovaLista.length);
          return nuovaLista;
        });
      },
      error: () => {
        this.msg.set("Errore durante l'accettazione della richiesta");
      }
    });
  }

  rifiutaRichiesta(idNotifica: number) {
    this.notificheService.rifiutaRichiesta(idNotifica).subscribe({
      next: () => {
        this.notifiche.update(lista => {
          const nuovaLista = lista.filter(n => n.idNotifica !== idNotifica);
          this.notificheService.badgeCount.set(nuovaLista.length);
          return nuovaLista;
        });
      },
      error: () => {
        this.msg.set("Errore durante il rifiuto della richiesta");
      }
    });
  }
}
