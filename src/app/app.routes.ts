import { Routes } from '@angular/router';
import { Dashboard } from './componenti/dashboard/dashboard';
import { Home } from './componenti/home/home';
import { GestioneUtente } from './componenti/gestione-utente/gestione-utente';
import { autentificateGuard } from './auth/autentificate-guard';
import { adminGuard } from './auth/admin-guard';
import { Carello } from './componenti/carello/carello';
import { GestioneProdotti } from './componenti/gestione-prodotti/gestione-prodotti';
import { Prodotti } from './componenti/prodotti/prodotti';
import { Profilo } from './componenti/profilo/profilo';
import { Login } from './dialogs/login/login';
import { Notifiche } from './componenti/notifiche/notifiche';

export const routes: Routes = [
    { path:'', redirectTo:'dash', pathMatch:'full'},
    { path: 'dash', component: Dashboard, children: [
            { path:'', redirectTo:'home', pathMatch:'full'},
            { path: 'home', component: Home },
            { path: 'login', component: Login},
            { path: 'carello', component: Carello, /*canActivate:[autentificateGuard]*/},
            { path: 'prodotti', component: Prodotti }, 
            { path: 'profilo', component: Profilo },  
            { path: 'utente', component: GestioneUtente , /*canActivate:[autentificateGuard, adminGuard]*/},
            { path: 'notifiche', component: Notifiche , /*canActivate:[autentificateGuard, adminGuard]*/},
        ]
    },
];
