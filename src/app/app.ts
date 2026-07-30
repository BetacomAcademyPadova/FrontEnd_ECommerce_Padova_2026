import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthServices } from './auth/auth-services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private readonly auth = inject(AuthServices);

  protected readonly title = signal('frontendAngular');

  ngOnInit(): void {
    this.auth.loadToken();
  }
}