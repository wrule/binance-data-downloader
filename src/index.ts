import axios from 'axios';
import { JSDOM } from 'jsdom';

console.log('你好，世界');

async function getAllFileUrl(page_url: string, page_path: string) {
  const result: string[] = [];
  let next_marker = undefined;
  do {
    const rsp = await axios.get(page_url, {
      params: {
        delimiter: '/',
        prefix: page_path,
        marker: next_marker,
      },
    });
    if (rsp.status === 200) {
      const xmlText = rsp.data as string;
      const document = new JSDOM(xmlText).window.document;
      const keys = Array.from(document.querySelectorAll('ListBucketResult > Contents > Key'));
      result.push(...keys.map((key) => key.innerHTML.trim()));
      next_marker = document.querySelector('ListBucketResult > NextMarker')?.innerHTML;
    }
  } while (next_marker);
  return result;
}

async function main() {
  const a = await getAllFileUrl('https://s3-ap-northeast-1.amazonaws.com/data.binance.vision', 'data/futures/um/daily/klines/BTCUSDT/15m/');
  console.log(a.length);
}

main();
