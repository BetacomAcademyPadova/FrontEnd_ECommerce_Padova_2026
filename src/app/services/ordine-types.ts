export interface OrdineReq {
  data: string;
  userId: number;
  indirizzoSpedizioneId: number;
  indirizzoFatturazioneId: number;
  statoId: number;
}

export interface OrdineDTO {
  idOrdine: number;
  data: string;
  totale: number;
  statoOrdine: string;
}

export interface StatoOrdineDTO {
  idStatoOrdine: number;
  statoOrdine: string;
}

export interface IndirizzoDTO {
  idIndirizzo: number;
  via: string;
  citta: string;
  cap: string;
  predefinito: boolean;
}

export interface IndirizzoReq {
  idIndirizzo?: number;
  via: string;
  citta: string;
  cap: string;
  predefinito?: boolean;
  idUser?: number;
}

export interface ProdottiOrdineDTO {
  idOrdine: number;
  idItem: number;
  prodotto: string;
  quantita: number;
  prezzo: number;
  divisioneOrdine?: any;
}