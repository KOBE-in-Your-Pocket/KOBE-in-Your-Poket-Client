#!/usr/bin/env bash
#
# scripts/setup-wsl.sh
#
# WSL2 上で Android エミュレータをヘッドレス起動するための
# OS レベルの前提を整える。
#   - libpulse0      … エミュレータの起動に必須（無いと起動直後に落ちる）
#   - KVM アクセス権  … kvm グループへ追加（ハードウェア仮想化に必須）
#
# AVD（仮想デバイス）の作成は scripts/setup-emulators.sh が担当する。
# このスクリプトはその手前の「OS の下準備」だけを行う。
#
# 冪等: 何度実行しても安全。既に整っている項目は skip する。
# 注意: kvm グループ追加後は WSL の再起動が必要（このスクリプトからは自動化不可）。
#       PowerShell で `wsl --shutdown` → Ubuntu を開き直す。
#

set -euo pipefail

# ── 色出力 ────────────────────────────────────────
if [[ -t 1 ]]; then
  GREEN="$(tput setaf 2)"
  RED="$(tput setaf 1)"
  YELLOW="$(tput setaf 3)"
  BOLD="$(tput bold)"
  RESET="$(tput sgr0)"
else
  GREEN=""; RED=""; YELLOW=""; BOLD=""; RESET=""
fi

ok()   { echo "${GREEN}✓${RESET} $1"; }
ng()   { echo "${RED}✗${RESET} $1"; }
warn() { echo "${YELLOW}!${RESET} $1"; }
step() { echo ""; echo "${BOLD}==> $1${RESET}"; }

# ── WSL2 ガード ───────────────────────────────────
if [[ "$(uname -s)" != "Linux" ]] || ! grep -qiE 'microsoft|wsl' /proc/version 2>/dev/null; then
  ng "このスクリプトは WSL2 専用です（現在の環境は WSL ではありません）。"
  echo "  macOS / Linux ネイティブでは不要です。" >&2
  exit 1
fi

NEED_RESTART=0

# ── 1. libpulse0 ──────────────────────────────────
step "libpulse0（エミュレータ起動に必須）"
if dpkg -s libpulse0 >/dev/null 2>&1; then
  ok "libpulse0 インストール済み"
else
  echo "  未インストール。apt で入れます（sudo パスワードを求められます）"
  sudo apt-get update
  sudo apt-get install -y libpulse0
  ok "libpulse0 インストール完了"
fi

# ── 2. KVM アクセス権 ─────────────────────────────
step "KVM（ハードウェア仮想化）"
if [[ ! -e /dev/kvm ]]; then
  ng "/dev/kvm が存在しません。"
  echo "  WSL2 のネストされた仮想化が無効の可能性があります。" >&2
  echo "  Windows 側で WSL2（WSL1 ではなく）を使っているか確認してください:" >&2
  echo "    PowerShell:  wsl -l -v  → VERSION が 2 であること" >&2
  exit 1
fi

if [[ -w /dev/kvm ]]; then
  # 現在のセッションで既に書き込み可 = グループ反映済み
  ok "/dev/kvm に書き込み可（KVM 利用可能）"
elif getent group kvm | grep -qw "$USER"; then
  # グループには登録済みだが現在のセッションに未反映
  warn "kvm グループに登録済みですが、現在のセッションにまだ反映されていません。"
  NEED_RESTART=1
else
  echo "  $USER を kvm グループに追加します（sudo パスワードを求められます）"
  sudo gpasswd -a "$USER" kvm
  ok "kvm グループに追加しました"
  NEED_RESTART=1
fi

# ── 結果 ──────────────────────────────────────────
echo ""
if [[ $NEED_RESTART -eq 1 ]]; then
  echo "${YELLOW}${BOLD}=== あと一歩: WSL の再起動が必要です ===${RESET}"
  echo "  kvm グループの変更を反映するには WSL を再起動してください:"
  echo "    1. PowerShell（Windows 側）で:  ${BOLD}wsl --shutdown${RESET}"
  echo "    2. Ubuntu を開き直す"
  echo "    3. 確認:  ${BOLD}bash scripts/doctor.sh${RESET}"
  echo ""
  echo "  その後、AVD を作成してエミュレータを起動:"
  echo "    bash scripts/setup-emulators.sh   # AVD 一括作成（未作成の場合）"
  echo "    bash scripts/start-android.sh     # エミュレータ起動 + Metro"
  exit 0
else
  echo "${GREEN}${BOLD}=== WSL の前提は整っています ===${RESET}"
  echo "  AVD 未作成なら:  bash scripts/setup-emulators.sh"
  echo "  エミュレータ起動: bash scripts/start-android.sh"
  exit 0
fi
