import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors} from '@angular/common/http';
import { APP_SETTING } from './settings/token/token';
import { authInterceptor } from './interceptors/auth-interceptors/auth-interceptors';
import { AutentificazioneServices } from './security/autentificazione-services';
import { firstValueFrom } from 'rxjs';

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
      withInterceptors([authInterceptor])    // interceptor registration
    ),
    provideAppInitializer(() => { // service to execute in startup
      const refreshService = inject(AutentificazioneServices);
      return firstValueFrom(refreshService.restoreSession()) // execute refresh in startup

    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration()
  ]
};
