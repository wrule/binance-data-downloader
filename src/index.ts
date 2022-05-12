import axios from 'axios';

console.log('你好，世界');

async function main() {
  const rsp = await axios.get('https://s3-ap-northeast-1.amazonaws.com/data.binance.vision', {
    params: {
      delimiter: '/',
      prefix: 'data/futures/um/daily/klines/BTCUSDT/15m/',
      marker: undefined,
    },
  });
  if (rsp.status === 200) {
    const xmlText = rsp.data as string;
    console.log(xmlText.length);
  }
}

main();
