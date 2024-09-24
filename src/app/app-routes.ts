import { Routes } from "@angular/router";

export const gameRoutes: Routes = [
    {
        path: 'tips',
        loadComponent: () => import('./components/game-root/tips/tips.component').then(c => c.TipsComponent),
    },
    {
        path: 'search',
        loadComponent: () => import('./components/game-root/search/search.component').then(c => c.SearchComponent),
    },
    {
        path: 'chapters',
        loadComponent: () => import('./components/game-root/chapter-navigation/chapter-navigation.component').then(c => c.ChapterNavigationComponent),
    },
    {
        path: 'chapters/:chapterNumber',
        loadComponent: () => import('./components/game-root/reading-space/reading.component').then(c => c.ReadingComponent),
    },
    {
        path: 'routes',
        loadComponent: () => import('./components/game-root/chapter-navigation/chapter-navigation.component').then(c => c.ChapterNavigationComponent),
    },
    {
        path: 'routes/:routeName',
        loadComponent: () => import('./components/game-root/chapter-navigation/chapter-navigation.component').then(c => c.ChapterNavigationComponent),
    },
    {
        path: 'routes/:routeName/:chapterNumber',
        loadComponent: () => import('./components/game-root/reading-space/reading.component').then(c => c.ReadingComponent),
    },
    {
        path: ':mediaPage',
        loadComponent: () => import('./components/game-root/supplementary/supplementary.component').then(c => c.SupplementaryPageComponent)
    }
]

export const APP_ROUTES: Routes = [
    {
        path: '', redirectTo: 'games', pathMatch: 'full'
    },
    {
        path: 'settings',  loadComponent: () => import('./components/settings/settings.component').then(c => c.SettingsComponent)
    },
    {
        path: 'info', loadComponent: () => import('./components/general-info/general-info.component').then(c => c.GeneralInfoComponent)
    },
    {
        path: 'games', loadComponent: () => import('./components/home-page/home.component').then(c => c.HomeComponent),
    },
    {
        path: 'games/:gameName', redirectTo: 'games/:gameName/routes', pathMatch: 'full'
    },
    {
        path: 'games/:gameName',
        loadComponent: () => import('./components/game-root/game-root.component').then(c => c.GameRootComponent),
        children: gameRoutes
    },
    {
        path: '404',
        loadComponent: () => import('./components/error-page/error.component').then(c => c.ErrorComponent),
    },
    {
        path: '**',
        redirectTo: '/404'
    }

];
