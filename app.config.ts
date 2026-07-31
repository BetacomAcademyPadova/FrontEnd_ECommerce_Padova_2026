import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_SETTING } from './settings/token/token';
import { authInterceptor } from './interceptors/auth-interceptors/auth-interceptors';
import { AuthServices } from './auth/auth-services';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_SETTING,
      useValue: {
        apiUrl: 'http://localhost:9090/rest/',
        pageSize: 4
      }
    },

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),

    provideAppInitializer(() => {
      const auth = inject(AuthServices);
      auth.loadToken();
    })
  ]
};