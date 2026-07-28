import { Component, inject, signal } from '@angular/core';
import { CarrelloServices } from '../../services/carrello-services';
import { AuthServices } from '../../auth/auth-services';
import { Carrello } from '../../models/carrello';


@Component({
  selector:'app-carello',
  imports:[],
  templateUrl:'./carello.html',
  styleUrl:'./carello.css'
})

export class Carello {
  private carrelloService = inject(CarrelloServices);
  private auth = inject(AuthServices);

  carrello = signal<Carrello | null>(null);

  ngOnInit(){
    this.caricaCarrello();
  }

  caricaCarrello(){
    const userId = Number(this.auth.grant().userId);

    console.log("USER ID:", userId);

    this.carrelloService.getByUser(userId)
    .subscribe({
      next:(res)=>{
        console.log("CARRELLO:",res);
        this.carrello.set(res);
      },
      error:(err)=>{
        console.error(err);
      }
    });
  }
}
