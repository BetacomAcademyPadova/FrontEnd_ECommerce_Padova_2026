export interface OrdineReq {
  data: string;
  totale: number;
  userId: number;
  indirizzoFatturazioneId: number;
  statoId: number;
}

export interface OrdineDTO {
  idOrdine: number;
  data: string;
  totale: number;
}

export interface IndirizzoDTO {
  idIndirizzo: number;
  via: string;
  citta: string;
  cap: string;
  predefinito: boolean;
}
export interface StatoOrdineDTO {
    idStatoOrdine: number;
    statoOrdine: string;
}

export interface IndirizzoReq {
  idIndirizzo?: number;
  via: string;
  citta: string;
  cap: string;
  predefinito?: boolean;
  idUser?: number;
}