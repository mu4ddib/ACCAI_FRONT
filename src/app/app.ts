import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute, { optional: true });
  private title = inject(Title);

  appName = 'ACCAI FRONT';
  pageTitle = signal(this.appName);

  constructor() {
    if (this.router && this.route) {
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        let r: ActivatedRoute = this.route!;
        while (r.firstChild) r = r.firstChild;
        const t = (r.snapshot.data['pageTitle'] as string) ?? this.appName;
        this.pageTitle.set(t);
        this.title.setTitle(`${t} · ${this.appName}`);
      });
    } else {
      this.title.setTitle(this.appName);
    }
  }
}
