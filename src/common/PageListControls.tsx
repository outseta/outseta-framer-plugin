import { ListControls } from "@triozer/framer-toolbox";
import { usePageQuery } from "../pages";

export function PageListControls({
  title,
  value,
  required,
  onChange,
}: {
  title: string;
  value: string;
  required?: boolean;
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

  return (
    <ListControls
      title={title}
      items={items}
      value={value}
      required={required}
      onChange={onChange}
    />
  );
}
