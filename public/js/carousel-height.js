//
// スクリプト名: カルーセル高さ設定スクリプト(JavaScript)
// 説明: カルーセルの高さを各スライドで同じになるように設定します。
//

// カルーセルの要素ノードを取得します。
const carou = document.getElementById('carousel-controls');
// カルーセルが存在する場合、ページ遷移イベントを待機します。
if (carou) {
  carou.addEventListener('slide.bs.carousel', function (e) {
    // カルーセルでアクティブになっているページのカラム(削除されていないカラム)を取得します。
    const columns = e.target.querySelectorAll(':scope > div > div.active > div > div:not([style="display: none;"])');
    // const columns = e.target.firstElementChild.firstElementChild.firstElementChild.children;
    // アクティブになっているカラム数を計算します。
    const col_num = columns.length;
    // カルーセル1ページに表示するカラム数が6の場合、次のページでも高さを維持します。
    if (col_num === 6) {
      // 現在のカルーセルの高さを取得します。(高さはboader含まず、padding含む)
      const high = e.target.clientHeight;
      // スライド後のカルーセルの要素を取得します。
      const next = e.relatedTarget;
      // スライド後のカルーセルのinnerを取得します。
      const inner = next.parentElement;
      // スライド後のカルーセルインナーの高さを前ページのカルーセルの高さに設定します。
      inner.style.height = high + 'px';
      // カルーセル1ページあたりのカラム数が6未満の場合、次ページの高さをリセットします。(カラム数に合わせます)
    } else {
      if (inner.style.height) {
        inner.style.height = null;
      }
    }
  });
}
