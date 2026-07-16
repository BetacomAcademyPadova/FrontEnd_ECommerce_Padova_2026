import { ComponentType } from '@angular/cdk/overlay';
import { inject, Service } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Service()
export class UtilitiesServices {

    private dialog = inject(MatDialog)

    /**
    * chiamate generalizzato d'un dialog usando generics di Typescript
    * T = tipo del componente del dialog
    * D = tipo dei dati passati (data)
    * R = tipo del valore ritornato da afterClosed()
    */
    openDialog<T, D = any, R = any>(
        component: ComponentType<T>,
        data?: D,
        config?: MatDialogConfig<D>
    ): MatDialogRef<T, R> {

        const baseConfig: MatDialogConfig<D> = {
            width: '1100px',
            maxWidth: '90vw',
            height: 'auto',
            maxHeight: '200vh',
            enterAnimationDuration: '500ms',
            exitAnimationDuration: '500ms',
            panelClass: 'wide-dialog',
            data
        };

        return this.dialog.open<T, D, R>(component, {
            ...baseConfig,
            ...config   // per sovrascrivere qualcosa di specifico
        });
    }
}
