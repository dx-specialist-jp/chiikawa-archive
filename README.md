# CHIIKAWA ARCHIVE




ちいかわ（nagano）の公式X（旧Twitter）情報を整理・検索しやすくする**非公式**ナレッジサイトです。

**本番URL**: https://dx-specialist-jp.github.io/chiikawa-archive/

---

## ⚠️ 免責事項

- 本サイトはファンによる非公式サイトであり、公式・ナガノ先生とは一切関係ありません
- 著作権・商標権その他の権利はすべて権利者に帰属します
- 漫画画像・動画はサイト内に保存・複製せず、公式X（旧Twitter）の埋め込み機能のみを使用します
- 投稿本文のテキストは検索のために保持し、各投稿には出典として元投稿へのリンクを併記します
- 縦長画像等でX公式の埋め込み表示が見切れてしまう場合でも、画像自体を独自に取得・表示することはせず、X上の元投稿ページへのリンクを設置するのみに留めています
- 権利者様からのご連絡があった場合は迅速に対応し、必要に応じて該当コンテンツを削除・修正します

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16 + TypeScript |
| スタイリング | Tailwind CSS v3 |
| フォント | Noto Serif JP (Google Fonts) |
| ビルド出力 | 静的エクスポート (`output: 'export'`) |
| ホスティング | GitHub Pages |
| CI/CD | GitHub Actions |
| データ取得 | RSSHub (Render) + X syndication API + Google Alerts RSS |

---

## ローカル開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（http://localhost:3000）
npm run dev

# プロダクションビルド（out/ に静的ファイルを生成）
npm run build

# テスト（データ取得スクリプトの単体・結合テスト）
npm test

