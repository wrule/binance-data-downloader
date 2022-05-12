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

async function batchDownloadFiles(
  file_urls: string[],
  dir_path: string,
  batch_size = 10,
) {
  const task_urls = file_urls.slice();
  async function worker() {
    if (task_urls.length > 0) {
      await downloadFile(task_urls.pop() as string, dir_path);
      await worker();
    }
  }
  await Promise.all(Array(batch_size).fill(0).map(() => worker()));
}

async function main() {
  const a = await getAllFileUrl(
    'https://s3-ap-northeast-1.amazonaws.com/data.binance.vision',
    'data/futures/um/daily/klines/BTCUSDT/1m/',
    'https://data.binance.vision/',
  );
  await batchDownloadFiles(a, 'download', 50);
}

main();
