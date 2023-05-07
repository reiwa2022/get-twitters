// 'use strict';
//
// モジュール名: ツイート関連コントローラー
// 説明:ツイッター認証、ツイート取得/検索、結果のソートを行い画面にレンダーします。
//

// ツイッター認証関連モジュールを読み込みます。
const twitterAuth = require('./functions/twitterAuth');
// ファイル操作関連モジュールを読み込みます。(ツイッター認証のオプションを作成するため)
const toolsFunc = require('./functions/fileOperation');
// ツイッターアカウントリスト
const FILE_PATH = './data/shopList.csv';
// ツイッターアカウントリスト読み込み時のエンコード
const ENCODING = 'utf-8';
// アカウントに表示するツイート数
const TWEETS_NUM = 2;
// 1ページに表示するツイッターアカウント数
const TWEETER_NUM_PAGE = 6;
// Twitterモデルを読み込みます。
const Twitter = require('../models/twitter');

// ツイート関連操作関数をオブジェクトとしてまとめます。
module.exports = {
  /**
   * トップページ表示時にツイート関連情報を取得しツイート日時でソートします。
   * @module tweetsGet
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  tweetsGet: (req, res, next) => {
    // ファイル操作関連モジュールでアカウントリストを読み込み、ツイート情報取得用のパラメーター配列を作成します。
    toolsFunc.readFileLines(FILE_PATH, ENCODING).then((arrayParamsUserTl) => {
      // パラメーター配列の要素(個々のオブジェクト)でツイート情報取得関数を実行します。
      Promise.all(
        arrayParamsUserTl.map((paramsUserTl) => {
          // ツイート情報取得関数がすべて成功したら結果をまとめて配列で返します。
          return twitterAuth.getTL(paramsUserTl);
        })
      ).then((arrayTweetsUserTl) => {
        // 取得したツイート情報配列をツイート日時でソートします。
        const sortArrayTweetsUserTl = arrayTweetsUserTl.sort((a, b) => {
          //時刻を比較できるようにタイムスタンプ値に変換します。
          if (new Date(Date.parse(a.data[0].created_at)) < new Date(Date.parse(b.data[0].created_at))) return 1;
          if (new Date(Date.parse(a.data[0].created_at)) > new Date(Date.parse(b.data[0].created_at))) return -1;
          return 0;
        });
        // EJSで使用するためres.localsにソートしたツイート情報配列を格納します。
        res.locals.arrayTweetsUserTl = sortArrayTweetsUserTl;
        // res.localsに１ページに表示するアカウント数を格納します。
        res.locals.tweeterAccountNum = TWEETER_NUM_PAGE;
        next();
      });
    });
  },

  /**
   * 検索ワードがポストされたらツイートを検索しツイート日時でソートします。
   * @module tweetsSearch
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  tweetsSearch: (req, res, next) => {
    // アカウントリストからツイート検索用のパラメーター配列を作成します。
    toolsFunc
      .readSearchFileLines(FILE_PATH, ENCODING, TWEETS_NUM, req.body.searchWord)
      .then((arrayParamsTweetsSearch) => {
        // 検索用パラメーター配列の要素(個々のパラーメータオブジェクト)でツイートを検索します。
        return Promise.all(
          arrayParamsTweetsSearch.map((paramsSearch) => {
            // ツイート検索関数がすべて成功したら結果をまとめて配列で返します。
            return twitterAuth.searchTweets(paramsSearch);
          })
        );
      })
      .then((arraySearchResults) => {
        // ツイート検索結果の配列に検索ワードがヒットしなかったアカウントについて
        // ツイートステータスに空文字を持って含まれているため除外します。
        let arraySearchFilter = arraySearchResults.filter((searchResultsParam) => {
          return searchResultsParam.statuses.length;
        });
        if (!arraySearchFilter.length) {
          return Promise.reject(new Error('検索結果がありません'));
        }
        // ツイート検索結果の配列をツイート日時でソートします。
        const sortArraySearchResults = arraySearchFilter.sort((a, b) => {
          if (new Date(Date.parse(a.statuses[0].created_at)) < new Date(Date.parse(b.statuses[0].created_at))) return 1;
          if (new Date(Date.parse(a.statuses[0].created_at)) > new Date(Date.parse(b.statuses[0].created_at)))
            return -1;
          return 0;
          // }
        });
        // EJSで使用するためres.localsにソートしたツイート検索結果の配列を格納します。
        res.locals.arraySearchResults = sortArraySearchResults;
        // res.localsに１ページに表示するアカウント数を格納します。
        res.locals.tweeterAccountNum = TWEETER_NUM_PAGE;
        // res.localsに画面のハイライト用に検索ワードを格納します。
        res.locals.searchWord = req.body.searchWord;
        next();
      })
      // 検索エラーを処理をします。
      .catch((error) => {
        // フラッシュメッセージにエラーメッセージを格納します。
        req.flash('errorMessage', error.toString());
        // エラーページのリダイレクトを設定します。
        res.locals.redirect = '/twitter/error';
        next();
      });
  },

  /**
   * TwitterApiから取得したツイッター関連情報をTwitterモデルに格納します(セッション対応)
   * @module saveDbTweetsBySession
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  saveDbTweetsBySession: (req, res, next) => {
    // セッションが空の場合、ツイッターAPIにアクセスしツイート情報をデータベースに保存します。
    if (req.session.access === undefined) {
      // セッション変数に値を代入します。
      req.session.access = true;
      // ファイル操作関連モジュールでアカウントリストを読み込み、ツイート情報取得用のパラメーター配列を作成します。
      toolsFunc.readFileLines(FILE_PATH, ENCODING).then((arrayParamsUserTl) => {
        // パラメーター配列の要素(個々のオブジェクト)でツイート情報取得関数を実行します。
        Promise.all(
          arrayParamsUserTl.map((paramsUserTl) => {
            // ツイート情報取得関数がすべて成功したら結果をまとめて配列で返します。
            return twitterAuth.getTL(paramsUserTl);
            // 取得したツイート情報配列をツイート日時でソートします。
          })
        ).then((arrayTweetsUserTl) => {
          const sortArrayTweetsUserTl = arrayTweetsUserTl.sort((a, b) => {
            //時刻を比較できるようにタイムスタンプ値に変換します。
            if (new Date(Date.parse(a.data[0].created_at)) < new Date(Date.parse(b.data[0].created_at))) return 1;
            if (new Date(Date.parse(a.data[0].created_at)) > new Date(Date.parse(b.data[0].created_at))) return -1;
            return 0;
          });
          // Twitterモデルに入っているドキュメントをすべて削除します。
          Twitter.deleteMany()
            .exec()
            .then(() => {
              console.log('Twitter data is empty!');
            })
            .then(() => {
              // TwitterモデルのインスタンスをTwitter関連ドキュメントで作成します。
              let newTwitter = new Twitter({
                twitterObject: sortArrayTweetsUserTl,
              });
              // Twitter関連ドキュメントを保存します。
              newTwitter.save().then((results) => {
                next();
              });
            })
            .catch((error) => {
              console.log(error);
              next();
            });
        });
      });
    } else {
      // セッションが空でない場合、データベースからツイート情報を取得します。
      next();
    }
  },

  /**
   * TwitterApiから取得したツイッター関連情報をTwitterモデルに格納します。
   * @module saveDbTweets
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  saveDbTweets: (req, res, next) => {
    // ファイル操作関連モジュールでアカウントリストを読み込み、ツイート情報取得用のパラメーター配列を作成します。
    toolsFunc.readFileLines(FILE_PATH, ENCODING).then((arrayParamsUserTl) => {
      // パラメーター配列の要素(個々のオブジェクト)でツイート情報取得関数を実行します。
      Promise.all(
        arrayParamsUserTl.map((paramsUserTl) => {
          // ツイート情報取得関数がすべて成功したら結果をまとめて配列で返します。
          return twitterAuth.getTL(paramsUserTl);
          // 取得したツイート情報配列をツイート日時でソートします。
        })
      ).then((arrayTweetsUserTl) => {
        const sortArrayTweetsUserTl = arrayTweetsUserTl.sort((a, b) => {
          //時刻を比較できるようにタイムスタンプ値に変換します。
          if (new Date(Date.parse(a.data[0].created_at)) < new Date(Date.parse(b.data[0].created_at))) return 1;
          if (new Date(Date.parse(a.data[0].created_at)) > new Date(Date.parse(b.data[0].created_at))) return -1;
          return 0;
        });
        // Twitterモデルに入っているドキュメントをすべて削除します。
        Twitter.deleteMany()
          .exec()
          .then(() => {
            console.log('Twitter data is empty!');
          })
          .then(() => {
            // TwitterモデルのインスタンスをTwitter関連ドキュメントで作成します。
            let newTwitter = new Twitter({
              twitterObject: sortArrayTweetsUserTl,
            });
            // Twitter関連ドキュメントを保存します。
            newTwitter.save().then((results) => {
              next();
            });
          })
          .catch((error) => {
            console.log(error);
            next();
          });
      });
    });
  },

  /**
   * ツイッター関連情報モデルからツイート関連情報を取得します。
   * @module getDbTweets
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  getDbTweets: (req, res, next) => {
    // Twitterモデルからフィールド「_id」「__v」を除くツイッター関連情報ドキュメントを取得します。
    Twitter.findOne()
      .select('-_id -__v')
      .exec()
      .then((searchTwitterObject) => {
        // 検索結果のオブジェクトからツイート関連情報配列を取得します。
        let searchArrayTweetsUsers = searchTwitterObject.twitterObject;
        // EJSで使用するためres.localsにツイート関連情報配列を格納します。
        res.locals.arrayTweetsUserTl = searchArrayTweetsUsers;
        // res.localsに１ページに表示するアカウント数を格納します。
        res.locals.tweeterAccountNum = TWEETER_NUM_PAGE;
        next();
      });
  },

  /**
   * ツイッター関連情報モデルからツイート関連情報を取得し検索ワードで検索した後、ツイート日時でソートします。
   * @module searchDbTweets
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  searchDbTweets: (req, res, next) => {
    // Twitterモデルからフィールド「_id」「__v」を除くドキュメントを取得します。
    Twitter.findOne()
      .select('-_id -__v')
      .exec()
      .then((searchTwitterObject) => {
        // 検索結果のオブジェクトからツイート関連情報配列を取得します。
        let searchArrayTweetsUsers = searchTwitterObject.twitterObject;
        // ツイート関連情報配列からアカウント配列をmapで処理します。
        let searchResultUsers = searchArrayTweetsUsers.map((tweetsUser) => {
          // アカウント配列のツイート情報をfilterし検索ワードにヒットしたツイートを返します。
          tweetsUser.data = tweetsUser.data.filter((tweets) => {
            let result = tweets.text.indexOf(req.body.searchWord);
            return result === -1 ? false : true;
          });
          return tweetsUser;
        });
        // ツイート情報のfilterで検索ワードにヒットしなかったアカウントが空配列として格納されているため取り除きます。
        let searchResultUsersTrim = searchResultUsers.filter((searchUser) => {
          return searchUser.data.length ? true : false;
        });

        // filterで空配列を取り除いた結果、ツイート情報がなければエラー処理をします。
        if (!searchResultUsersTrim.length) {
          return Promise.reject(new Error('検索結果がありません'));
        }

        // 検索結果のツイートについて整列したツイート配列から「抜き出した」ため
        // アカウントがツイートの日時順となっていないのでソートを行います。
        // (先頭のツイートがヒットしていないとツイート日時順が正しくない)
        let searchSortTweetsUsers = searchResultUsersTrim.sort((a, b) => {
          if (new Date(Date.parse(a.data[0].created_at)) < new Date(Date.parse(b.data[0].created_at))) return 1;
          if (new Date(Date.parse(a.data[0].created_at)) > new Date(Date.parse(b.data[0].created_at))) return -1;
          return 0;
        });
        // EJSで使用するためres.localsにツイート検索結果の配列を格納します。
        res.locals.arrayTweetsUserTl = searchSortTweetsUsers;
        // res.localsに１ページに表示するアカウント数を格納します。
        res.locals.tweeterAccountNum = TWEETER_NUM_PAGE;
        // res.localsに画面のハイライト用に検索ワードを格納します。
        res.locals.searchWord = req.body.searchWord;
        next();
      })
      .catch((error) => {
        // フラッシュメッセージにエラーメッセージを格納します。
        req.flash('errorMessage', error.toString());
        // エラーページのリダイレクトを設定します。
        res.locals.redirect = '/twitter/error';
        next();
      });
  },

  /**
   * ツイッター関連情報モデルから対象アカウントを削除します。
   * @module deleteElement
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  deleteElement: (req, res, next) => {
    // ツイッター関連情報モデルから対象のアカウントを削除します。
    Twitter.updateOne(
      {},
      {
        $pull: {
          twitterObject: {
            'includes.users.0.username': { $eq: req.body.screen_name },
          },
        },
      }
    )
      .then((results) => {
        // データベースの更新処理が行われた場合
        if (results.modifiedCount) {
          // trueを設定します。
          res.locals.success = true;
          next();
        } else {
          // データベースの更新処理が行われなかった場合、falseを設定します
          console.log(results);
          res.locals.success = false;
          next();
        }
      })
      // データベース更新処理でのエラー処理を行います。
      .catch((error) => {
        console.log(error);
        // フラッシュメッセージにエラーメッセージを格納します。
        req.flash('errorMessage', error.toString());
        // エラーページのリダイレクトを設定します。
        res.locals.redirect = '/twitter/error';
        next();
      });
  },

  /**
   * ツイッター情報アプリのトップページを表示します。
   * @module index
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   */
  index: (req, res) => {
    res.render('twitter/index');
  },

  /**
   * ツイート検索結果の画面を表示します。
   * @module searchIndex
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   */
  searchIndex: (req, res, next) => {
    // 検索結果があれば検索結果の画面を表示します。無ければリダイレクト処理に進みます。
    if (typeof res.locals.arrayTweetsUserTl !== 'undefined') res.render('twitter/search');
    else next();
  },

  /**
   * ツイート検索結果エラー画面を表示します。
   * @module errorIndex
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   */
  errorIndex: (req, res) => {
    // エラー画面を表示します。
    res.render('twitter/error');
  },

  /**
   * 管理者画面を表示します。
   * @module saveIndex
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   */
  saveIndex: (req, res) => {
    res.render('admin/save');
  },

  /**
   * データ登録成功画面を表示します。
   * @module successIndex
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   */
  successIndex: (req, res) => {
    res.render('admin/success');
  },

  /**
   * Ayax通信終了時にデータを返します。
   * @module responseData
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   */
  responseData: (req, res) => {
    res.send(res.locals.success);
  },

  /**
   * リダイレクト先のパスを設定します。
   * @module redirectView
   * @param {Object} req リクエストオブジェクト
   * @param {Object} res レスポンスオブジェクト
   * @param {Function} next next関数
   */
  redirectView: (req, res, next) => {
    // リダイレクト先のパスを変数に格納します。
    let redirectPath = res.locals.redirect;
    // リダイレクト処理を行います。
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
};
