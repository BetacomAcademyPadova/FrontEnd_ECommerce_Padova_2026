import { inject, PLATFORM_ID, Service, effect, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserDTO } from '../componenti/models/user-dto/user-dto';

const CHIAVE = 'grant';

@Service()
export class AuthServices {

    // 1. serve a sapere se siamo nel browser (con l'SSR non c'è sessionStorage)
    private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    // 2. il valore iniziale non è più fisso: prova a rileggere quello salvato
    grant = signal(this.leggiIniziale());

    constructor() {
        // 3. ogni volta che grant cambia, lo salva
        effect(() => {
            const g = this.grant();
            if (this.isBrowser) {
                sessionStorage.setItem(CHIAVE, JSON.stringify(g));
            }
        });
    }

    private leggiIniziale() {
        const vuoto = {
            token: null as string | null,
            isAdmin: false,
            isLogged: false,
            isVenditore: false,
            userId: null as string | null,
            username: null as string | null
        };

        if (!this.isBrowser) return vuoto;

        try {
            const salvato = sessionStorage.getItem(CHIAVE);
            return salvato ? { ...vuoto, ...JSON.parse(salvato) } : vuoto;
        } catch {
            return vuoto;
        }
    }

    setToken(token: string) {
        this.grant.update(grant => ({
            ...grant,
            token: token
        }));
    }

    setAutentificated(user: UserDTO) {
        let admin = user.ruolo === 'Admin' ? true : false;
        let venditore = user.ruolo === 'Venditore' ? true : false;

        this.grant.update(grant => ({
            ...grant,
            isLogged: true,
            isAdmin: admin,
            isVenditore: venditore,
            userId: user.userId,
            username: user.username
        }));
    }

    resetAll() {
        this.grant.set(this.vuoto());
    }

    private vuoto() {
        return {
            token: null as string | null,
            isAdmin: false,
            isLogged: false,
            isVenditore: false,
            userId: null as string | null,
            username: null as string | null
        };
    }

    isAutentificated(): boolean {
        return this.grant().isLogged;
    }

    isRoleAdmin() {
        return this.grant().isAdmin;
    }

    isRoleVenditore() {
        return this.grant().isVenditore;
    }

    getUsername(): string | null {
        return this.grant().username;
    }
}