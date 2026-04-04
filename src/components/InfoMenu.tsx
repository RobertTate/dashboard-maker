import { DotFilledIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { DropdownMenu } from "radix-ui";
import { useEffect, useState } from "react";

import { modesMap, themesMap, type Mode, type Theme } from "../constants/themeOptions";
import db from "../dbInstance";
import styles from "../styles/InfoMenu.module.css";

export const InfoMenu = () => {
  const [theme, setTheme] = useState<Theme>("default");
  const [mode, setMode] = useState<Mode>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const checkForSetTheme = async () => {
      const theme = (await db.getItem("Dash_Theme_String")) as Theme;
      if (theme) {
        setTheme(theme);
      }
    };

    const checkForSetMode = async () => {
      const mode = (await db.getItem("Dash_Mode_String")) as Mode;
      if (mode) {
        setMode(mode);
      }
    };

    checkForSetTheme();
    checkForSetMode();
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          style={{
            position: "absolute",
            top: "22px",
            right: "14px",
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
            Mode - {modesMap[mode]}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={mode}
            onValueChange={(value) => {
              setMode(value as Mode);
              document.documentElement.setAttribute("data-mode", value);
              db.setItem("Dash_Mode_String", value);
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
              db.setItem("Dash_Theme_String", value);
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
