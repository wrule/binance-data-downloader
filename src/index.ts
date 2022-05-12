import axios from 'axios';
import path from 'path';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import moment from 'moment';

export
function log(name: string, text = '') {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss:SSS')} ${name}]${text ? `: ${text}` : '...'}`);
}

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
      result.push(...keys.map((key) => file_base_url + key.innerHTML.trim()));
      next_marker = document.querySelector('ListBucketResult > NextMarker')?.innerHTML;
    }
  } while (next_marker);
  return result;
}

async function downloadFile(
  file_url: string,
  dir_path: string,
) {
  try {
    log('下载文件', file_url);
    const rsp = await axios.get(file_url, { responseType: 'stream' });
    rsp.data.pipe(fs.createWriteStream(path.join(dir_path, path.basename(file_url))));
  } catch (e) {
    log('下载出错，重试下载', file_url);
    await downloadFile(file_url, dir_path);
  }
}

async function main() {
  const a = await getAllFileUrl(
    'https://s3-ap-northeast-1.amazonaws.com/data.binance.vision',
    'data/futures/um/daily/klines/BTCUSDT/15m/',
    'https://data.binance.vision/',
  );
  await downloadFile(a[0], 'src');
}

main();
