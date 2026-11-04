# DMU P4 Kefka Says

[繁體中文](#繁體中文) · [日本語](#日本語) · [English](#english)

## 繁體中文

FFXIV 絕妖星亂舞 P4 大十字的非官方記憶工具。手動輸入減益與技能真假，即時顯示依時間排序的行動提示及安區，支援中日英、深淺色模式與電腦／手機。

首次造訪依瀏覽器偏好選擇中／日／英，沒有符合的語言則使用英文；之後優先沿用已記住的語言。

### 網頁

[開啟 DMU P4 Kefka Says](https://aphelarion.github.io/dmu-p4-helper/)

### 操作方式

工具列可切換簡易／詳細模式。簡易模式顯示整體分散，只選「加速度」並提示動／不動，不判定加速度時機，也不提示去場中；以下第2、3點為詳細模式的操作。

1. 輸入兩次 GC 的真假，水／雷長短選一次即可，另一輪會自動相反。
2. 水／雷可不填：兩輪都不填看整體分散；任一輪有填，兩輪都看個人行動。
3. 選擇自己的視線或加速度。GC1 視線與短加速度、GC2 視線與長加速度會一起選取／取消；衝突的減益會自動取消。
4. 輸入兩次卡奧斯的真假，水／火只需選第1次，第2次會自動選另一種。
5. 分別記錄魔法儲存與魔法放出的雷、冰真假。同元素兩次相同為真、不同為假；四項填完後顯示安區。
6. 再點已選按鈕可取消；「重置」清空輸入，「⇄」切換行動欄左右。工具列可切換語言、深淺色，或開啟「?」說明。「設定」可調整行動提示字體大小（80%～150%），並記住選擇。

### 本地啟動

安裝 [Node.js](https://nodejs.org/)，在專案資料夾執行：

```sh
node server.mjs
```

開啟 <http://127.0.0.1:4173/>，不需安裝其他套件。判定測試可執行 `node tests.mjs`。

### 圖示來源

- 減益圖示為透過 [XIVAPI](https://xivapi.com/) 取得的 FFXIV 原始素材，來源網址與圖示編號見 [sources.json](dist/assets/sources.json)。遊戲素材版權屬 SQUARE ENIX。
- 真／假圖示與瀏覽器分頁圖示為本專案重新繪製的 SVG。

## 日本語

FFXIV「絶妖星乱舞」P4 グランドクロスの非公式メモツールです。デバフと技の真偽を手動で入力すると、時系列の行動と安置を表示します。中国語・日本語・英語、ライト／ダークモード、PC／スマートフォンに対応しています。

初回はブラウザーの優先言語から中国語・日本語・英語を選び、該当しない場合は英語を使用します。次回以降は保存済みの言語を優先します。

### Webサイト

[DMU P4 Kefka Says を開く](https://aphelarion.github.io/dmu-p4-helper/)

### 使い方

ツールバーで簡易／詳細モードを切り替えます。簡易モードは全体の散開を表示し、加速度は早／遅を選ばず動く／止まるだけを表示します。加速度の時点や「中央へ」は表示しません。以下の2・3は詳細モードの操作です。

1. 各GCの真偽を入力します。水／雷の早・遅は一度だけ選択し、もう一方は自動で逆になります。
2. 水／雷は任意です。両方未選択なら全体の散開、どちらかを選ぶと両GCとも自分の行動を表示します。
3. 自分の視線または加速度を選びます。GC1の視線は早加速、GC2の視線は遅加速と連動し、選択も解除もセットです。両立しないデバフは自動解除されます。
4. 各カオスの真偽を入力します。ほのお／つなみは1回目だけ選択し、2回目は自動で反対の属性になります。
5. マジックチャージとマジックアウトの雷・氷の真偽を記録します。同じ属性で真偽が一致すると本当、不一致なら嘘です。4項目を入力すると安置を表示します。
6. 選択中のボタンをもう一度押すと解除。「リセット」で入力を消し、「⇄」で行動欄の左右を変更できます。ツールバーで言語・テーマを変更したり、「?」で使い方を確認できます。「設定」で行動指示の文字サイズを80%～150%に変更・保存できます。

### ローカル起動

[Node.js](https://nodejs.org/) をインストールし、プロジェクトフォルダーで実行します。

```sh
node server.mjs
```

<http://127.0.0.1:4173/> を開きます。追加パッケージは不要です。判定テストは `node tests.mjs` で実行できます。

### アイコンの出典

- デバフアイコンは [XIVAPI](https://xivapi.com/) 経由のFFXIVゲーム素材です。取得元URLとアイコンIDは [sources.json](dist/assets/sources.json) に記載しています。ゲーム素材の著作権はSQUARE ENIXに帰属します。
- 本当／嘘アイコンとファビコンは、本プロジェクトで描き直したSVGです。

## English

An unofficial memory helper for FFXIV DMU P4 Grand Cross. Enter debuffs and Real/Fake casts manually to see actions in chronological order and the final safe spot. Supports Chinese, Japanese, English, light/dark themes, desktop and mobile.

On your first visit, the browser's language preferences select Chinese, Japanese or English, with English as the fallback. A saved language takes priority on later visits.

### Website

[Open DMU P4 Kefka Says](https://aphelarion.github.io/dmu-p4-helper/)

### How to use

Switch between Simple and Detailed in the toolbar. Simple shows party spread calls and one Accel choice per GC, with Stop/Move shown without a timing or Go to middle reminder. Steps 2–3 below apply to Detailed mode.

1. Enter Real/Fake for each GC. Set Water/Thunder timing once; the other GC automatically gets the opposite timing.
2. Water/Thunder is optional. Leave both blank for party spread calls; select either for personal actions in both GCs.
3. Select your Gaze or Accel debuff. GC1 Gaze pairs with Short Accel; GC2 Gaze pairs with Long Accel. Each pair is selected and cleared together. Conflicting debuffs clear automatically.
4. Enter Real/Fake for each Chaos. Choose Fire/Water for the first Chaos only; the second element is automatically the opposite.
5. Record Thunder/Ice as Real/Fake for both Mana Charge and Mana Release. Matching values resolve Real; different values resolve Fake. Complete all four inputs to see the safe spot.
6. Tap a selected button again to clear it. Reset clears inputs; ⇄ swaps the action column. Use the toolbar to change language/theme or open ? for help. Settings adjusts action text size from 80% to 150% and remembers your choice.

### Run locally

Install [Node.js](https://nodejs.org/), then run this in the project folder:

```sh
node server.mjs
```

Open <http://127.0.0.1:4173/>. No additional packages are needed. Run `node tests.mjs` to test the mechanic rules.

### Icon sources

- Debuff icons are FFXIV game assets retrieved through [XIVAPI](https://xivapi.com/). Source URLs and icon IDs are listed in [sources.json](dist/assets/sources.json). Game assets belong to SQUARE ENIX.
- The Real/Fake icons and favicon are SVGs redrawn for this project.
