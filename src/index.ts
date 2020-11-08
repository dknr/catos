import {serve} from "./server";

export type CatoTags = {
  [type: string]: any;
}

export type Cato = {
  data: Uint8Array,
  type: string,
  tags: CatoTags,
}

export type CatoStore = {
  [key: string]: Cato,
};

serve();