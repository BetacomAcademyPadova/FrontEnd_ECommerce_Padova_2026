import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AutentificazioneServices } from "../../security/autentificazione-services";
import { AuthServices } from "../../auth/auth-services";
import { catchError, switchMap, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const autentificationSercice = inject(AutentificazioneServices);
    const authServices = inject(AuthServices);
    const token = authServices.grant().token;


    let cloned = req.clone({
        withCredentials: true
    });

    const publicUrls = [
        '/rest/User/login',
        '/rest/User/create',
        '/rest/auth/refresh',
        '/public/',
        '/images/'
    ];

    const isPublic = publicUrls.some(url => req.url.includes(url))
    let requestToSend = req.clone({
        withCredentials: true
    });

    if (token && !isPublic) { 
        requestToSend = requestToSend.clone({ 
            setHeaders: 
            { 
                Authorization: 'Bearer ' + token 
            } 
        });
    }
    return next(requestToSend).pipe(
        catchError((error: HttpErrorResponse) => { 
            /* * Il refresh viene eseguito solo quando: 
            * - la risposta è 401; * - la richiesta non è pubblica; 
            * - la richiesta non è già /auth/refresh. */ 
            if (error.status !== 401 || isPublic) { 
                return throwError(() => error); 
            } 
            console.log('prova de refresh.....')
            return autentificationSercice.refreshToken().pipe(
                switchMap(response => { 
                    authServices.setToken(response.accessToken); // save new token 
                   const repeatedRequest = req.clone({     // resend ol request with new token
                    withCredentials: true, 
                    setHeaders: { 
                        Authorization: 'Bearer ' + response.accessToken 
                    } }); 
                    return next(repeatedRequest); 
                }), 
                catchError(refreshError => { 
                    authServices.resetAll(); 
                    return throwError(() => refreshError);
                 }
                ));
             }));
};