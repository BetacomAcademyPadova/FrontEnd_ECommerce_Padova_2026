import { CanActivateFn } from '@angular/router';
import { AuthServices } from './auth-services';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
    const authServices = inject(AuthServices);

  return authServices.isRoleAdmin();
};
