'use strict';
//
//  モジュール名: ツイッター認証関連モジュール
//  説明: ツイッターAPIの認証とツイッター関連情報の取得/検索を行います。
//

// ツイッターAPI Ver2のライブラリーを取得します。
const { TwitterApi } = require('twitter-api-v2');

/**
 * ツイッター認証用のインスタンスを作成します。
 * @returns {Object} ツイッター認証用のインスタンス
 */
// TwitterAPI V2のベアラートークンでコンスタンスを作成します。
const twitterClient = new TwitterApi(process.env.BEARER_TOKEN);

// ツイート取得用のオブジェクトを格納します。
const readOnlyClient = twitterClient.readOnly;

// ツイッター情報取得/検索関数をオブジェクトしてまとめます。
module.exports = {
  /**
   * ツイート情報を取得します。
   * @param {object} paramsUserTl ツイート情報取得用のパラメーター
   * @returns {Promise<object|Error>} tweetsUserTl ツイート情報オブジェクト | error エラーオブジェクト
   */
  getTL: (paramsUserTl) => {
    const params = {
      query: `from:${paramsUserTl}`,
      max_results: 10,
      'tweet.fields': 'created_at',
      expansions: 'author_id',
      'user.fields': 'name,username,url,description,profile_image_url',
    };
    return new Promise((resolve, reject) => {
      readOnlyClient.v2
        .search(params)
        .then((results) => {
          resolve(results._realData);
        })
        .catch((error) => {
          reject(error);
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
