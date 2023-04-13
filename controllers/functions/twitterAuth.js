'use strict';
//
//  モジュール名: ツイッター認証関連モジュール
//  説明: ツイッターAPIの認証とツイッター関連情報の取得/検索を行います。
//

// ツイッターAPI関連のライブラリーを取得します。
const TwitterAuth = require('twitter');

/**
 * ツイッター認証用のインスタンスを作成します。
 * @returns {Object} ツイッター認証用のインスタンス
 */
const twitterAuth = () => {
  return new TwitterAuth({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });
};
// ツイッター認証用のインスタンスを取得します。
const client = twitterAuth();

// ツイッター情報取得/検索関数をオブジェクトしてまとめます。
module.exports = {
  /**
   * ツイート情報を取得します。
   * @param {object} paramsUserTl ツイート情報取得用のパラメーター
   * @returns {Promise<object|Error>} tweetsUserTl ツイート情報オブジェクト | error エラーオブジェクト
   */
  getTL: (paramsUserTl) => {
    // ツイッターAPIに同期的にアクセスするためPromiseオブジェクトを作成します。
    return new Promise((resolve, reject) => {
      // ツイート情報を取得します
      client.get('statuses/user_timeline', paramsUserTl, (error, tweetsUserTl, response) => {
        if (!error) {
          resolve(tweetsUserTl);
        } else {
          reject(error);
        }
      });
    });
  },

  /**
   * ツイートを検索し検索結果を取得します。
   * @param {object} paramsSearch ツイート検索用のパラメーター
   * @returns {Promise<array|Error>} searchResult 検索結果のオブジェクト | error エラーオブジェクト
   */
  searchTweets: (paramsSearch) => {
    // ツイッターAPIに同期的にアクセスするためPromiseインスタンスを作成します。
    return new Promise((resolve, reject) => {
      // ツイートを検索し結果を返します。
      client.get('search/tweets', paramsSearch, (error, searchResult, response) => {
        if (!error) {
          resolve(searchResult);
        } else {
          reject(error);
        }
      });
    });
  },
};
