//
// スクリプト名: ツイートのURL文字列をリンクにするスクリプト(JavaScript)
// 説明：ツイート情報表示画面で使います。

document.addEventListener('DOMContentLoaded', () => {
  // 全ツイートを取得します。
  let tweetContents = document.querySelectorAll('.cus-tweet-content');
  // 全てのツイートについてループ処理を行います。
  for (let i = 0, len = tweetContents.length; i < len; i++) {
    // ツイートのテキストコンテンツを取得します。
    let tweetContent = tweetContents[i].textContent;
    // URL文字列にリンクを貼ったツイートでツイートコンテンツを置きます。
    tweetContents[i].innerHTML = tweetContent.replace(
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi,
      "<a href='$1' target='_blank'>$1</a>"
    );
  }
});
