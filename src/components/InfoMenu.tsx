import { DotFilledIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { DropdownMenu } from "radix-ui";
import { useEffect, useState } from "react";

import { MODE_KEY, SORT_ORDER_KEY, THEME_KEY } from "../constants/dbKeys";
import {
  DEFAULT_SORT_ORDER,
  type SortOrder,
  sortOrdersMap,
} from "../constants/sortOptions";
import {
  type Mode,
  type Theme,
  modesMap,
  themesMap,
} from "../constants/themeOptions";
import db from "../dbInstance";
import styles from "../styles/InfoMenu.module.css";

export const InfoMenu = () => {
  const [theme, setTheme] = useState<Theme>("default");
  const [mode, setMode] = useState<Mode>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);

  useEffect(() => {
    const checkForSetTheme = async () => {
      const theme = (await db.getItem(THEME_KEY)) as Theme;
      if (theme) {
        setTheme(theme);
      }
    };

    const checkForSetMode = async () => {
      const mode = (await db.getItem(MODE_KEY)) as Mode;
      if (mode) {
        setMode(mode);
      }
    };

    const checkForSetSortOrder = async () => {
      const sortOrder = (await db.getItem(SORT_ORDER_KEY)) as SortOrder;
      if (sortOrder) {
        setSortOrder(sortOrder);
      }
    };

    checkForSetTheme();
    checkForSetMode();
    checkForSetSortOrder();
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          style={{
            cursor: "pointer",
          }}
          className={styles.IconButton}
          aria-label="Customise options"
          title="Options"
        >
          <HamburgerMenuIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.Content}
          sideOffset={5}
          collisionPadding={15}
        >
          <DropdownMenu.Item
            className={styles.Item}
            onSelect={() => {
              const url = "https://github.com/RobertTate/dashboard-maker";
              const w = window.open(url, "_blank", "noopener,noreferrer");
              if (w) w.opener = null;
            }}
          >
            Read the Docs{" "}
            <div
              style={{
                transform: "rotate(325deg) translateY(6px) translateX(-2px)",
                fontSize: "19px",
              }}
              className={styles.RightSlot}
            >
              🔗︎
            </div>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={styles.Separator} />
          <DropdownMenu.Label className={styles.Label}>
            Sort Dashboards By - {sortOrdersMap[sortOrder]}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={sortOrder}
            onValueChange={(value) => {
              setSortOrder(value as SortOrder);
              db.setItem(SORT_ORDER_KEY, value);
            }}
          >
            {Object.entries(sortOrdersMap).map((entry) => {
              const [key, value] = entry;
              return (
                <DropdownMenu.RadioItem
                  className={styles.RadioItem}
                  value={key}
                  key={key}
                  title="Applied when you hit the refresh button."
                >
                  <DropdownMenu.ItemIndicator className={styles.ItemIndicator}>
                    <DotFilledIcon />
                  </DropdownMenu.ItemIndicator>
                  {value}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator className={styles.Separator} />
          <DropdownMenu.Label className={styles.Label}>
            Mode - {modesMap[mode]}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={mode}
            onValueChange={(value) => {
              setMode(value as Mode);
              document.documentElement.setAttribute("data-mode", value);
              db.setItem(MODE_KEY, value);
            }}
          >
            {Object.entries(modesMap).map((entry) => {
              const [key, value] = entry;
              return (
                <DropdownMenu.RadioItem
                  className={styles.RadioItem}
                  value={key}
                  key={key}
                >
                  <DropdownMenu.ItemIndicator className={styles.ItemIndicator}>
                    <DotFilledIcon />
                  </DropdownMenu.ItemIndicator>
                  {value}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator className={styles.Separator} />

          <DropdownMenu.Label className={styles.Label}>
            Theme - {themesMap[theme]}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            className={styles.RadioGroup}
            value={theme}
            onValueChange={(value) => {
              setTheme(value as Theme);
              document.documentElement.setAttribute("data-theme", value);
              db.setItem(THEME_KEY, value);
            }}
          >
            {Object.entries(themesMap).map((entry) => {
              const [key, value] = entry;
              return (
                <DropdownMenu.RadioItem
                  className={styles.RadioItem}
                  value={key}
                  key={key}
                >
                  <DropdownMenu.ItemIndicator className={styles.ItemIndicator}>
                    <DotFilledIcon />
                  </DropdownMenu.ItemIndicator>
                  {value}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Arrow className={styles.Arrow} width={10} height={10} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
