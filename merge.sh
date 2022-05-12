#!/bin/bash
cd download
echo '🚀解压文件中...'
rm *.csv
unzip '*.zip'
echo '🚀拼接文件中...'
cat *.csv > ../output/result.csv
echo '😄拼接文件完成'
