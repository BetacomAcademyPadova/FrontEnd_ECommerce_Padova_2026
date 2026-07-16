import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from './auth-services';

export const autentificateGuard: CanActivateFn = (route, state) => {
const authservices = inject(AuthServices);
  const routing = inject(Router); 

  if (!authservices.isAutentificated())
    routing.navigate(['login'])
      
  return authservices.isAutentificated();

};
