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
        username: null as string | null
    })

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