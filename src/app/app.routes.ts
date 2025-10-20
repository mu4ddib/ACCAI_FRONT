import { Routes } from '@angular/router';
import { DropFile } from './ui/components/drop-file/drop-file';

export const routes: Routes = [
    { path: '', redirectTo: 'importar-csv', pathMatch: 'full' },
    { path: 'importar-csv', component: DropFile, title: 'Importar CSV', data: { pageTitle: 'Importar CSV' }  },
];
