'use strict';
//
// モジュール名: エラー関連コントローラー
// 説明:エラー関連のプログラムを列記します。
//

// ステータスコードのライブラリーを読み込みます。
const httpStatus = require('http-status-codes');

module.exports = {
  /**
   * FileNotFound(アクセス先のページが無い)のエラー処理を定義します。
   * @module respondNotResorceFound
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   */
  respondNotResorceFound: (req, res) => {
    let errorCode = httpStatus.NOT_FOUND;
    res.status(errorCode);
    // テンプレートのレンダーを使わないで処理します。
    res.sendFile(`public/html/${errorCode}.html`, {
      root: './',
    });
  },

  /**
   * INTERNAL_SERVER_ERROR(サーバ内のエラー)が起きた場合のエラー処理を定義します。
   * @module respondInternalError
   * @param {Object} error エラーオブジェクト
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  respondInternalError: (error, req, res, next) => {
    let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
    console.log('Error occured: ${error.stack}');
    res.status(errorCode);
    res.sendFile(`public/html/${errorCode}.html`, {
      root: './',
    });
  },
};
