import { ProdottiCarrello } from "./prodotti-carrello";

export interface Carrello {
    idCarrello: number;
    dataUltimoAgg: string;
    user: any;
    totale: number;
    prodotti: ProdottiCarrello[];
}