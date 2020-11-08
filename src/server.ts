import {createStore} from "./store";
import express, {json, Request, RequestHandler} from "express";
import CID from "cids";
import {raw} from "body-parser";
import {hex} from "@47ng/codec";
import {runTests} from "./tests";
import {base} from "./encoding";

export const serve = () => {
  const store = createStore();
  const app = express();

  app.use((req, res, next) => {
    console.log(`${req.method.padEnd(5)} ${req.path}`);
    return next();
  });

  const parseCid: RequestHandler = ((req: Request, res, next) => {
    // @ts-ignore
    req.cid = new CID(req.params.cid);
    return next();
  });

  app.get('/', (req, res) => {
    res.send('hello world');
  });
  app.post('/data', raw({type: '*/*'}), async (req, res) => {
    const contentType = req.headers["content-type"];
    if (contentType === undefined || contentType === 'application/x-www-form-urlencoded') {
      res.status(415);
      return;
    }

    const cid = await store.create(contentType, req.body);
    res.send(cid.toBaseEncodedString(base));
  });

  app.get('/data/:cid', parseCid, (req, res) => {
    // @ts-ignore
    const cid = req.cid;
    const {data, type} = store.getData(cid);

    res.setHeader('Content-Type', type);
    res.send(data);
  });

  app.get('/tags/:cid', parseCid, (req, res) => {
    // @ts-ignore
    const cid = req.cid;
    res.send(store.getTags(cid));
  });

  app.patch('/tags/:cid', json({type: 'application/json'}), parseCid, async (req, res) => {
    // @ts-ignore
    const cid = req.cid;
    const tags = store.getTags(cid);
    res.send(store.setTags(cid, {
      ...tags,
      ...req.body,
    }));
  });

  app.get('/check/:cid', parseCid, async (req, res) => {
    // @ts-ignore
    const cid = req.cid;

    const hash = cid.multihash.subarray(2);
    res.send({
      hash: hex.encode(hash),
    });
  });

  app.listen(3000, async () => {
    await runTests();
  });
}