# スモークテスト（ビルド成果物を実際のブラウザで巡回。npm run build のあとに実行）
npm run test:smoke
```

> **注意**: `npm run build` では `NEXT_PUBLIC_BASE_PATH` を設定しないため、ローカルビルドでは画像パスが `/chiikawa-archive/...` にならない。GitHub Actions での本番ビルドでは自動設定される。

---

## ディレクトリ構成

```
chiikawa-archive/
├── src/
│   ├── app/                     # Next.js App Router ページ
│   │   ├── layout.tsx           # ルートレイアウト（フォント・メタデータ・構造化データ）
│   │   ├── globals.css          # グローバルスタイル・カスタムアニメーション
│   │   ├── not-found.tsx        # 404ページ（GitHub Pages が out/404.html として配信）
│   │   ├── robots.ts            # robots.txt の生成
│   │   ├── sitemap.ts           # sitemap.xml の生成
│   │   ├── page.tsx             # トップページ
│   │   ├── archive/page.tsx     # 投稿アーカイブ（カレンダー＋カテゴリフィルタ）
│   │   ├── news/page.tsx        # ニュース一覧
│   │   ├── search/page.tsx      # 検索（クライアントサイド）
│   │   ├── stats/page.tsx       # 統計ダッシュボード
│   │   ├── gallery/page.tsx     # ファン投稿ギャラリー
│   │   ├── rights/page.tsx      # 権利者様へ
│   │   └── contact/page.tsx     # お問い合わせ
│   ├── lib/                     # 共通ロジック（UIを持たない）
│   │   ├── site.ts              # サイト定数（名称・URL・basePath・assetPath）
│   │   ├── date.ts              # JST基準の日付整形・計算（実行環境のTZに依存しない）
│   │   ├── categories.ts        # カテゴリ別件数の集計
│   │   ├── server-data.ts       # ビルド時に public/data/*.json を読む
│   │   └── client-data.ts       # ブラウザから public/data/*.json を取得する useSiteJson
│   ├── components/              # 共通UIコンポーネント
│   │   ├── Header.tsx           # ナビゲーションヘッダー（スティッキー）
│   │   ├── Footer.tsx           # フッター
│   │   ├── HeroSection.tsx      # トップのヒーローバナー（ストリークバッジ含む）
│   │   ├── StreakBadge.tsx      # 連続観測日数バッジ（localStorage）
│   │   ├── UpdateCalendar.tsx   # 更新カレンダー（右サイドバー用）
│   │   ├── PostCard.tsx         # 投稿カード（トップ・アーカイブ・検索で共通）
│   │   ├── PostViewer.tsx       # 投稿ビューアー（アーカイブページ用・クライアント）
│   │   ├── TwitterEmbed.tsx     # X埋め込みコンポーネント
│   │   ├── CategoryBadge.tsx    # カテゴリバッジ
│   │   ├── NewsViewer.tsx       # ニュース表示（クライアント）
│   │   ├── SearchViewer.tsx     # 検索UI（クライアント）
│   │   ├── GrassBackground.tsx  # 背景画像レイヤー
│   │   ├── BackToTop.tsx        # トップへ戻るボタン
│   │   ├── ui/                  # ページ間で使い回す小さな部品
│   │   │   ├── PageHeader.tsx           # ページ見出し
│   │   │   ├── SectionTitle.tsx         # セクション小見出し（floating で写真の上でも可読）
│   │   │   ├── CategoryFilterBar.tsx    # カテゴリ絞り込み（件数表示・0件は選択不可）
│   │   │   ├── TagList.tsx              # キャラクター名・タグのチップ列
│   │   │   ├── BulletList.tsx           # 丸印つきリスト
│   │   │   ├── InfoCard.tsx             # 見出しつき本文カード
│   │   │   ├── NoteBox.tsx              # 免責・補足の注記ボックス
│   │   │   └── EmptyState.tsx           # 空状態・読み込み中の表示
│   │   └── gallery/              # ギャラリー関連（GalleryGrid/Lightbox/CommentThread/UploadForm/GuidelineNotice）
│   └── types/
│       └── index.ts             # 型定義（Post, SiteData, NewsData, GalleryImage など）
├── public/
│   └── data/
│       ├── posts.json           # X投稿データ（自動更新）
│       ├── news.json            # Google Alerts ニュース（自動更新・直近2000件）
│       ├── news-archive/        # 上限を超えた古いニュース（年別・/news から読み込める）
│       │   └── 2026.json
│       └── gallery.json         # ファン投稿ギャラリーデータ（自動更新）
├── scripts/
│   ├── fetch-posts.mjs          # RSSHub からX投稿を定期取得（update-data.yml から実行）
│   ├── fetch-news.mjs           # Google Alerts RSS からニュースを定期取得
│   ├── fetch-gallery.mjs        # ギャラリー投稿（Tally）を定期取得・自動公開
│   ├── fetch-older.mjs          # 過去投稿の一括取得（一回限り、import-history.yml から実行）
│   ├── add-tweet.mjs            # 単一ツイートの手動追加用
│   ├── reclassify-news.mjs      # 既存ニュースを現在のルールで再判定（ルール変更時に実行）
│   ├── backfill-post-summaries.mjs # 既存投稿に本文を遡って埋める（一回限り）
│   ├── reclassify-posts.mjs     # 既存投稿のカテゴリを現在のルールで再判定
│   └── lib/
│       ├── tagging.mjs          # 投稿のカテゴリ・タグ・キャラクター判定ロジック（共通化）
│       ├── post-text.mjs        # 投稿本文の整形（画像リンク除去・絵文字だけの投稿の除外）
│       ├── news-tagging.mjs     # ニュースのカテゴリ・タグ判定（タイトルのみを見る）
│       ├── news-text.mjs        # ニュース本文の整形（ナビ・著作権表記の除去）
│       ├── news-archive.mjs     # news.json の保持件数管理・年別アーカイブへの退避
│       ├── gallery-store.mjs    # gallery.json の画像URL維持・無変更時の書き込み抑止
│       ├── syndication.mjs      # syndication API から正確な本文・ハッシュタグ・画像URLを取得
│       └── tally.mjs            # Tally APIから回答を取得する共通ヘルパー
├── tests/
│   ├── gallery-store.test.mjs   # ギャラリーの画像URL維持・差分判定の単体テスト
│   ├── fetch-gallery.test.mjs   # fetch-gallery.mjs をTally APIのスタブ相手に実行する結合テスト
│   ├── news-lib.test.mjs        # カテゴリ判定・本文整形・保持件数の単体テスト
│   ├── post-text.test.mjs       # 投稿本文の整形の単体テスト
│   ├── fetch-news.test.mjs      # fetch-news.mjs をローカルのフィード相手に実行する結合テスト
│   └── smoke.mjs                # out/ を配信して全ページ＋404をブラウザで巡回
├── .github/
│   └── workflows/
│       ├── deploy.yml           # テスト → ビルド → スモークテスト → デプロイ
│       ├── retry-deploy.yml     # デプロイ失敗時の自動リトライ・Issue通知
│       ├── update-data.yml      # データ自動更新（4時間ごと。ギャラリー同期含む）
│       └── import-history.yml   # 過去データ一括インポート用
├── next.config.ts               # Next.js 設定（basePath, output: 'export'）
├── tailwind.config.ts           # Tailwind カラーパレット・フォント設定
└── package.json
```

---

## ページ構成

| URL | ページ | 内容 |
|-----|--------|------|
| `/` | トップ | 今日の更新・最近の投稿・最新ニュース・更新カレンダー |
| `/archive` | 投稿アーカイブ | カレンダー選択＋カテゴリフィルタで全投稿を閲覧（投稿は古い順に表示） |
| `/news` | ニュース | Google Alerts で収集したちいかわ関連ニュース（30件ずつ追加読み込み。見終えると年別アーカイブも辿れる） |
| `/search` | 検索 | 本文キーワード・キャラクター名・タグ・カテゴリで投稿を絞り込み（20件ずつ追加読み込み） |
| `/stats` | 統計 | 月別推移・カテゴリ内訳・曜日別・TOP10・キャラ登場回数 |
| `/gallery` | ギャラリー | グッズ・イベント写真のファン投稿ギャラリー（Tally経由・自動公開・アカウント不要） |
| `/rights` | 権利者様へ | 著作権・問い合わせ先の説明 |
| `/contact` | お問い合わせ | GitHub Issues へのリンク |
| （404） | ページ未検出 | 主要ページへの導線付き。`out/404.html` を GitHub Pages が配信 |

---

## データ読み込みの方針

`news.json` は2000件・約1.3MB、`posts.json` も約500KBある。これらを全件HTMLに埋め込むとページが数MBに膨らむため、**初期表示に必要なぶんだけをサーバー側で埋め込み、残りはブラウザから JSON を取得する**方針をとっている。

| ページ | ビルド時にHTMLへ埋め込むもの | ブラウザが取得するもの |
|--------|------------------------------|------------------------|
| `/` | 今日の投稿・直近5件・ニュース6件・カレンダー | （なし） |
| `/archive` | 日別件数（カレンダー描画用）のみ | `posts.json`（日付・カテゴリを選ぶ前に先読み） |
| `/news` | 直近30件＋カテゴリ別件数＋アーカイブの年別件数 | `news.json`（絞り込み or「もっと見る」で初めて取得）、`news-archive/<年>.json`（過去記事のボタンを押したときだけ） |
| `/search` | （なし） | `posts.json` |
| `/gallery` | （なし） | `gallery.json` |

`posts.json` は `/archive` と `/search` で同じURLを取得するためブラウザキャッシュが共有される。
取得は `src/lib/client-data.ts` の `useSiteJson()` に集約されており、読み込み中・失敗の状態も返す。

この方針により `/news` のHTMLは 6.3MB → 88KB、`/archive` は 442KB → 76KB になっている。

---

## 実装上の約束ごと

- **日付は必ず `src/lib/date.ts` を経由する。** 扱う日付はすべてJST基準で、ビルドサーバーや閲覧者の端末のタイムゾーンで結果が変わってはいけない。`new Date("2026-09-05T00:00:00")` のような実行環境依存のパースは書かない。
- **カテゴリの一覧は `ALL_CATEGORIES`（`src/types/index.ts`）から導出する。** ラベルと順序の二重管理を避けるため、`CATEGORY_LABELS` のキー順をそのまま使う。
- **背景写真の上に置くテキストには下地を敷く。** 固定背景の草原写真はビューポート下部で常に見えているため、カード外のテキストは `.on-photo` か `<SectionTitle floating>` を使わないと読めなくなる。

---

## コンポーネント詳細

### StreakBadge.tsx（連続観測バッジ）

`localStorage` で訪問日を記録し、連続観測日数を表示するクライアントコンポーネント。

- 初回訪問・1日目は非表示。2日目以降から表示
- 前日に訪問していない場合はリセット（ストリーク継続失敗）
- 30日以上で特別メッセージ
- キー: `chiikawa_obs_visit`（`{date: "YYYY-MM-DD", count: N}`、日付は JST 基準）

### TwitterEmbed.tsx（X埋め込み）

`platform.twitter.com/widgets.js` を読み込んで公式Xの埋め込みツイートを描画する。同時に複数マウントされても `<script>` タグが重複挿入されないよう、読み込み Promise をモジュールスコープで共有している。

X公式の埋め込みウィジェットは、縦長画像を持つ投稿で画像の上下がクロップされて表示されることがある（X側のiframe内レンダリングによるもので、当サイト側のCSSでは制御できない）。この挙動を理由に画像を自前で取得・表示することはせず、`hasSinglePhoto`（画像1枚のみの投稿かどうか）が true の場合に「画像が見切れている場合はXで元画像を見る」という外部リンク（`{tweetUrl}/photo/1`、Xの写真ビューアへの単純なハイパーリンク）を埋め込みの上に表示するのみに留めている。画像そのものの取得・保存・再描画は行わない。

---

## データ構造

### posts.json

```jsonc
{
  "lastUpdated": "2026-06-28T12:00:00Z",
  "totalPosts": 150,
  "posts": [
    {
      "id": "abc123",
      "tweetId": "1234567890",
      "url": "https://x.com/ngnchiikawa/status/1234567890",
      "publishedAt": "2026-06-28T09:00:00Z",
      "category": "manga",        // manga | goods | anime | collab | event | other
      "characters": ["ちいかわ", "ハチワレ"],
      "tags": ["更新"],
      "summary": "ちいかわが...",  // 投稿本文。画像の t.co リンクを除いたもの。
                                   // 絵文字と画像だけの投稿（漫画1コマなど）では省略される
      "photoUrl": null            // 画像1枚のみの投稿は元画像URL（表示には使わず、埋め込みが見切れた際の
                                   // 「Xで元画像を見る」リンク表示要否の判定にのみ使用）。それ以外は null
    }
  ],
  "calendarData": [
    { "date": "2026-06-28", "count": 2, "categories": ["manga"] }
  ]
}
```

### news.json

```jsonc
{
  "lastUpdated": "2026-06-28T12:00:00Z",
  "totalArticles": 50,
  "articles": [
    {
      "id": "md5hash12char",   // URL の MD5 先頭12文字
      "title": "記事タイトル",
      "url": "https://...",
      "publishedAt": "2026-06-28T09:00:00Z",
      "source": "メディア名",
      "category": "goods",    // collab | event | manga | anime | goods | other
      "tags": ["ぬいぐるみ"]
    }
  ]
}
```

ニュースは1日およそ40件増えるため、上限を設けないと `news.json` は年に10MB前後まで育つ。`/news` はこのファイルをブラウザから丸ごと取得するので、閲覧者の通信量に直接効いてくる。そのため **新しい順に2000件（約1.3MB）だけを `news.json` に残し、あふれたぶんは `public/data/news-archive/<年>.json` へ退避する**。上限は `NEWS_MAX_ARTICLES` で変更できる。

退避した記事も読めなくなるわけではない。`/news` は掲載ぶんを見終えると「◯◯年の記事を読み込む」を出し、押された年のファイルだけを取得して一覧に足す。年ごとの件数はビルド時に数えて埋め込んであるため、ボタンを押すまで通信は発生しない。

### gallery.json

```jsonc
{
  "lastUpdated": "2026-08-11T00:00:00.000Z",
  "totalImages": 12,
  "images": [
    {
      "id": "gallery-abc123",
      "imageUrl": "https://...",             // Tallyがホストするアップロード画像のURL
      "caption": "推しぬいと一緒に",
      "category": "goods",                   // goods | event | other
      "createdAt": "2026-08-10T09:00:00.000Z",
      "commentFormUrl": "https://tally.so/r/<commentFormId>?image_id=gallery-abc123",
      "comments": [
        { "id": "comment-xyz789", "body": "かわいい！", "createdAt": "2026-08-10T10:00:00.000Z" }
      ]
    }
  ]
}
```

#### ギャラリー投稿の仕組み（[Tally](https://tally.so) 経由・投稿者アカウント不要）

ユーザーはグッズ・イベント写真を Tally の「写真投稿フォーム」から投稿する（アカウント登録・ログイン不要）。コメントは「コメント投稿フォーム」から送信する。対象画像のIDは `image_id` という隠しフィールドにURLパラメータ（`?image_id=...`）でプリフィルされる。

Tallyフォームのフィールド仕様（変更する場合は `scripts/fetch-gallery.mjs` のタイトルマッチングも要修正）:

| フォーム | フィールド | タイプ | 必須 |
|---|---|---|---|
| 写真投稿フォーム | `写真` | File Upload | Yes |
| 写真投稿フォーム | `カテゴリ`（グッズ/イベント/その他） | Dropdown | Yes |
| 写真投稿フォーム | `コメント（任意・140字まで）` | Short text | No |
| 写真投稿フォーム | 同意事項3件 | Checkbox（個別） | Yes |
| コメント投稿フォーム | `image_id` | Hidden field | — |
| コメント投稿フォーム | `コメント` | Long text | Yes |

> Tally の File Upload は取得のたびに新しい `accessToken` 付きの URL を返す。そのまま保存すると投稿が1件も増えていなくても `gallery.json` が毎回変わり、4時間ごとに実体のないコミットとデプロイが走る（実際 `gallery.json` を変更した128コミットのうち123件がトークンだけの差分だった）。トークンに有効期限は無く22日前のものでも画像を取得できることを確認したため、すでに保存してある URL をそのまま使い続ける（`scripts/lib/gallery-store.mjs`）。
>
> ファイル自体が差し替わった場合は URL の（トークンを除いた）本体部分が変わるので、そのときは新しい URL を採用する。

> 投稿ボタンのリンク先（`submissionFormUrl`）も `TALLY_IMAGE_FORM_ID` から生成して `gallery.json` に書き出す。サイト側にフォームIDを持たせると、フォームを差し替えて変数だけ更新したときに投稿ボタンが旧フォームを指したままになり、集まった投稿が同期されず失われる。

投稿は事前承認なしで自動的に公開される。`update-data.yml`（4時間ごと、または手動実行）が `scripts/fetch-gallery.mjs` を実行し、Tallyの完了済み回答をすべて `gallery.json` に反映する（画像ファイルの `mimeType` が `image/*` でないものは自動的に除外する）。

不適切な投稿を見つけた場合は、管理者がTallyのダッシュボードで該当の回答を削除すれば、次回の同期時にギャラリーからも自動的に消える。公開・削除ともに同期のタイムラグ（最大4時間、手動実行で短縮可）がある点に留意する。

---

## デザインシステム

### カラーパレット（tailwind.config.ts）

| 名前 | 用途 |
|------|------|
| `cream-*` | 背景・カード |
| `mint-*` | プライマリアクション・ハイライト |
| `lavender-*` | セカンダリ要素・統計数値 |
| `honey-*` | バッジ・強調 |
| `peach-*` | 補助カラー |
| `warm-text/muted/border/bg` | テキスト・ボーダー |

### フォント

**Noto Serif JP** (Google Fonts) — `layout.tsx` の `<head>` 内で `<link>` タグを直接読み込んで使用（`next/font/google` は japanese サブセットを提供していないため意図的にこの方式を採用）。

フォールバック: Hiragino Mincho ProN → serif

### ユーティリティクラス（globals.css）

```css
.card                    /* 白背景 + 角丸 + 影 */
.card-hover              /* card + ホバー時に浮き上がる */
.section-title           /* セクション見出し（カード内で使う） */
.section-title-floating  /* セクション見出し（カード外＝背景写真の上で使う） */
.on-photo                /* 背景写真の上に置くテキストの下地（淡いクリーム + ぼかし） */
.btn-primary             /* ゴールドのボタン */
.btn-secondary           /* 白地のセカンダリボタン */
.skip-link               /* キーボード操作時のみ現れる「本文へスキップ」 */
```

### アクセシビリティ

- 本文冒頭にスキップリンク（Tab キー1回で到達）
- 現在地のナビゲーションに `aria-current="page"`、絞り込みボタンに `aria-pressed`
- ギャラリーのライトボックスは `role="dialog"` + フォーカストラップ + 背面スクロール固定、Esc で閉じる
- `prefers-reduced-motion: reduce` でアニメーションを無効化
- フォーカスリングは `:focus-visible`（キーボード操作時のみ）で表示

---

## GitHub Actions ワークフロー

### deploy.yml（デプロイ）

**トリガー**: `main` ブランチへの push、または `Update Data` ワークフロー完了時

`npm test` → ビルド → `npm run test:smoke` → デプロイの順に実行する。スモークテストは本番と同じ `basePath` 付きの成果物を配信して巡回するため、Chromium を都度インストールする（`~/.cache/ms-playwright` をキャッシュ）。

1. `npm ci` → `npm run build`（`NEXT_PUBLIC_BASE_PATH=/chiikawa-archive` を設定）
2. `out/` を GitHub Pages にデプロイ

> `Update Data` がボットpushでコミットした場合、`GITHUB_TOKEN` による push は他ワークフローの `push` イベントを発火させない（GitHub Actionsの無限ループ防止の仕様）ため、`workflow_run` トリガーが必須。`push` トリガーだけにすると自動デプロイが連鎖しなくなるので注意。

### retry-deploy.yml（デプロイ失敗時の自動リトライ）

**トリガー**: `Deploy to GitHub Pages` ワークフロー完了時（`conclusion == 'failure'` の場合のみ動作）

`actions/deploy-pages@v4` は GitHub Pages 側の一時的な障害（`Deployment failed, try again later.`）で不定期に失敗することがあるため、失敗を検知したら失敗ジョブのみ自動で再実行する（最大3回）。3回連続で失敗した場合は GitHub Issue を自動作成・更新して通知する。

### update-data.yml（データ自動更新）

**トリガー**: cron（JST 1:00 / 5:00 / 9:00 / 13:00 / 17:00 / 21:00、4時間ごと）または手動実行

1. `scripts/fetch-posts.mjs` — RSSHub 経由でX投稿を取得（タイムアウト 90 秒）
2. `scripts/fetch-news.mjs` — Google Alerts RSS からニュースを取得
3. 両方失敗した場合はワークフローをエラー終了。片方でも失敗した場合は GitHub Issue を自動作成/コメント、復旧時は自動クローズ
4. `public/data/` に変更があればコミット・プッシュ
5. 変更があれば `deploy.yml` が連鎖実行される

### import-history.yml（過去データ取得）

`scripts/fetch-older.mjs` を実行し、`@ngnchiikawa` の過去ツイートを全件取得する一回限りの手動実行ワークフロー（`workflow_dispatch`）。`TWITTER_AUTH_TOKEN` / `TWITTER_CSRF_TOKEN` の Secrets が必要。

---

## 環境変数・シークレット設定

GitHub リポジトリの `Settings → Secrets and variables → Actions` で設定。

### Variables（公開可能）

| 名前 | 内容 |
|------|------|
| `RSSHUB_URL` | RSSHub サーバー URL（例: `https://chiikawa-rsshub.onrender.com`）|
| `GOOGLE_ALERTS_RSS_URL` | Google Alerts の RSS フィード URL |

