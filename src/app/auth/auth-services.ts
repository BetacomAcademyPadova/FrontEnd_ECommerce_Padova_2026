import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service, signal } from '@angular/core';

@Service()
export class AuthServices {
    private platformId = inject((PLATFORM_ID));
    grant = signal({
        isAdmin: false,
        isLogged: false,
        isVenditore: false,
        isMenu:false,
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
                isMenu:false,
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
                isMenu : false,
                userId
            })
        }
    }

    setAdmin() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("isAdmin", "1")
            this.grant.update(grant => ({
                ...grant,     // copia tutte le proprieta di grant
                isAdmin: true,
                isMenu: true
            }));
        }
    }
    
    setVenditore() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("isAdmin", "0")
            this.grant.update(grant => ({
                ...grant,     // copia tutte le proprieta di grant
                isVenditore: true,
                isAdmin: false
            }));
        }

    }

    setUser() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("isAdmin", "0")
            this.grant.update(grant => ({
                ...grant,     // copia tutte le proprieta di grant
                isAdmin: false
            }));
        }

    }


    resetAll() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem("isLogged")
            localStorage.removeItem("isAdmin")
            localStorage.removeItem("userId")
            this.grant.set({
                isAdmin: false,
                isLogged: false,
                isMenu : false,
                isVenditore: false,
                userId : null
            })
        }
    }


    isAutentificated() {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem("isLogged") === '1'
        }
        return false;
    }
    isRoleAdmin() {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem("isAdmin") === '1'
        }
        return false;
    }
    isRoleVenditore() {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem("isVenditore") === '1'
        }
        return false;
    }

}
