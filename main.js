'use strict';
//
// モジュール名：ツイッター情報表示アプリの起点ファイル
// 各種ライブラリ、ミドルウェアを設定し、Expressサーバを起動します
//

// フレームワークのエクスプレスを読み込みます。
const express = require('express');
// EJSのレイアウトライブラリを読み込みます。
const layouts = require('express-ejs-layouts');
// 経路統括モジュールを読み込みます。
const router = require('./routes/index');
// エクスプレスのセッションライブラリーを読み込みます。
const expressSession = require('express-session');
// フラッシュメッセージのライブラリを読み込みます。
const connectFlash = require('connect-flash');
// エラーコントローラーを読み込みます。
const errorController = require('./controllers/errorController');
// マングースを読み込みます。
const mongoose = require('mongoose');
// マングースでPromiseを使います。
mongoose.Promise = global.Promise;
// 下記ライブラリーは未実装(将来的に実装)
// cookieParser = require("cookie-parser");
// passport = require("passport");

// expressアプリケーションを取得します
const app = express();

// mongoDBのサービスが終了したためAtlasを使用
// AtlasのMongoDBに接続します。
mongoose.connect(process.env.ATLAS_URI || 'mongodb://localhost:27017/twitter_db', {
  useNewUrlParser: true,
});

// データベースをdb変数に代入します。
const db = mongoose.connection;

// db接続時のメッセージをログに出力します。
db.once('open', () => {
  console.log('Successfully connected to MongoDB using Mongoose!');
});

// サーバのポート番号をセットします
app.set('port', process.env.PORT || 3000);

// テンプレートエンジンとしてEJSをセットします
app.set('view engine', 'ejs');

// publicフォルダ内の静的アセットファイルをクライアントに提供します。
app.use(express.static('public'));

// ExpressのEJSでレイアウト機能を使います。
app.use(layouts);

// Postされたデータを解析して受け取ります。
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());

// エクスプレスでセッションを使います。
app.use(
  expressSession({
    secret: 'secret-passcode-tetsu',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1 * 1000 * 60 * 10, //10分
    },
  })
);

//  session用のcookieParserは不要
// app.use(cookieParser("secret-passcode-tetsu"));

// フラッシュメッセージをセッションで使います。
app.use(connectFlash());

// フラッシュメッセージをレスポンスのローカル変数に代入します。
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});

// ルート配下へのアクセスは経路統括モジュールを使います。
app.use('/', router);

// FileNotFoundのエラー処理を行います。(正常系のサイクルでFileNotFoundエラーを処理する)
app.use(errorController.respondNotResorceFound);
// Internal Server Error(サーバ内でのエラー)の処理を行います。(エラーが起きた場合、エラー用のミドルウェアでキャッチする)
app.use(errorController.respondInternalError);

// ExpressサーバをPort番号で起動します。
app.listen(app.get('port'), () => {
  console.log(`Server starting at PORT ${app.get('port')}`);
});
