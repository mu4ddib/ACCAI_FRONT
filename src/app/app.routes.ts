import { Routes } from '@angular/router';
import { DropFile } from './ui/components/drop-file/drop-file';
import { Auth } from './ui/components/auth/auth';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  { path: '', component: Auth },
  {
    path: 'importar-csv',
    component: DropFile,
    title: 'Importar CSV',
    data: { pageTitle: 'Importar CSV' },
    canActivate: [MsalGuard]
  },
  { path: '**', redirectTo: '' }
];
