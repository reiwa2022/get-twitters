'use strict';
//
// モジュール名: api関連経路モジュール
// 説明: api関連経路へのアクセスをコントローラに渡します。
//

// エクスプレスのルータオブジェクトを読み込みます。
const router = require('express').Router();
// ツイッターコントローラを読み込みます。
const twittersController = require('../controllers/twittersController');
// ツイート関連情報ボックスの削除ボタンが押されたらデータベースの対象アカウントを削除し、結果を返します。
router.post('/delete', twittersController.deleteElement, twittersController.responseData);
// 経路統括モジュールで使うためrouterオブジェクトをエクスポートします。
module.exports = router;
