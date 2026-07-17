import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import {MatSidenavModule} from '@angular/material/sidenav';
import { RouterOutlet } from "@angular/router";
import { AuthServices } from '../../auth/auth-services';

@Component({
  selector: "app-profilo",
  imports: [FormsModule, MatSidenavModule, RouterOutlet],
  templateUrl: "./profilo.html",
  styleUrl: "./profilo.css",
})
export class Profilo 
{
  protected readonly auth = inject(AuthServices);
}
