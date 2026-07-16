import { Routes } from '@angular/router';
import { Dashboard } from './componenti/dashboard/dashboard';
import { Home } from './componenti/home/home';
import { GestioneUtente } from './componenti/gestione-utente/gestione-utente';
import { GestioneVeicoli } from './componenti/gestione-veicoli/gestione-veicoli';
import { autentificateGuard } from './auth/autentificate-guard';
import { adminGuard } from './auth/admin-guard';
import { Carello } from './componenti/carello/carello';

export const routes: Routes = [
    { path:'', redirectTo:'dash', pathMatch:'full'},
    { path: 'dash', component: Dashboard, children: [
            { path:'', redirectTo:'home', pathMatch:'full'},
            { path: 'home', component: Home },
            { path: 'carello', component: Carello , canActivate:[autentificateGuard]},
            { path: 'utente', component: GestioneUtente , canActivate:[autentificateGuard, adminGuard]},
            { path: 'veicoli', component: GestioneVeicoli , canActivate:[autentificateGuard, adminGuard]},
        ]
    },

];
