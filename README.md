# ちいかわ観測所 🔭

ちいかわ（nagano）の公式X（旧Twitter）情報を整理・検索しやすくする**非公式**ナレッジサイトです。

**本番URL**: https://dx-specialist-jp.github.io/chiikawa-archive/

---

## ⚠️ 免責事項

- 本サイトはファンによる非公式サイトであり、公式・ナガノ先生とは一切関係ありません
- 著作権・商標権その他の権利はすべて権利者に帰属します
- 漫画画像・動画はサイト内に保存せず、公式X（旧Twitter）の埋め込み機能のみを使用します
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
| データ取得 | RSSHub (Render) + Google Alerts RSS |

---

## ローカル開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（http://localhost:3000）
npm run dev

# プロダクションビルド（out/ に静的ファイルを生成）
npm run build
```

> **注意**: `npm run build` では `NEXT_PUBLIC_BASE_PATH` を設定しないため、ローカルビルドでは画像パスが `/chiikawa-archive/...` にならない。GitHub Actions での本番ビルドでは自動設定される。

---

## ディレクトリ構成

```
chiikawa-archive/
├── src/
│   ├── app/                     # Next.js App Router ページ
│   │   ├── layout.tsx           # ルートレイアウト（フォント・メタデータ）
│   │   ├── globals.css          # グローバルスタイル・カスタムアニメーション
│   │   ├── page.tsx             # トップページ（観測所）
│   │   ├── archive/page.tsx     # 投稿アーカイブ（カレンダー＋カテゴリフィルタ）
│   │   ├── news/page.tsx        # ニュース一覧
│   │   ├── search/page.tsx      # 全文検索（クライアントサイド）
│   │   ├── stats/page.tsx       # 統計ダッシュボード
│   │   ├── rights/page.tsx      # 権利者様へ
│   │   └── contact/page.tsx     # お問い合わせ
│   ├── components/              # 共通UIコンポーネント
│   │   ├── Header.tsx           # ナビゲーションヘッダー（スティッキー）
│   │   ├── Footer.tsx           # フッター
│   │   ├── HeroSection.tsx      # トップのヒーローバナー（ストリークバッジ含む）
│   │   ├── StreakBadge.tsx      # 連続観測日数バッジ（localStorage）
│   │   ├── UpdateCalendar.tsx   # 更新カレンダー（右サイドバー用）
│   │   ├── PostCard.tsx         # 投稿カード（トップページ用）
│   │   ├── PostViewer.tsx       # 投稿ビューアー（アーカイブページ用・クライアント）
│   │   ├── TwitterEmbed.tsx     # X埋め込みコンポーネント
│   │   ├── CategoryBadge.tsx    # カテゴリバッジ
│   │   ├── NewsViewer.tsx       # ニュース表示（クライアント）
│   │   ├── SearchViewer.tsx     # 検索UI（クライアント）
│   │   ├── GrassBackground.tsx  # 背景画像レイヤー
│   │   └── BackToTop.tsx        # トップへ戻るボタン
│   └── types/
│       └── index.ts             # 型定義（Post, SiteData, NewsData など）
├── public/
│   └── data/
│       ├── posts.json           # X投稿データ（自動更新）
│       ├── news.json            # Google Alerts ニュース（自動更新）
│       └── episodes.json        # 未使用（削除候補）
├── scripts/
│   ├── fetch-posts.mjs          # RSSHub からX投稿を定期取得（update-data.yml から実行）
│   ├── fetch-news.mjs           # Google Alerts RSS からニュースを定期取得
│   ├── fetch-older.mjs          # 過去投稿の一括取得（一回限り、import-history.yml から実行）
│   └── add-tweet.mjs            # 単一ツイートの手動追加用
├── .github/
│   └── workflows/
│       ├── deploy.yml           # GitHub Pages デプロイ（main push / Update Data 完了時）
│       ├── retry-deploy.yml     # デプロイ失敗時の自動リトライ・Issue通知
│       ├── update-data.yml      # データ自動更新（4時間ごと）
│       └── import-history.yml   # 過去データ一括インポート用
├── next.config.ts               # Next.js 設定（basePath, output: 'export'）
├── tailwind.config.ts           # Tailwind カラーパレット・フォント設定
└── package.json
```

---

## ページ構成

| URL | ページ | 内容 |
|-----|--------|------|
| `/` | 観測所トップ | 今日の更新・最近の投稿・最新ニュース・更新カレンダー |
| `/archive` | 投稿アーカイブ | カレンダー選択＋カテゴリフィルタで全投稿を閲覧 |
| `/news` | ニュース | Google Alerts で収集したちいかわ関連ニュース |
| `/search` | 検索 | キャラクター名・タグ・カテゴリで投稿を全文検索 |
| `/stats` | 統計 | 月別推移・カテゴリ内訳・曜日別・TOP10・キャラ登場回数 |
| `/rights` | 権利者様へ | 著作権・問い合わせ先の説明 |
| `/contact` | お問い合わせ | GitHub Issues へのリンク |

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
      "summary": "ちいかわが..."
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
.card           /* 白背景 + 角丸 + 影 */
.card-hover     /* card + ホバー時に浮き上がる */
.section-title  /* セクション見出し（アイコン + テキスト） */
.btn-primary    /* ミントグリーンボタン */
.btn-secondary  /* クリームボタン */
```

---

## GitHub Actions ワークフロー

### deploy.yml（デプロイ）

**トリガー**: `main` ブランチへの push、または `Update Data` ワークフロー完了時

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

## ニュースカテゴリ判定（fetch-news.mjs）

カテゴリ判定は優先度順（先勝ち）:

1. **collab** — ユニクロ, マクドナルド など企業コラボ
2. **event** — ポップアップ, ちいかわらんど など
3. **manga** — 漫画, 連載 など
4. **anime** — アニメ, 映画 など
5. **goods** — ぬいぐるみ, フィギュア, Tシャツ など
6. **other** — 上記に当てはまらないもの

キャラクタータグ: ちいかわ, ハチワレ, うさぎ, くりまんじゅう, モモンガ, シーサー, もんじゃ, セイレーン, 古本屋

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

## 保守メモ

### よくあるトラブル

| 症状 | 原因と対処 |
|------|-----------|
| X投稿が更新されない | `auth_token` が失効している可能性。Render のダッシュボードで環境変数を更新する。フェッチが失敗すると GitHub Issue が自動作成されるので、まずそれを確認する |
| RSSHub が 504 エラー | Render のコールドスタート。`update-data.yml` の `continue-on-error: true` により次回のスケジュールで自動リトライされる |
| ニュースが取れない | Google Alerts の RSS URL が変わっている可能性。Google Alerts で再設定して `GOOGLE_ALERTS_RSS_URL` を更新 |
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
