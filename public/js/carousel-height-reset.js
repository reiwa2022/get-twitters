//
// スクリプト名: カルーセル高さリセットスクリプト(JavaScript)
// 説明: カルーセルの高さをスマホ/PCの切り替え時にリセットします。
//

const mql = window.matchMedia('(min-width:768px)');
const inner = document.getElementsByClassName('carousel-inner').item(0);

mql.addEventListener('change', (e) => {
  if (e.matches) {
    if (inner.style.height) {
      inner.style.height = null;
    }
  } else {
    if (inner.style.height) {
      inner.style.height = null;
    }
  }
});
