import { InjectionToken } from "@angular/core";
import { AppSettings } from "./config-model";

export const APP_SETTING = new InjectionToken<AppSettings>('app.settings')