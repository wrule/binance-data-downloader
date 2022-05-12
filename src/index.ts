import axios from 'axios';
import path from 'path';
import { JSDOM } from 'jsdom';

async function getAllFileUrl(
  api: string,
  data_path: string,
  file_base_url: string,
) {
  const result: string[] = [];
  let next_marker = undefined;
  do {
    const rsp = await axios.get(api, {
      params: {
        delimiter: '/',
        prefix: data_path,
        marker: next_marker,
      },
    });
    if (rsp.status === 200) {
      const xmlText = rsp.data as string;
      const document = new JSDOM(xmlText).window.document;
      const keys = Array.from(document.querySelectorAll('ListBucketResult > Contents > Key'));
      result.push(...keys.map((key) => path.join(file_base_url, key.innerHTML.trim())));
      next_marker = document.querySelector('ListBucketResult > NextMarker')?.innerHTML;
    }
  } while (next_marker);
  return result;
}

async function main() {
  const a = await getAllFileUrl(
    'https://s3-ap-northeast-1.amazonaws.com/data.binance.vision',
    'data/futures/um/daily/klines/BTCUSDT/15m/',
    'https://data.binance.vision',
  );
  console.log(a[0]);
}

main();
