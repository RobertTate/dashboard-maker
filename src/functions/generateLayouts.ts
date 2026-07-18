type Breakpoint = "lg" | "md" | "sm" | "xs" | "xxs";

export const generateLayouts = (myDashboards: string[]) => {
  const items = myDashboards.length;
  const columnsPerBrkPnt = { lg: 3, md: 3, sm: 3, xs: 3, xxs: 2 };

  const times = [...Array(items)];
  const widths: Record<Breakpoint, number> = {
    lg: 1,
    md: 1,
    sm: 1,
    xs: 1,
    xxs: 1,
  };

  const layouts = (
    Object.keys(widths) as Breakpoint[]
  ).reduce<ReactGridLayout.Layouts>((memo, breakpoint) => {
    const width = widths[breakpoint];
    const cols = columnsPerBrkPnt[breakpoint];
    let row = 0;

    memo[breakpoint] = [
      ...times.map((_, i) => {
        const gridItem: ReactGridLayout.Layout = {
          x: (i * width) % cols,
          y: row,
          w: width,
          h: 1,
          // Layout entries are keyed by item name so they stay attached to
          // the right tile as items are added/removed (grid children use
          // the same names as React keys).
          i: myDashboards[i],
          isBounded: true,
        };

        if ((i + 1) % cols === 0) {
          row += 1;
        }

        return gridItem;
      }),
    ];
    return memo;
  }, {} as ReactGridLayout.Layouts);

  return layouts;
};
