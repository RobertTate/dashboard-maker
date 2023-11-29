import localforage from "localforage";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useMemo, useCallback } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import startingLayouts from "../partials/startingLayout";
import cross from "../assets/cross.svg";
import WidgetContainer from "./Widget";
import type {
  SyncingGridProps,
  WidgetProps,
  DashboardItemsProps,
} from "../types";
import isEqual from "lodash.isequal";

export default function SyncingGrid({
  dashName,
  isLocked,
  updateLockedStatus,
}: SyncingGridProps) {
  const ResponsiveReactGridLayout = useMemo(
    () => WidthProvider(Responsive),
    [],
  );

  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts | null>(null);
  const [widgets, setWidgets] = useState<WidgetProps[] | null>(null);
  const [syncStorage, setSyncStorage] = useState(0);

  useEffect(() => {
    const getSavedItems = async () => {
      const dashboardItems: DashboardItemsProps | null =
        await localforage.getItem(dashName);
      const savedLayouts = dashboardItems!?.layouts;
      const savedWidgets = dashboardItems!?.widgets;
      const savedLockStatus = dashboardItems!?.isLocked;

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
        };
        await localforage.setItem(dashName, newdashboardItems);
      }
    };
    updateLayouts();
  }, [syncStorage, isLocked]);

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
    const uniqueKey = uuidv4();

    const newWidget = {
      id: uniqueKey,
      content: "Edit",
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
      {layouts && (
        <ResponsiveReactGridLayout
          className="layout"
          cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
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
                    <WidgetContainer
                      item={item}
                      updateWidgetContent={updateWidgetContent}
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
  );
}
