import { Service, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserDTO } from '../componenti/models/user-dto/user-dto';

@Service()
export class AuthServices {

    private readonly platformId = inject(PLATFORM_ID);

    grant = signal({
        token: null,
        isAdmin: false,
        isLogged: false,
        isVenditore: false,
        userId: null as string | null,
        username: null as string | null
    });

    setToken(token: string) {
        if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem("token", token);
        }
        this.grant.update(grant => ({
            ...grant,
            token: token
        }));
    }

    loadToken() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const token = sessionStorage.getItem("token");
        const user = sessionStorage.getItem("user");

        console.log("TOKEN:", token);
        console.log("USER:", user);

        if (token && user) {

            const userObj: UserDTO = JSON.parse(user);

            this.grant.set({
                token: token,
                isLogged: true,
                isAdmin: userObj.ruolo === 'Admin',
                isVenditore: userObj.ruolo === 'Venditore',
                userId: userObj.userId,
                username: userObj.username
            });
        }
    }

    setAutentificated(user: UserDTO) {

        if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem("user", JSON.stringify(user));
        }

        let admin = user.ruolo === 'Admin';
        let venditore = user.ruolo === 'Venditore';

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

        if (isPlatformBrowser(this.platformId)) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
        }

        this.grant.set({
            token: null,
            isAdmin: false,
            isLogged: false,
            isVenditore: false,
            userId: null,
            username: null
        });
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