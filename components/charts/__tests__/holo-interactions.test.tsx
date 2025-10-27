import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Holo } from "../pie";
import { Datum } from "../core/types";

describe("Holo interactions", () => {
  test("hover and click handlers are invoked", () => {
    const onHover = jest.fn();
    const onClick = jest.fn();
    render(
      <Holo
        data={[
          { label: "BTC", value: 60 },
          { label: "ETH", value: 40 },
        ]}
        onSliceHover={(_: Datum, i: number) => onHover(i)}
        onSliceClick={(_: Datum, i: number) => onClick(i)}
        animate={false}
      />
    );
    // Slices are <g> elements without role; target the path elements
    // NOTE: We query the first slice group by data attribute to simulate events
    const gNodes = document.querySelectorAll('g[data-idx="0"]');
    const g0 = gNodes[0] as SVGGElement;
    fireEvent.mouseEnter(g0);
    fireEvent.mouseMove(g0);
    fireEvent.click(g0);
    expect(onHover).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
  });
});


