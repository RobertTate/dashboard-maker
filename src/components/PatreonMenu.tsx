import { Cross2Icon } from "@radix-ui/react-icons";
import { Dialog, DropdownMenu } from "radix-ui";
import { memo, useEffect, useState } from "react";

import announcementsJson from "../announcements.json";
import PatreonIcon from "../assets/patreon.svg?react";
import { LAST_SEEN_ANNOUNCEMENT_KEY } from "../constants/dbKeys";
import db from "../dbInstance";
import dialogStyles from "../styles/DashboardMenu.module.css";
import menuStyles from "../styles/InfoMenu.module.css";
import styles from "../styles/PatreonMenu.module.css";
import type { AnnouncementProps } from "../types/index.ts";

const PATREON_URL = "https://www.patreon.com/cw/HobbiesForBobbies";

const PATREON_POSTS_URL = "https://www.patreon.com/cw/HobbiesForBobbies/posts";

const announcements = announcementsJson as AnnouncementProps[];

const openPatreon = (url: string) => {
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (w) w.opener = null;
};

export const PatreonMenu = memo(() => {
  const [modalOpen, setModalOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  // Only rendered on the home screen, so mounting is the "safe to
  // interrupt" signal: auto-open the modal once per new announcement.
  useEffect(() => {
    if (announcements.length === 0) return;
    const checkForUnseen = async () => {
      const lastSeenId = await db.getItem(LAST_SEEN_ANNOUNCEMENT_KEY);
      if (lastSeenId !== announcements[0].id) {
        setHasUnseen(true);
        setModalOpen(true);
      }
    };
    checkForUnseen();
  }, []);

  const markSeen = () => {
    setHasUnseen(false);
    if (announcements.length > 0) {
      db.setItem(LAST_SEEN_ANNOUNCEMENT_KEY, announcements[0].id);
    }
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            style={{
              cursor: "pointer",
            }}
            className={styles.IconButton}
            aria-label="Patreon menu"
            title="Patreon"
          >
            <PatreonIcon style={{ width: "14px", height: "14px" }} />
            {hasUnseen && <span className={styles.UnseenDot} />}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={menuStyles.Content}
            sideOffset={5}
            collisionPadding={15}
          >
            <DropdownMenu.Item
              className={menuStyles.Item}
              onSelect={() => openPatreon(PATREON_URL)}
            >
              Check out my Patreon{" "}
              <div
                style={{
                  transform: "rotate(325deg) translateY(6px) translateX(-2px)",
                  fontSize: "19px",
                }}
                className={menuStyles.RightSlot}
              >
                🔗︎
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className={menuStyles.Separator} />
            <DropdownMenu.Item
              className={menuStyles.Item}
              onSelect={() => setModalOpen(true)}
            >
              See Recent Posts
            </DropdownMenu.Item>
            <DropdownMenu.Arrow
              className={menuStyles.Arrow}
              width={10}
              height={10}
            />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) markSeen();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={dialogStyles.DialogOverlay} />
          <Dialog.Content
            className={dialogStyles.DialogContent}
            aria-describedby={undefined}
          >
            <Dialog.Title className={dialogStyles.DialogTitle}>
              Patreon Posts
            </Dialog.Title>
            {announcements.length > 0 ? (
              <div className={styles.postList}>
                {announcements.map((announcement) => (
                  <article className={styles.post} key={announcement.id}>
                    <span className={styles.postDate}>
                      {new Date(announcement.date).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </span>
                    <h4 className={styles.postTitle}>{announcement.title}</h4>
                    <p className={styles.postExcerpt}>{announcement.excerpt}</p>
                    <a
                      className={styles.postLink}
                      href={announcement.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read on Patreon →
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <p className={dialogStyles.DialogDescription}>
                No posts pulled in yet.{" "}
                <a href={PATREON_POSTS_URL} target="_blank" rel="noopener noreferrer">
                  See everything on Patreon →
                </a>
              </p>
            )}
            <Dialog.Close asChild>
              <button className={dialogStyles.DialogClose} aria-label="Close">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
});

PatreonMenu.displayName = "PatreonMenu";
