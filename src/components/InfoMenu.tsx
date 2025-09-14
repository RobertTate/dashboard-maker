import { DotFilledIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { DropdownMenu } from "radix-ui";
import { useEffect, useState } from "react";

import db from "../dbInstance";
import styles from "../styles/InfoMenu.module.css";

const modesMap = {
  dark: "Dark",
  light: "Light",
};

const themesMap = {
  default: "Default",
  avocado: "Avocado",
  sapphire: "Sapphire",
  rose: "Rose",
  ember: "Ember",
  forest: "Forest",
  sunset: "Sunset",
  aurora: "Aurora",
  oceanfloor: "Ocean Floor",
  desertdusk: "Desert Dusk",
  glacier: "Glacier",
  emberglow: "Ember Glow",
  steel: "Steel",
  royal: "Royal",
  coralteal: "Coral Teal",
  goldviolet: "Gold Violet",
  skynight: "Sky Night",
  mosswine: "Moss Wine",
  sandsea: "Sand Sea",
  berrycitrus: "Berry Citrus",
  icefire: "Ice Fire",
  orchidjade: "Orchid Jade",
  sunforest: "Sun Forest",
  stormrose: "Storm Rose",
  charcoal: "Charcoal",
  jade: "Jade",
};

type Theme = keyof typeof themesMap;
type Mode = keyof typeof modesMap;

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
