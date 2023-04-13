'use strict';
//
// モジュール名: 管理者関連経路モジュール
// 説明: 管理者関連経路へのアクセスをコントローラに渡します。
//

// エクスプレスのルータオブジェクトを読み込みます。
const router = require('express').Router(),
  // ツイッターコントローラを読み込みます。
  twittersController = require('../controllers/twittersController');
// adminパスにアクセスがあったら管理者ページを表示します。
router.get('/', twittersController.saveIndex);
// ツイッター関連データ登録ボタンが押されたらツイッターコレクションへの登録処理を行います。
router.post('/save', twittersController.saveDbTweets, twittersController.successIndex);
// エラー画面を表示します。
router.get('/error', twittersController.errorIndex);
// 経路統括モジュールで使うためrouterオブジェクトをエクスポートします。
module.exports = router;
