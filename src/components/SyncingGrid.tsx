import isEqual from "lodash.isequal";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

import cross from "../assets/cross.svg";
import db from "../dbInstance";
import startingLayouts from "../partials/startingLayout";
import type {
  DashboardItemsProps,
  SyncingGridProps,
  WidgetProps,
} from "../types";
import randomUUID from "../uid";
import Widget from "./Widget";

export default function SyncingGrid({
  dashName,
  isLocked,
  columns,
  updateLockedStatus,
  updateColsStatus
}: SyncingGridProps) {
  const ResponsiveReactGridLayout = useMemo(
    () => WidthProvider(Responsive),
    [],
  );

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts | null>(null);
  const [widgets, setWidgets] = useState<WidgetProps[] | null>(null);
  const [syncStorage, setSyncStorage] = useState(0);
  const [activeToolbarKey, setActiveToolbarKey] = useState<string>("");

  useEffect(() => {
    const getSavedItems = async () => {
      const dashboardItems: DashboardItemsProps | null =
        await db.getItem(dashName);
      const savedLayouts = dashboardItems?.layouts;
      const savedWidgets = dashboardItems?.widgets;
      const savedLockStatus = dashboardItems?.isLocked;
      const savedColumns = dashboardItems?.columns;
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

        setLoading(false);
      });
    };
    getSavedItems();
  }, []);

  useEffect(() => {
    const updateLayouts = async () => {
      if (layouts && widgets) {
        const newdashboardItems: DashboardItemsProps = {
          layouts: layouts,
          widgets: widgets,
          isLocked,
          columns
        };
        await db.setItem(dashName, newdashboardItems);
      }
    };
    updateLayouts();
  }, [syncStorage, isLocked, columns]);

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
    [],
  );

  const addNewWidget = () => {
    const uniqueKey = randomUUID();

    const newWidget = {
      id: uniqueKey,
      content: "✏️",
    };

    const newWidgetsArray = [...(widgets ? widgets : []), newWidget];

    setWidgets((prevWidgets) => {
      return isEqual(prevWidgets, newWidgetsArray)
        ? prevWidgets
        : newWidgetsArray;
    });
    setSyncStorage((prev) => prev + 1);
  };

  const deleteWidget = (selectedWidgetId: string) => {
    const newWidgetsArray = widgets!.filter((widget) => {
      return widget.id !== selectedWidgetId;
    });
    setWidgets([...newWidgetsArray]);
    setSyncStorage((prev) => prev + 1);
  };

  const updateWidgetContent = (item: WidgetProps, content: string) => {
    const updatedWidgetsArray = widgets!.map((widget) => {
      if (widget.id === item.id) {
        widget.content = content;
      }
      return widget;
    });
    setWidgets([...updatedWidgetsArray]);
    setSyncStorage((prev) => prev + 1);
  };

  return (
    <>
      {loading && isPending ? (
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
              cols={{ lg: 24, md: 20, sm: 12, xs: (columns ? columns : 8), xxs: 4 }}
              rowHeight={30}
              layouts={layouts}
              onLayoutChange={onLayoutChange}
              isDraggable={isLocked ? false : true}
              isResizable={isLocked ? false : true}
              draggableCancel=".cancelDrag"
            >
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
                <img src={cross} alt="Add Widget" />
              </div>
              {widgets &&
                widgets.map((item) => {
                  return (
                    <div key={item.id}>
                      <div className="cancelDrag">
                        <Widget
                          item={item}
                          updateWidgetContent={updateWidgetContent}
                          activeToolbarKey={activeToolbarKey}
                          setActiveToolbarKey={setActiveToolbarKey}
                        />
                      </div>
                      <span
                        id="delete-widget"
                        title="Delete Widget"
                        onClick={() => deleteWidget(item.id)}
                        className="cancelDrag"
                      >
                        <img src={cross} alt="" />
                      </span>
                    </div>
                  );
                })}
            </ResponsiveReactGridLayout>
          )}
        </>
      )}
    </>
  );
}