### Secrets（秘匿）

| 名前 | 内容 |
|------|------|
| `RSSHUB_ACCESS_KEY` | RSSHub アクセスキー |
| `TWITTER_AUTH_TOKEN` | X.com の `auth_token` クッキー値（`import-history.yml` 用） |
| `TWITTER_CSRF_TOKEN` | X.com の `ct0` クッキー値（`import-history.yml` 用） |

---

## RSSHub（Render）設定

X投稿の取得には自前の RSSHub インスタンスを使用。

| 項目 | 値 |
|------|-----|
| ホスティング | Render（無料プラン） |
| Image | `ghcr.io/diygod/rsshub` |
| URL | `https://chiikawa-rsshub.onrender.com` |

**Render 環境変数**:

| 名前 | 内容 |
|------|------|
| `TWITTER_AUTH_TOKEN` | X.com の `auth_token` クッキー値 |
| `ACCESS_KEY` | `RSSHUB_ACCESS_KEY` と同じ値 |

> **注意**: Render 無料プランはスリープあり。コールドスタート最大 60 秒のため、`fetch-posts.mjs` のタイムアウトは 90 秒に設定している。  
> `auth_token` は X のログインセッションが変わると無効になるため、定期的な更新が必要。

---

## 投稿本文の保持（scripts/lib/post-text.mjs）

