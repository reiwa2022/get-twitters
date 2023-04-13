'use strict';
//
//  モジュール名: ファイル操作関連モジュール
//  説明: アカウント一覧ファイルを同期処理で読み込み、配列で返します。
//

// ファイル読み書き用にfsモジュールを取得します。
const fs = require('fs');
// 一行ごとに読み込むためreadlineモジュールを取得します。
const readline = require('readline');

/**
 * アカウント一覧ファイルを読み込み、ツイート認証用パラメーターを返します。
 * @param {string} filePath アカウント一覧ファイル
 * @param {string} encoding 読み込んだ文字のエンコード方法
 * @returns {Promise<array>} arrayUserTl　ツイッターAPIパラメーター
 */
exports.readFileLines = function (filePath, encoding) {
  // readSteamを作成します。 (readLineではストリームを作成する必要あり)
  let rs = fs.createReadStream(filePath, { encoding: encoding });
  // インターフェースを設定します。(readLineのインターフェースにfsのストリームを設定)
  let rl = readline.createInterface({
    // 読み込み用のストリームを設定します。
    input: rs,
  });
  // ファイル読み込みを同期的に行うためPromiseオブジェクトを作成します。
  return new Promise((resolve, reject) => {
    // ツイッター認証パラメータ用の配列を作成します。
    let arrayUserTl = [];
    // 一行ずつ読み込み、配列に追加していきます。
    rl.on('line', (lineString) => {
      arrayUserTl.push({ screen_name: lineString, include_entities: 'true' });
    });
    // 読み込みが終了したら、arrayUserTlをresolveし、Promiseチェーンに渡します。
    rl.on('close', () => {
      resolve(arrayUserTl);
    });
  });
};

/**
 * アカウント一覧ファイルを読み込み、検索用のツイート認証用パラメーターを同期的に返します。
 * @param {string} filePath アカウント一覧ファイル
 * @param {string} encoding 読み込んだ文字のエンコード方法
 * @param {number} tweetsNum 表示するツイート数
 * @param {string} searchWord 検索ワード
 * @returns {Promise<array>} arraySearchTl　検索用のツイッターAPIパラメーター
 */
exports.readSearchFileLines = (filePath, encoding, tweetsNum, searchWord) => {
  // readSteamを作成します。(readLineではストリームを作成する必要あり)
  let rs = fs.createReadStream(filePath, { encoding: encoding });
  // インターフェースを設定します。(readLineのインターフェースにfsのストリームを設定)
  let rl = readline.createInterface({
    // 読み込み用のストリームを設定します。
    input: rs,
  });
  // ファイル読み込みを同期的に行うためPromiseオブジェクトを作成します。
  return new Promise((resolve, reject) => {
    // ツイッター認証パラメータ用の配列を作成します。
    let arraySearchTl = [];
    // 一行ずつ読み込み、配列に追加していきます。
    rl.on('line', (lineString) => {
      arraySearchTl.push({ from: lineString, count: tweetsNum, q: searchWord });
    });
    // 読み込みが終了したら、arraySearchTlをresolveし、Promiseチェーンに渡します。
    rl.on('close', () => {
      resolve(arraySearchTl);
    });
  });
};
