import { useEffect, useRef, memo } from "react";

import styles from "../styles/ColumnToggle.module.css";
import type { ColumnToggleProps } from "../types";

const ColumnToggle = memo(({
  updateColsStatus,
  columns,
}: ColumnToggleProps) => {
  const sliderRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      let initialCheckedValue = false;
      if (columns && columns === 12) {
        initialCheckedValue = true;
      }
      inputRef.current.checked = initialCheckedValue;
    }
  }, [columns]);

  const handleToggle = () => {
    const inputIsChecked = inputRef.current?.checked;
    const colValue = inputIsChecked ? "12" : "8";
    if (sliderRef.current) {
      sliderRef.current.dataset.before = colValue;
    }
    updateColsStatus(Number(colValue));
  };

  return (
    <label
      title="Toggle the number of base columns between 8 (default) and 12."
      className={styles["columnToggle-label"]}
    >
      <input
        ref={inputRef}
        className={styles["columnToggle-checkbox"]}
        type="checkbox"
        onChange={handleToggle}
      />
      <span
        data-before={`${columns ? columns : 8}`}
        ref={sliderRef}
        className={styles["columnToggle-slider"]}
      ></span>
    </label>
  );
});

export default ColumnToggle;
