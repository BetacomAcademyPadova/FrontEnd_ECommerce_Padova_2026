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
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: "app-notifiche",
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, 
    MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule,
    MatOptionModule, MatSelectModule, MatBadgeModule, MatDatepickerModule],
  templateUrl: "./notifiche.html",
  providers: [provideNativeDateAdapter()],
  styleUrl: "./notifiche.css",
})
export class Notifiche implements OnInit
{
  private notificheService = inject(NotificheServices);
  private prodottoService = inject(ProdottoServices);
  public auth = inject(AuthServices);
  minDate: Date = new Date();

  notifiche = signal<any[]>([]);
  stockAlerts = signal<any[]>([]);
  prodottiList = signal<any[]>([]);
  msg = signal('');
  successMsg = signal('');

  richiestaForm: FormGroup = new FormGroup({
    tipoRichiesta: new FormControl('', Validators.required),
    prodottoId: new FormControl(null),
    valoreSconto: new FormControl(null, [Validators.min(1), Validators.max(100)]),
    dataInizio: new FormControl(null),
    dataFine: new FormControl(null),
    messaggio: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.notificheService.aggiornaConteggio();
    const userId = Number(this.auth.grant().userId);
    if (this.auth.grant().isVenditore && userId) {
      this.prodottoService.getProdottiByVenditore(userId).subscribe({
        next: (res: any) => {
          this.prodottiList.set(res);
        },
        error: () => {
          this.msg.set("Errore caricamento tuoi prodotti");
        }
      });
    } else {
      this.prodottoService.getAll().subscribe({
        next: (res: any) => {
          this.prodottiList.set(res);
        },
        error: () => {
          this.msg.set("Errore caricamento prodotti");
        }
      });
    }
    this.richiestaForm.get('tipoRichiesta')?.valueChanges.subscribe(tipo => {
      const prodottoCtrl = this.richiestaForm.get('prodottoId');
      const scontoCtrl = this.richiestaForm.get('valoreSconto');
      const dataInizioCtrl = this.richiestaForm.get('dataInizio');
      const dataFineCtrl = this.richiestaForm.get('dataFine');
      if (tipo === 'Rimuovere prodotto' || tipo === 'Creare sconto') {
        prodottoCtrl?.setValidators([Validators.required]);
      } else {
        prodottoCtrl?.clearValidators();
        prodottoCtrl?.setValue(null);
      }
      prodottoCtrl?.updateValueAndValidity();

      if (tipo === 'Creare sconto') {
        scontoCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        dataInizioCtrl?.setValidators([Validators.required]);
        dataFineCtrl?.setValidators([Validators.required]);
      } else {
        scontoCtrl?.clearValidators();
        scontoCtrl?.setValue(null);
        dataInizioCtrl?.clearValidators();
        dataInizioCtrl?.setValue(null);
        dataFineCtrl?.clearValidators();
        dataFineCtrl?.setValue(null);
      }
      scontoCtrl?.updateValueAndValidity();
      dataInizioCtrl?.updateValueAndValidity();
      dataFineCtrl?.updateValueAndValidity();
    });
    if (this.auth.grant().isAdmin) {
      this.notificheService.getTutteNonLette().subscribe({
        next: (res) => {
          const soloRichieste = res.filter(n => !n.messaggio?.includes('Stock basso'));
          const ordinate = soloRichieste.sort((a, b) => 
            new Date(b.dataCreazione).getTime() - new Date(a.dataCreazione).getTime()
          );
          this.notifiche.set(ordinate);
          this.notificheService.badgeCount.set(ordinate.length);
        },
        error: () => {
          this.msg.set("Errore caricamento notifiche");
          this.notificheService.badgeCount.set(0);
        }
      });
    }
    else if (this.auth.grant().isVenditore) {
      this.caricaMieRichieste();
      this.caricaStockAlerts();
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
          const soloRichieste = res.filter(n => !n.messaggio?.includes('Stock basso'));
          const ordinate = soloRichieste.sort((a, b) => 
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
    const valoreSconto = this.richiestaForm.value.valoreSconto;
    const messaggio = this.richiestaForm.value.messaggio;
    const dataInizio = this.richiestaForm.value.dataInizio;
    const dataFine = this.richiestaForm.value.dataFine;

    if (userId) {
      let testoCompleto = `[${tipoRichiesta}] - ${messaggio}`;
      if (tipoRichiesta === 'Rimuovere prodotto' && prodottoId) {
        testoCompleto = `[${tipoRichiesta}] - ID Prodotto: ${prodottoId} - ${messaggio}`;
      }
      else if (tipoRichiesta === 'Creare sconto' && prodottoId){
        const dataInizioDate = this.richiestaForm.value.dataInizio; 
        const dataFineDate = this.richiestaForm.value.dataFine;     
        const formattaData = (data: Date) => {
          if (!data) return '';
          const d = new Date(data);
          const giorno = String(d.getDate()).padStart(2, '0');
          const mese = String(d.getMonth() + 1).padStart(2, '0'); //+1 PERCHE' I MESI IN JAVA PARTONO DA 0
          const anno = d.getFullYear();
          return `${giorno}/${mese}/${anno}`;
        };
        const dataInizio = formattaData(dataInizioDate);
        const dataFine = formattaData(dataFineDate);
        testoCompleto = `[${tipoRichiesta}] - ID Prodotto: ${prodottoId} - Sconto: ${valoreSconto}% - Dal: ${dataInizio} - Al: ${dataFine} - ${messaggio}`;
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

  accettaRichiesta(idNotifica: number) {
    this.notificheService.accettaRichiesta(idNotifica).subscribe({
      next: () => {
        this.notifiche.update(lista => {
          const nuovaLista = lista.filter(n => n.idNotifica !== idNotifica);
          return nuovaLista;
        });
        this.notificheService.aggiornaConteggio();
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
          return nuovaLista;
        });
        this.notificheService.aggiornaConteggio();
      },
      error: () => {
        this.msg.set("Errore durante il rifiuto della richiesta");
      }
    });
  }

  caricaStockAlerts() {
    const userId = Number(this.auth.grant().userId);
    if (userId) {
      this.notificheService.getNonLette(userId).subscribe({
        next: (res) => {
          const alerts = res.filter(n => n.messaggio?.includes('Stock basso'));
          const ordinate = alerts.sort((a, b) => 
            new Date(b.dataCreazione).getTime() - new Date(a.dataCreazione).getTime()
          );
          this.stockAlerts.set(ordinate);
          this.notificheService.badgeCount.set(alerts.length);
        },
        error: () => {
          this.msg.set("Errore nel caricamento degli alert di magazzino");
        }
      });
    }
  }

  segnaStockComeLetto(idNotifica: number) {
    this.notificheService.segnaComeLetta(idNotifica).subscribe({
      next: () => {
        this.caricaStockAlerts();
        this.notificheService.aggiornaConteggio();
      },
      error: () => {
        this.msg.set("Errore durante l'aggiornamento della notifica");
      }
    });
  }

  estraiIdUtente(testo: string): string {
    const match = testo.match(/utente ID:\s*(\d+)/);
    return match ? match[1] : '';
  }

  estraiIdProdotto(testo: string): string {
    const match = testo.match(/ID Prodotto:\s*(\d+)/);
    return match ? match[1] : '';
  }

  estraiTipo(testo: string): string {
    const match = testo.match(/\[(.*?)\]/);
    return match ? match[1] : '';
  }

  estraiSconto(testo: string): string {
    const match = testo.match(/Sconto:\s*([0-9]+%)/);
    return match ? match[1] : '';
  }

  estraiDataInizio(testo: string): string {
    const match = testo.match(/Dal:\s*([0-9/]+)/);
    return match ? match[1] : '';
  }

  estraiDataFine(testo: string): string {
    const match = testo.match(/Al:\s*([0-9/]+)/);
    return match ? match[1] : '';
  }

  estraiTesto(testo: string): string {
    return testo
      .replace(/Richiesta ricevuta dall'utente ID:\s*\d+\s*-\s*/g, '') 
      .replace(/\[.*?\]\s*-\s*/g, '')                                       
      .replace(/ID Prodotto:\s*\d+\s*-\s*/g, '') 
      .replace(/Sconto:\s*[0-9]+%\s*-\s*/g, '')  
      .replace(/Dal:\s*[0-9/]+\s*-\s*/g, '') 
      .replace(/Al:\s*[0-9/]+\s*-\s*/g, '')                                   
      .trim();
  }

  formattaDataPerBackend(dataString: string): string {
    if (!dataString) return '';
    const parti = dataString.split('-'); // ["2026", "07", "31"]
    if (parti.length !== 3) return dataString;
    return `${parti[2]}/${parti[1]}/${parti[0]}`; // "31/07/2026"
  }
}