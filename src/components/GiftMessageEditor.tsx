"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import styles from "./GiftMessageEditor.module.css";

const MAX_CHARS = 200;

interface GiftMessageEditorProps {
  message: string;
  onSave: (message: string) => void;
  onCancel: () => void;
}

export function GiftMessageEditor({ message, onSave, onCancel }: GiftMessageEditorProps) {
  const [text, setText] = useState(message);
  const { t } = useI18n();

  const remaining = MAX_CHARS - text.length;

  return (
    <div className={styles.container}>
      {/* Text Input */}
      <div className={styles.editorArea}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setText(e.target.value);
            }
          }}
          placeholder={t("gift.placeholder")}
          maxLength={MAX_CHARS}
        />
        <span className={`${styles.charCount} ${remaining < 30 ? styles.charCountWarn : ""}`}>
          {remaining} {t("gift.charLimit")}
        </span>
      </div>

      {/* Live Preview Card */}
      <div className={styles.previewSection}>
        <div className={styles.previewLabel}>{t("gift.preview")}</div>
        <div className={styles.previewCard}>
          <div className={styles.previewIcon}>🎁</div>
          <div className={`${styles.previewText} ${!text ? styles.previewEmpty : ""}`}>
            {text || t("gift.placeholder")}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          {t("gift.cancel")}
        </button>
        <button className={styles.saveBtn} onClick={() => onSave(text)}>
          {t("gift.save")}
        </button>
      </div>
    </div>
  );
}