`/search` のキーワード検索に使うため、投稿本文を `summary` として保持する。取得は `syndication.mjs` 経由で、カテゴリ判定に使っているものと同じテキスト。

- 画像への `t.co` リンクは落とす（埋め込みが同じ画像を表示するため）
- 絵文字と画像リンクしか無い投稿（漫画1コマの投稿がこれにあたり、全体の3割）は本文を持たせない
- 300文字で打ち切る

投稿カードには本文を表示しない。X の埋め込みが同じ本文を表示するため、並べると同じ文章が2回出る。

2026年6月に本文の取得元を失った経緯から `summary` は省略可能なままで、既存投稿には入っていなかった。`scripts/backfill-post-summaries.mjs` で遡って埋めている（一回限り。新着は `fetch-posts.mjs` が本文ごと保存する）。

```bash
node scripts/backfill-post-summaries.mjs           # 先頭20件だけ試す（dry-run）
node scripts/backfill-post-summaries.mjs --write   # 全件に適用
```

---

## 投稿カテゴリ・タグ判定（scripts/lib/tagging.mjs）

公式Xポストのカテゴリ・タグ・キャラクター判定ロジック。`fetch-posts.mjs` / `fetch-older.mjs` / `add-tweet.mjs` で共通利用する。

カテゴリ判定は優先度順（先勝ち）:

