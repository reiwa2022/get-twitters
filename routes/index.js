'use strict';
//
//  モジュール名: 経路統括モジュール
//  説明: 各機能のモジュールに各々の経路を設定します。
//

// エクスプレスのルータオブジェクトを読み込みます。
const router = require('express').Router();
// ツイート関連の経路を設定したツイート関連経路モジュールを読み込みます。
const twitterRoutes = require('./twitterRoutes');
// 管理者関連経路モジュールを読み込みます。
const adminRoutes = require('./adminRoutes');
// api関連経路モジュールを読み込みます。
const apiRoutes = require('./apiRoutes');

// twitter配下へのアクセスにはtwitterRoutesモジュールを使います。
router.use('/twitter', twitterRoutes);
// admin配下へのアクセスにはadminRoutesモジュールを使います。
router.use('/admin', adminRoutes);
// api配下へのアクセスにはapiRoutesモジュールを使います。
router.use('/api', apiRoutes);

// mainファイルで使うためrouterオブジェクトをエクスポートします。
module.exports = router;
