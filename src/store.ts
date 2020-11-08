import CID from "cids";
import {hex} from "@47ng/codec";
import {Cato, CatoStore, CatoTags} from "./index";
import multihash from 'multihashing-async';
import {codec, hash} from "./encoding";

const cidToKey = (cid: CID) => hex.encode(cid.multihash);

export const createStore = () => {
  const db = {} as CatoStore;
  const get = (cid: CID): Cato => db[cidToKey(cid)];
  const set = (cid: CID, value: Cato) => db[cidToKey(cid)] = value;

  return ({
    create: async (type: string, data: Uint8Array): Promise<CID> => {
      const cid = new CID(1, codec, await multihash(data, hash));
      set(cid, {
        data,
        type,
        tags: {
          created: new Date().getTime(),
        },
      });

      return cid;
    },
    getData: (cid: CID): { data: Uint8Array, type: string } => {
      const {type, data} = get(cid);
      return {type, data};
    },
    getTags: (cid: CID): CatoTags => {
      const value = get(cid);
      return value.tags;
    },
    setTags: (cid: CID, tags: CatoTags): CatoTags => {
      const value = get(cid);
      set(cid, {
        ...value,
        tags: {
          created: value.tags.created,
          ...tags,
        }
      });
      return (get(cid).tags);
    }
  });
}