1. **collab** — コラボ, タイアップ, ユニクロ, マクドナルド など
2. **event** — イベント, ポップアップ, ちいかわらんど など
3. **manga**（単行本・掲載誌） — 単行本, コミックス, モーニング, 「◯巻」
4. **goods** — グッズ, 発売, 一番くじ, ぬいぐるみ, フィギュア など（「映画ちいかわ」等がグッズ告知の枕詞になるケースが多いため anime より先に判定）
5. **anime** — 放送, 配信, アニメちいかわ, 劇場版 など
6. **manga** — 漫画, まんが, コミック, 描き下ろし など
7. **other** — 上記に当てはまらないもの

> 単行本・掲載誌の告知は「発売」を含むため、goods より先に判定しないとすべてグッズに倒れる（実データでは10件中9件がそうなっていた）。一方「描き下ろし」は「特別描き下ろしデザイン」としてグッズ告知にも使われるため、先行させる側には入れていない。
>
> ルールを変えたら `node scripts/reclassify-posts.mjs`（`--write` で反映）で既存投稿も揃える。判定し直すのは本文を持つ投稿だけで、本文が無い投稿（絵文字と画像だけ＝漫画1コマ）は取得時の判定を維持する。

本文が実質空（絵文字・URL・空白のみ）でメディアが添付されている投稿は、公式アカウントが日々投稿する漫画1コマ切り抜きとみなし `manga` と判定する。「#ちいかわ」のような汎用語句だけでは特定カテゴリに誤判定しないよう、判定キーワードから除外している。

