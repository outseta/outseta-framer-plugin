import { useEffect, useRef } from "react";
import { ListControls } from "@triozer/framer-toolbox";
import { usePageQuery } from "../pages";

export function PageListControls({
  title,
  value,
  required,
  onBlur,
  onChange,
}: {
  title: string;
  value: string;
  required?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  onChange: (
    value: string,
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => void;
}) {
  const pageQuery = usePageQuery();
  const nonCollectionPages =
    pageQuery.data?.filter((page) => !page.collectionId) || [];

  const items = nonCollectionPages.map((page) => ({
    label: page.path === "/" ? "/Home" : page.path || "",
    value: page.path || "",
  }));

  useEffect(() => {
    // Auto-select first option if no value is set and items are available
    if (items.length > 0 && !value) {
      const firstValue = items[0].value;
      // Create a synthetic event object for the onChange handler
      const syntheticEvent = {
        target: { value: firstValue },
        currentTarget: { value: firstValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(firstValue, syntheticEvent);
    }
  }, [items, value, onChange]);

  return (
    <ListControls
      title={title}
      items={items}
      value={value}
      required={required}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
