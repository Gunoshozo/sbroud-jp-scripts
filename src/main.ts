
import { environment } from './environments/environment';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { GameRootService } from './app/components/game-root/game-root.serviece';
import { GlobalLoaderService } from './app/services/global-loader.service';
import { TUI_SANITIZER, TuiRootModule } from '@taiga-ui/core';
import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { SakuraService } from './app/services/sakura.service';
import { provideRouter } from '@angular/router';
import { APP_ROUTES } from './app/app-routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { provideHttpClient, withFetch } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom([BrowserAnimationsModule]),
    importProvidersFrom(TuiRootModule),
    provideHttpClient(withFetch()),
    GameRootService,
    GlobalLoaderService,
    { provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
    SakuraService,
    provideRouter(APP_ROUTES)
  ]
})