本文・ハッシュタグは RSS の省略（「…」による途中切れ）を避けるため `scripts/lib/syndication.mjs`（`cdn.syndication.twimg.com`、認証不要）経由で取得する。

キャラクタータグ: ちいかわ, ハチワレ, うさぎ, くりまんじゅう, モモンガ, シーサー, もんじゃ, セイレーン, 古本屋, 島二郎

---

## ニュースカテゴリ判定（scripts/lib/news-tagging.mjs）

Google アラートのフィードは概要文だけに「ちいかわ」を含む無関係な記事も混ざるため、**タイトルに「ちいかわ」を含む記事のみ**を取得対象とする。

カテゴリ・タグの判定にも**タイトルだけ**を使い、概要文（`summary`）は見ない。Google アラートの本文には元ページのサイドバーやおすすめ記事欄がそのまま混ざるため、本文まで見ると記事と無関係な「イベント」「発売」「HUNTER×HUNTER」といった語を拾ってしまう。実際、以前は全3076件の66%が「コラボ」に倒れ、うち55件は本文中の `×` 記号だけが根拠だった。

カテゴリ判定は優先度順（先勝ち）。具体的な語を先に、一般的な語を後に置く:

1. **anime** — アニメ, 劇場版, 上映, 興収, 入場者特典, 声優 など
2. **manga** — 漫画, コミックス, 単行本, 原画 など
3. **collab** — コラボ, タイアップ, 企業名（ユニクロ, マクドナルド など）、および「ちいかわ×○○」の形
4. **event** — イベント, ポップアップ, 展示, フェア, 開催 など
5. **goods** — グッズ, 新商品, 発売, 限定, ぬいぐるみ, カプセルトイ など
6. **other** — 上記に当てはまらないもの

