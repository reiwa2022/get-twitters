//
// スクリプト名: カルーセル高さリセットスクリプト(JavaScript)
// 説明: カルーセルの高さをスマホ/PCの切り替え時にリセットします。
//

// メディアクエリ文字列でMediaQueryListオブジェクトを取得します。
const mql = window.matchMedia('(min-width:768px)');
// カルーセルのインナー要素ノードを取得します。
const inner = document.getElementsByClassName('carousel-inner').item(0);
// カルーセルのインナー要素ノードが存在した場合、メディアクエリでの変化イベントを待機します。
if (inner) {
  mql.addEventListener('change', (e) => {
    // 画面幅がメディアクエリより大きくなった場合、カルーセルインナー要素の高さをリセットします。
    if (e.matches) {
      if (inner.style.height) {
        inner.style.height = null;
      }
      // 画面幅がメディアクエリより小さくなった場合、カルーセルインナー要素の高さをリセットします。
    } else {
      if (inner.style.height) {
        inner.style.height = null;
      }
    }
  });
}
