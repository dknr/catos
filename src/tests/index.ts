import {createClient} from "../client";

export const runTests = async () => {
  const client = createClient('http://localhost:3000');
  const cid = await client.postData('text/plain', 'hello world!');

  const {type, data} = await client.getData(cid);
  console.log({type, data});

  const tags = await client.getTags(cid);
  console.log(tags);

  const newTags = await client.patchTags(cid, {foo: 'bar'});
  console.log(newTags);

  console.log('done.');
}