> `×` は「ちいかわ×○○」「○○×ちいかわ」の形に限定している。単独で拾うと『HUNTER×HUNTER』のような無関係な作品名まで「コラボ」になる。
>
> 「映画」は作品名『映画 ちいかわ』としてグッズ・イベント記事の見出しにも頻出するため、通常のルールには入れていない。どのルールにも当てはまらなかったときだけ「映画 / 劇場版 / 放送 / ナガノ」を弱い手がかりとして anime に倒す（レビュー・興行成績・インタビューなどが該当する）。

キャラクタータグ: ハチワレ, うさぎ, くりまんじゅう, モモンガ, シーサー, もんじゃ, セイレーン, 古本屋
（「ちいかわ」は全記事に付いて情報量がないためタグにしていない）

### 概要文の整形

概要文はカードに表示するため、`scripts/lib/news-text.mjs` で元ページのグローバルナビ・関連記事欄・著作権表記を落としてから保存する。

- 中黒などで区切られた短い断片はメニュー項目とみなして捨て、「ちいかわ」を含むか20文字以上の断片だけを残す
- 「関連記事」「アクセスランキング」「提供元の記事」などページの部品の見出しが出てきたら、そこから後ろを捨てる。ただし手前に20文字以上残らないなら切り詰めない（本文が消えるため）。「ランキング」単体は「週末ランキング1位」のように本文にも出るので目印にしない
- どちらも判断がつかない場合は元の並びをそのまま使うので、概要文が空になることはない

ナビの断片が残る記事は 2000件中 228件 → 34件になった。中黒区切りでない羅列（「新商品 · 産経ネットショップ · 人事」のように長い断片が続くもの）は落とし切れておらず、ここが現状の限界。

### ルールを変えたら再判定する

カテゴリ・タグの判定も概要文の整形も新着記事にしか適用されないため、ルールを変えたままにすると既存記事と新着で基準がズレる。ルールを更新したら必ず全件を作り直す:

