import { Service, signal } from '@angular/core';
import { UserDTO } from '../componenti/models/user-dto/user-dto';

@Service()
export class AuthServices {
    grant = signal({
        token: null,
        isAdmin: false,
        isLogged: false,
        isVenditore: false,
        userId: null as string | null,
    })

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            console.log("restore ----");
            const isLogged = localStorage.getItem("isLogged") == "1";
            const isAdmin = localStorage.getItem("isAdmin") == "1";
            const isVenditore = localStorage.getItem("isVenditore") == "1";
            const userId = localStorage.getItem("userId");
            this.grant.set({
                isAdmin,
                isLogged,
                isVenditore,
                userId
            })
        }
    }

    setAutentificated(userId: any) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("isLogged", "1")
            localStorage.setItem("userId", userId);            
            this.grant.set({
                isAdmin: false,
                isLogged: true,
                isVenditore: false,
                userId
            })
        }
    }

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
        }));

    }


    resetAll() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem("isLogged")
            localStorage.removeItem("isAdmin")
            localStorage.removeItem("userId")
            this.grant.set({
                isAdmin: false,
                isLogged: false,
                isVenditore: false,
                userId : null
            })
        }
    }

    isAutentificated(): boolean {
        return this.grant().isLogged;
    }

    isRoleAdmin() {
        return this.grant().isAdmin;
    }

}