import { useEffect, useMemo, useRef } from "react";
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

  const items = useMemo(() => {
    const nonCollectionPages =
      pageQuery.data?.filter((page) => !page.collectionId) || [];
    return nonCollectionPages.map((page) => ({
      label: page.path === "/" ? "/Home" : page.path || "",
      value: page.path || "",
    }));
  }, [pageQuery.data]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // Auto-select first option if no value is set and items are available
    if (items.length > 0 && !value) {
      const firstValue = items[0].value;
      // Create a synthetic event object for the onChange handler
      const syntheticEvent = {
        target: { value: firstValue },
        currentTarget: { value: firstValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChangeRef.current(firstValue, syntheticEvent);
    }
  }, [items, value]);

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
