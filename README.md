# TurboWarp Time-Space Sync App

time-space-sync拡張の光学時刻対応と配置校正を、実カメラと実画面で検証するアプリです。

## 位置づけ

`kubohiroya/turbowarp-time-space-sync`拡張の検証用アプリです。会場運用の一連のセットアップ手順は消費側アプリ（realtime-motion-capture-app、photogrammetry-appのクラスターモード）が1つのSB3で持ちます。本appはそこへ手順を提供しません。

隣接する工程は別リポジトリが担当します。

- レンズ校正（内部校正）: `turbowarp-camera-calibration-app`。本appはそこが作ったプロファイルをファイルで読み込むだけで、校正手順もOpenCVも持ちません。
- QR搬送によるWebRTCペアリング: `turbowarp-webrtc-qrcode-pairing`。複数PCモードで利用します。

ペアリング済みの接続をアプリ間で引き継ぐことはできません。別のSB3を開くとWebRTC拡張のインスタンスが作り直され、既存の接続はblockから到達できなくなります。そのため同一PCモードを主対象とし、複数PCモードはペアリング拡張が利用可能になってから追加します。

## 現在の内容

turbowarp-app-templateから生成した初期雛形です。用途固有の機能は未実装です。

- 共通app-shellを利用したモード選択・案内・エラー表示。
- 展開済みSB3ソースと、緑の旗で状態変数を更新する起動確認スクリプト。
- SB3と配布ページのビルド、SHA-256の記録、CI。

配布ページはTurboWarpプレイヤーを内蔵せず、起動確認用SB3のダウンロードを提供します。開発サーバーでダウンロードする際は事前にbuild:sb3を実行してください。

## 実装予定

- 複数cameraIdを割り当て、統合参照面（時刻コードパネルと既知寸法の位置基準）を全画面表示する。
- decoderのレベル校正と観測収集を案内し、decode率・contrast・観測数を表示する。
- カメラ間の相対遅延を推定して提示する。表示遅延・時計差・未確定成分を分けて示し、絶対遅延が求まらないことを明示する。
- 参照面の実寸と投影条件を入力・記録する。概算と実測を区別し、表示設定の変更時は再確認を促す。
- 共通基準に対する配置をsolveし、再投影誤差とsolveに使っていない観測による独立検証を表示する。
- 内部校正プロファイルをファイルから読み込む。撮影条件に適合しないもの、適合を判定できないものは適用前に拒否する。
- 結果を書き出し・読み込む。配置結果は読込み直後をunverifiedとして扱い、再確認を通るまで確定扱いにしない。

## モード

- **同一PC**：1台のPCに接続した複数カメラを扱う。WebRTCペアリングを必要としない。主対象。
- **複数PC**：QR搬送ペアリング拡張が利用可能になってから追加する。既定OFF。

## 依存と責務

- time-space-sync：光学時刻対応の推定と、固定rig／共通基準に対する配置solve。本appの検証対象。
- camera-source：カメラ取得・lease・撮影条件と、内部校正プロファイルの契約。
- camera-calibration-app：内部校正プロファイルの生成側。本appはファイルで受け取るだけで、校正手順とOpenCVを持たない。
- webrtc-qrcode-pairing／webrtc：複数PCモードで利用する。同一PCモードでは使わない。

実際の依存はpackage.jsonのturbowarp-app-shell 0.2.0のみです。上記の用途固有の接続は予定であり、未公開の初期拡張に依存しません。追加時には拡張のexact version、配布物hash、API manifest、評価順序を固定します。

## 構成と開発

Node.js >=22.18.0、pnpm 11.11.0。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

- config/app.json：名前、モード、説明、実装予定。
- config/feature-flags.ts：起動時固定・既定OFFの実験機能フラグ。
- scripts/project.ts：起動確認用SB3の正本。
- apps/main/source：生成した展開済みSB3ソース。
- src：共通シェルを利用する配布ページ。
- public/downloads：生成SB3とrelease.json。
- dist：配布ページとダウンロードのビルド結果。

project.tsやtitleを変更したらpnpm source:updateで生成ソースを更新します。生成SB3・distはGit管理対象外です。アーカイブはsb3-toolchainで生成します。

## 段階導入と受け入れ基準

1. 関連GitHub Issueで既存実装の抽出対象、依存、DoD、切戻しを確定する。
2. 用途固有の経路を既定OFFで追加し、既存側は委譲へ置き換える。
3. 機材による統合検証で誤差・遅延・停止と復旧を記録する。
4. 本体拡張のアルゴリズムをアプリに重複実装しない。

初期雛形のDoDはpnpm check成功、SB3で緑の旗による状態更新、配布ページで説明・モード選択・SB3ダウンロードが確認できることです。カメラを使う用途機能の実機検証は未実施です。

## ロールバックとタスク管理

新経路はconfig/feature-flags.tsのフラグOFFで止め、移行中は旧アプリ経路と互換読取りを保持します。初期フラグをONにしても用途固有の機能は実装されません。

GitHub Issuesを進捗の正本とし、start/done/blockedを記録します。スコープと設計判断の経緯は[Issue #1](https://github.com/kubohiroya/turbowarp-time-space-sync-app/issues/1)にあります。

## 抽出元

紙芝居アプリとrealtime-motion-capture-appから抽出した共通構成を利用しています。詳しくは[抽出記録](docs/extraction.md)を参照してください。

## ライセンス

MPL-2.0。packageは初期状態ではprivateです。