```bash
node scripts/reclassify-news.mjs            # 変更内容を表示するだけ（dry-run）
node scripts/reclassify-news.mjs --write    # news.json を書き換える
```

保持件数の上限もこのスクリプトで適用される。

---

## 重複チェックの仕組み

- **X投稿**: `tweetId` ベースで重複排除
- **ニュース**: URL の MD5 ハッシュ（先頭 12 文字）を ID として使用し、URL ベースで重複排除

---

## オタク向け特別機能

### 連続観測バッジ（StreakBadge）

毎日サイトを訪問すると連続観測日数が増える。2日目から HeroSection にバッジが表示される。localStorage に保存するためサーバー不要。

---

## デプロイ設定詳細

### GitHub Pages 初期設定

1. リポジトリの `Settings → Pages → Source` を **GitHub Actions** に設定
2. Actions タブで Deploy workflow が正常動作することを確認

### basePath

`NEXT_PUBLIC_BASE_PATH=/chiikawa-archive` を GitHub Actions の Build ステップで設定。`next.config.ts` が環境変数を読み込んで `basePath` に適用する。

---

## テスト

| コマンド | 内容 |
|----------|------|
| `npm test` | `scripts/` のテスト（ブラウザ不要・数百ms） |
| `npm run test:smoke` | `out/` を配信して全ページ＋404を実際のブラウザで巡回。ニュースの追加読み込みと本文キーワード検索も確認する |

デプロイのワークフローは **テスト → ビルド → スモークテスト → デプロイ** の順で、どこかで落ちれば配信されない。データ自動更新きっかけのデプロイも同じ経路を通るため、取得したデータでページが壊れた場合もここで止まる。

テストで見ているのは「どう扱うと決めたか」であって、キーワードの網羅ではない。ルールを増やしただけで落ちるテストは書かない。

意図的に壊して、次のいずれもテストが検知することを確認してある:

- `fetch-news.mjs` の import を1つ落とす（`node --check` は通過してしまう種類の不具合）
- 「掲載内容が変わらないなら書かない」ガードを外す（4時間ごとに実体のないコミットとデプロイが走る）
- `out/data/news.json` を壊す / `out/404.html` を消す
- ギャラリーの画像URL維持を外す（トークンだけの差分でコミットが走る状態に戻す）

---

## 保守メモ

### よくあるトラブル

| 症状 | 原因と対処 |
|------|-----------|
| X投稿が更新されない | `auth_token` が失効している可能性。Render のダッシュボードで環境変数を更新する。フェッチが失敗すると GitHub Issue が自動作成されるので、まずそれを確認する |
| RSSHub が 504 エラー | Render のコールドスタート。`update-data.yml` の `continue-on-error: true` により次回のスケジュールで自動リトライされる |
| ニュースが取れない | Google Alerts の RSS URL が変わっている可能性。Google Alerts で再設定して `GOOGLE_ALERTS_RSS_URL` を更新 |
| ギャラリーが更新されない | 3本のフェッチはいずれも `continue-on-error` で走るため、失敗しても他は進む。`Update Data` が自動作成する Issue に `fetch-gallery.mjs: failure` が出ていないか確認する |
| デプロイが失敗する | `actions/deploy-pages` の一時的な障害の場合が多い。`retry-deploy.yml` が自動で最大3回リトライする。3回失敗した場合は自動作成される Issue と [GitHub Status](https://www.githubstatus.com/) を確認 |
| ビルドが失敗する | TypeScript エラーは `npm run build` でローカル確認。依存パッケージの更新が必要な場合は `npm install` |

### 投稿の手動追加

```bash
# 単一ツイートの追加（環境変数で指定。CATEGORY / PUBLISHED_DATE は省略可）
TWEET_URL="https://x.com/ngnchiikawa/status/xxxx" CATEGORY="manga" node scripts/add-tweet.mjs

# 過去投稿の一括取得（TWITTER_AUTH_TOKEN / TWITTER_CSRF_TOKEN が必要、カーソルが尽きるまで全件取得）
TWITTER_AUTH_TOKEN="..." TWITTER_CSRF_TOKEN="..." node scripts/fetch-older.mjs
```

### データのリセット

`public/data/posts.json` または `public/data/news.json` を手動編集してコミットすればよい。重複チェックの仕組みにより、次の自動更新でも二重登録されない。

---

## ライセンス

本リポジトリのコード部分は ISC ライセンス。  
ちいかわ / ナガノ先生に関する著作権・商標権はすべて権利者に帰属します。
