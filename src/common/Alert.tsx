import classes from "./Alert.module.css";

export function Alert({
  element: Element = "p",
  children,
  level,
}: {
  element?: keyof HTMLElementTagNameMap;
  children: React.ReactNode;
  level: "warning" | "error" | "info";
}) {
  return (
    <Element className={`${classes.root} ${classes[level]}`}>
      {children}
    </Element>
  );
}
