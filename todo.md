# Educate アプリ TODO

本番URL: https://educate-app-masuyahirotos-projects.vercel.app

---

## 【最優先】1. デプロイする

### 何が起きているか
`vite.config.js` のPWA設定を修正済み（`skipWaiting: true` 追加）だが、
まだVercelに反映されていない。このコマンドを実行するまで本番サイトは古いままになる。

### 手順

**方法A: Gitプッシュ（推奨）**

```bash
cd C:\Users\masum\Documents\Educate\educate-app
git push origin master
```

Vercelが自動的にビルド＆デプロイする。完了まで約1〜2分。

進捗はここで確認：
https://vercel.com/masuyahirotos-projects/educate-app/deployments

**方法B: Vercel CLI**

```bash
cd C:\Users\masum\Documents\Educate\educate-app
vercel --prod
```

### 完了確認
デプロイ完了後、本番URLにアクセスして動作確認する：
https://educate-app-masuyahirotos-projects.vercel.app

---

## 【デプロイ直後】2. ブラウザキャッシュを手動クリア（初回のみ）

### 何が起きているか
古いService Workerがブラウザに残っているため、デプロイ直後だけ手動でクリアが必要。
今回の修正（`skipWaiting`）により、**次回以降のデプロイでは自動で切り替わる**。

### 手順

**PCブラウザ（Chrome / Edge）**
1. 本番URLを開く
2. `Ctrl + Shift + R` でスーパーリロード

または

1. `F12` → Application タブ → Service Workers
2. 「Unregister」をクリック
3. 普通にリロード

**スマホ（Chrome）**
1. ブラウザの右上メニュー → 設定
2. プライバシーとセキュリティ → 閲覧履歴データを削除
3. 「キャッシュされた画像とファイル」にチェック → 削除

---

## 3. ローカル開発環境のFirebase設定

### 何が起きているか
`.env.local` にFirebase認証情報がないため、`npm run dev` でローカル起動しても
Firebaseに接続できず「読み込み中…」のまま止まる。

### 手順

**方法A: Vercelダッシュボードから環境変数をDevelopmentにも追加する**

1. 以下のURLにアクセスする
   https://vercel.com/masuyahirotos-projects/educate-app/settings/environment-variables

2. 下記6つの変数それぞれについて、「Development」のチェックが入っているか確認する
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. 入っていなければ各変数を編集して Development にチェックを入れて保存する

4. ターミナルで実行する
   ```bash
   vercel env pull
   ```
   → `.env.local` にFirebase認証情報が書き込まれる

**方法B: 直接 `.env.local` に書く**

Firebaseコンソール（https://console.firebase.google.com）でプロジェクトを開き、
プロジェクトの設定 → 全般 → マイアプリ → Firebase SDK snippet の「構成」を選択。
表示された値を `.env.local` に貼り付ける：

```
VITE_FIREBASE_API_KEY=ここに貼り付け
VITE_FIREBASE_AUTH_DOMAIN=ここに貼り付け
VITE_FIREBASE_PROJECT_ID=ここに貼り付け
VITE_FIREBASE_STORAGE_BUCKET=ここに貼り付け
VITE_FIREBASE_MESSAGING_SENDER_ID=ここに貼り付け
VITE_FIREBASE_APP_ID=ここに貼り付け
```

### 確認
```bash
npm run dev
```
ブラウザで http://localhost:5173 を開いてアプリが表示されればOK。

---

## 4. Vercelの環境変数名のタイポ確認

### 何が起きているか
Vercel CLIで確認したところ `VITE_FIREBASE_STORAGE_BUCKE` と末尾が
欠けている可能性がある（正しくは `VITE_FIREBASE_STORAGE_BUCKET`）。

### 手順

1. 以下のURLにアクセスする
   https://vercel.com/masuyahirotos-projects/educate-app/settings/environment-variables

2. `VITE_FIREBASE_STORAGE_BUCKET` の名前が正しいか確認する

3. もし `VITE_FIREBASE_STORAGE_BUCKE` になっていたら名前を修正して保存する

4. 修正した場合は再デプロイが必要（上記の手順1を再実行）

---

## 完了済み

- [x] PWAキャッシュ問題の原因特定（Service Workerがデプロイ後も古いコードを配信し続ける）
- [x] `vite.config.js` に `skipWaiting: true` と `clientsClaim: true` を追加して修正
- [x] クリーンビルド実行（dist 再生成済み）
- [x] `.gitignore` に `.env*` を追加
- [x] Gitコミット済み（あとはpushするだけ）
