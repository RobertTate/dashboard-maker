import isEqual from "lodash.isequal";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

import { ActiveToolbarContext } from "../ActiveToolbarContext";
import CrossIcon from "../assets/cross.svg?react";
import db from "../dbInstance";
import startingLayouts from "../partials/startingLayout";
import type {
  DashboardItemsProps,
  SyncingGridProps,
  TextAlignment,
  WidgetProps,
} from "../types";
import randomUUID from "../uid";
import TooltipDialog from "./TooltipDialog";
import Widget from "./Widget";

const styleAlignmentMap = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const SyncingGrid = memo(
  ({
    dashName,
    isLocked,
    columns,
    mode,
    theme,
    updateLockedStatus,
    updateColsStatus,
    updateMode,
    updateTheme,
  }: SyncingGridProps) => {
    const ResponsiveReactGridLayout = useMemo(
      () => WidthProvider(Responsive),
      [],
    );

    const [isPending, startTransition] = useTransition();
    const [layouts, setLayouts] = useState<ReactGridLayout.Layouts | null>(
      null,
    );
    const [widgets, setWidgets] = useState<WidgetProps[] | null>(null);
    const [syncStorage, setSyncStorage] = useState(0);
    const activeToolbarKeyRef = useRef("");
    const [openTooltip, setOpenTooltip] = useState<{
      widgetId: string;
      tooltipId: string;
    } | null>(null);

    console.log("Rendering SyncingGrid");

    useEffect(() => {
      const getSavedItems = async () => {
        const dashboardItems: DashboardItemsProps | null =
          await db.getItem(dashName);
        const savedLayouts = dashboardItems?.layouts;
        const savedWidgets = dashboardItems?.widgets;
        const savedLockStatus = dashboardItems?.isLocked;
        const savedColumns = dashboardItems?.columns;
        const savedMode = dashboardItems?.mode;
        const savedTheme = dashboardItems?.theme;
        startTransition(() => {
          if (savedLayouts) {
            setLayouts((prevLayouts) => {
              return isEqual(prevLayouts, savedLayouts)
                ? prevLayouts
                : savedLayouts;
            });
          } else {
            setLayouts(startingLayouts);
          }

          if (savedWidgets) {
            setWidgets((prevWidgets) => {
              return isEqual(prevWidgets, savedWidgets)
                ? prevWidgets
                : savedWidgets;
            });
          } else {
            setWidgets([]);
          }

          if (savedLockStatus) {
            updateLockedStatus(savedLockStatus);
          }

          if (savedColumns) {
            updateColsStatus(savedColumns);
          }

          if (savedMode) {
            updateMode(savedMode);
          }

          if (savedTheme) {
            updateTheme(savedTheme);
          }
        });
      };
      getSavedItems();
    }, [dashName, updateColsStatus, updateLockedStatus, updateMode, updateTheme]);

    useEffect(() => {
      const updateLayouts = async () => {
        if (layouts && widgets) {
          const newdashboardItems: DashboardItemsProps = {
            layouts: layouts,
            widgets: widgets,
            isLocked,
            columns,
            mode,
            theme,
          };
          await db.setItem(dashName, newdashboardItems);
        }
      };
      updateLayouts();
    }, [syncStorage, isLocked, columns, mode, theme, dashName, layouts, widgets]);

    const onLayoutChange = useCallback(
      (
        _layout: ReactGridLayout.Layout[],
        newLayouts: ReactGridLayout.Layouts,
      ) => {
        if (!isEqual(layouts, newLayouts)) {
          setLayouts((prevLayouts) => {
            return isEqual(prevLayouts, newLayouts) ? prevLayouts : newLayouts;
          });
          setSyncStorage((prev) => prev + 1);
        }
      },
      [layouts],
    );

    const addNewWidget = useCallback(() => {
      const uniqueKey = randomUUID();
      const newWidget: WidgetProps = { id: uniqueKey, content: "✏️" };
      setWidgets((prev) => (prev ? [...prev, newWidget] : [newWidget]));
      setSyncStorage((prev) => prev + 1);
    }, []);

    const deleteWidget = useCallback((selectedWidgetId: string) => {
      setWidgets((prev) =>
        prev ? prev.filter((w) => w.id !== selectedWidgetId) : prev,
      );
      setSyncStorage((prev) => prev + 1);
    }, []);

    const updateWidgetContent = useCallback(
      (item: WidgetProps, content: string) => {
        setWidgets((prev) => {
          if (!prev) return prev;
          const target = prev.find((w) => w.id === item.id);
          if (!target || target.content === content) return prev;
          return prev.map((w) =>
            w.id === item.id ? { ...w, content } : w,
          );
        });
        setSyncStorage((prev) => prev + 1);
      },
      [],
    );

    const updateWidgetTextAlignment = useCallback(
      (itemId: string, alignment: TextAlignment) => {
        setWidgets((prev) => {
          if (!prev) return prev;
          const target = prev.find((w) => w.id === itemId);
          if (!target || target.alignment === alignment) return prev;
          return prev.map((w) =>
            w.id === itemId ? { ...w, alignment } : w,
          );
        });
        setSyncStorage((prev) => prev + 1);
      },
      [],
    );

    const updateTooltipContent = useCallback(
      (widgetId: string, tooltipId: string, content: string) => {
        setWidgets((prev) => {
          if (!prev) return prev;
          const target = prev.find((w) => w.id === widgetId);
          if (!target || target.tooltips?.[tooltipId] === content) return prev;
          return prev.map((w) =>
            w.id === widgetId
              ? { ...w, tooltips: { ...w.tooltips, [tooltipId]: content } }
              : w,
          );
        });
        setSyncStorage((prev) => prev + 1);
      },
      [],
    );

    const handleTooltipCreate = useCallback(
      (widgetId: string, tooltipId: string) => {
        setWidgets((prev) => {
          if (!prev) return prev;
          return prev.map((w) =>
            w.id === widgetId
              ? { ...w, tooltips: { ...w.tooltips, [tooltipId]: "✏️" } }
              : w,
          );
        });
        setSyncStorage((prev) => prev + 1);
        setOpenTooltip({ widgetId, tooltipId });
      },
      [],
    );

    // Prune orphaned tooltips on unmount (dashboard close)
    useEffect(() => {
      return () => {
        const pruneAllOrphanedTooltips = async () => {
          const dashboardItems: DashboardItemsProps | null =
            await db.getItem(dashName);
          if (!dashboardItems?.widgets) return;

          let changed = false;
          const updatedWidgets = dashboardItems.widgets.map((widget) => {
            if (!widget.tooltips || Object.keys(widget.tooltips).length === 0)
              return widget;

            const tooltipIdPattern = /:tooltip\[.*?\]\{#([^}]+)\}/g;
            const referencedIds = new Set<string>();
            let match;
            while (
              (match = tooltipIdPattern.exec(widget.content)) !== null
            ) {
              referencedIds.add(match[1]);
            }

            const currentIds = Object.keys(widget.tooltips);
            const orphanIds = currentIds.filter(
              (id) => !referencedIds.has(id),
            );

            if (orphanIds.length > 0) {
              changed = true;
              const prunedTooltips = { ...widget.tooltips };
              for (const id of orphanIds) {
                delete prunedTooltips[id];
              }
              return { ...widget, tooltips: prunedTooltips };
            }
            return widget;
          });

          if (changed) {
            await db.setItem(dashName, {
              ...dashboardItems,
              widgets: updatedWidgets,
            });
          }
        };

        pruneAllOrphanedTooltips();
      };
    }, [dashName]);

    // Document-level click handler for tooltip triggers
    useEffect(() => {
      const handleTooltipClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const tooltipTrigger = target.closest("[data-tooltip-id]");
        if (!tooltipTrigger) return;

        const tooltipId = (tooltipTrigger as HTMLElement).dataset.tooltipId;
        if (!tooltipId) return;

        // Traverse up to find the grid item ID (widget ID)
        let el: HTMLElement | null = tooltipTrigger as HTMLElement;
        while (el && !el.classList.contains("react-grid-item")) {
          el = el.parentElement;
        }
        const widgetId = el?.id;
        if (!widgetId) return;

        e.preventDefault();
        e.stopPropagation();
        setOpenTooltip({ widgetId, tooltipId });
      };

      document.addEventListener("click", handleTooltipClick);
      return () => document.removeEventListener("click", handleTooltipClick);
    }, []);

    const memoizedChildren = useMemo(() => {
      const newWidgetChild = (
        <div
          title="Add a new dashboard item"
          key="New Widget"
          id="add-widget"
          data-grid={{
            x: 0,
            y: 0,
            w: 1,
            h: 1,
            static: true,
            isDraggable: false,
            isResizable: false,
          }}
          onClick={addNewWidget}
        >
          <CrossIcon
            className="icon-svg-add-item"
            style={{
              width: "20px",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      );

      const widgetChildren =
        widgets &&
        widgets.map((item) => {
          return (
            <div
              style={{
                justifyContent: item.alignment
                  ? styleAlignmentMap[item.alignment]
                  : "center",
                textAlign: item.alignment ? item.alignment : "center",
              }}
              id={item.id}
              key={item.id}
              data-align={item.alignment || "center"}
            >
              <div data-locked={isLocked} className="cancelDrag">
                <Widget
                  item={item}
                  updateWidgetContent={updateWidgetContent}
                  updateWidgetTextAlignment={updateWidgetTextAlignment}
                  onTooltipCreate={handleTooltipCreate}
                />
              </div>
              <span
                id="delete-widget"
                title="Delete Widget"
                onClick={() => deleteWidget(item.id)}
                className="cancelDrag"
              >
                <CrossIcon
                  className="icon-svg-cross"
                  style={{
                    width: "15px",
                  }}
                />
              </span>
            </div>
          );
        });

      return [newWidgetChild, widgetChildren];
    }, [
      isLocked,
      widgets,
      addNewWidget,
      deleteWidget,
      updateWidgetContent,
      updateWidgetTextAlignment,
      handleTooltipCreate,
    ]);

    const memoizedCols = useMemo(() => {
      return {
        lg: 24,
        md: 20,
        sm: 12,
        xs: columns ? columns : 8,
        xxs: 4,
      };
    }, [columns]);

    return (
      <ActiveToolbarContext.Provider value={activeToolbarKeyRef}>
        {isPending ? (
          <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          <>
            {layouts && (
              <ResponsiveReactGridLayout
                className="layout"
                cols={memoizedCols}
                rowHeight={30}
                layouts={layouts}
                onLayoutChange={onLayoutChange}
                isDraggable={isLocked ? false : true}
                isResizable={isLocked ? false : true}
                draggableCancel=".cancelDrag"
              >
                {memoizedChildren}
              </ResponsiveReactGridLayout>
            )}
            {openTooltip && widgets && (() => {
              const widget = widgets.find((w) => w.id === openTooltip.widgetId);
              const tooltipContent = widget?.tooltips?.[openTooltip.tooltipId] ?? "";
              return (
                <TooltipDialog
                  tooltipId={openTooltip.tooltipId}
                  content={tooltipContent}
                  onContentChange={(tooltipId, content) =>
                    updateTooltipContent(openTooltip.widgetId, tooltipId, content)
                  }
                  onClose={() => setOpenTooltip(null)}
                />
              );
            })()}
          </>
        )}
      </ActiveToolbarContext.Provider>
    );
  },
);

SyncingGrid.displayName = "SyncingGrid";

export default SyncingGrid;
