document.addEventListener("keydown", (e) => {
  // ★ ここで自前発行のイベントは無視 ★
  if (!e.isTrusted) return;

  // 以降は先ほどの構造どおり
  const tgt = e.target;
  const isTextarea = tgt.tagName === "TEXTAREA";
  const isEditable = tgt.isContentEditable;
  if (!isTextarea && !isEditable) return;

  // IME確定スキップなど ...

  // Ctrl/Cmd+Enter → 送信
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault(); e.stopImmediatePropagation();
    document
      .querySelector('button[data-testid="send-button"], button[aria-label="送信"]')
      ?.click();
    return;
  }

  // Enter（単押し）→ 改行
  if (e.key === "Enter") {
    e.preventDefault(); e.stopImmediatePropagation();

    if (isTextarea) {
      // textarea には直接 "\n"
      const pos = tgt.selectionStart;
      tgt.setRangeText("\n", pos, pos, "end");
      tgt.selectionStart = tgt.selectionEnd = pos + 1;
    } else {
      // ProseMirror は Shift+Enter をエミュレート
      const evOpts = {
        key: "Enter",
        code: "Enter",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      };
      // ここで dispatchEvent しても isTrusted===false なので再帰しない
      tgt.dispatchEvent(new KeyboardEvent("keydown", evOpts));
      tgt.dispatchEvent(new KeyboardEvent("keyup",   evOpts));
    }
  }
}, /* useCapture */ true);
