import { ProdottiCarrello } from "./prodotti-carrello";


export interface ProdottoCarrelloView extends ProdottiCarrello {

    descrizione: string;
    colore?: string;
    materiale?: string;
    altezza?: number;
    lunghezza?: number;
    larghezza?: number;
    categoria?: string;

}