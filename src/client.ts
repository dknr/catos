import CID from "cids";
import {CatoTags} from "./index";
import fetch from 'node-fetch';
import {base} from "./encoding";

const encodeCid = (cid: CID): string => cid.toBaseEncodedString(base);

export const createClient = (host: string) => {
  return ({
    getData: async (cid: CID): Promise<{type: string, data: Blob}> => {
      const res = await fetch(`${host}/data/${encodeCid(cid)}`, {
        method: 'GET',
      });
      const data = await res.blob();
      const type = res.headers.get('content-type');
      return { data, type };
    },
    postData: async (type: string, data: BodyInit): Promise<CID> => {
      const res = await fetch(`${host}/data`, {
        method: 'POST',
        body: data,
        headers: {
          'content-type': type,
        }
      });
      const cid = await res.text();
      return new CID(cid);
    },
    getTags: async (cid: CID): Promise<CatoTags> => {
      const res = await fetch(`${host}/tags/${encodeCid(cid)}`);
      return await res.json();
    },
    patchTags: async (cid: CID, tags: CatoTags): Promise<void> => {
      const res = await fetch(`${host}/tags/${encodeCid(cid)}`, {
        method: 'PATCH',
        body: JSON.stringify(tags),
        headers: {
          'content-type': 'application/json',
        }
      });
      return await res.json();
    }
  });
}