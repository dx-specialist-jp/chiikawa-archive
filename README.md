# ちいかわ観測所 🔭

ちいかわ（nagano）の公式X（旧Twitter）情報を整理・検索しやすくする**非公式**ナレッジサイトです。

👉 **サイト**: https://dx-specialist-jp.github.io/chiikawa-archive/

---

## ⚠️ 免責事項

本サイトはファンによる非公式サイトであり、公式とは一切関係ありません。
著作権・商標権その他の権利は権利者に帰属します。
漫画画像・動画はサイト内に保存せず、公式X埋め込み機能のみ利用します。

---

## 技術構成

| 項目 | 内容 |
|------|------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS |
| Data | JSON（`public/data/`）|
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

## ローカル開発

```bash
npm install
npm run dev
```

## デプロイ

`main` ブランチへのプッシュで自動デプロイ（GitHub Actions）。

### GitHub Pages の設定

1. リポジトリの Settings → Pages → Source を **GitHub Actions** に設定
2. Actions タブで Deploy workflow が動作することを確認

### データ自動更新

毎日 JST 9:00 に実行。X API のベアラートークンを設定するとリアルデータを取得できます。

```
Settings → Secrets and variables → Actions → X_BEARER_TOKEN
```

---

## ディレクトリ構成

```
src/
  app/
    page.tsx          # トップ（観測所）
    episodes/         # エピソード図書館
    rights/           # 権利者様へ
    contact/          # お問い合わせ
  components/         # 共通コンポーネント
  types/              # 型定義
public/
  data/
    posts.json        # 投稿データ
    episodes.json     # エピソードデータ
scripts/
  fetch-posts.mjs     # X APIデータ取得スクリプト
.github/
  workflows/
    deploy.yml        # GitHub Pages デプロイ
    update-data.yml   # 毎日データ更新
```
