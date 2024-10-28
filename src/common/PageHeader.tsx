import { Link } from "@tanstack/react-router";
import { framer } from "framer-plugin";

import { ArrowLeftIcon } from "../common";

import classes from "./PageHeader.module.css";
import { useSingleOutsetaEmbedSelection } from "../app-state";

export function PageHeader({
  title,
}: {
  title: string;
  disableBackButton?: boolean;
}) {
  const singleEmbedSelection = useSingleOutsetaEmbedSelection();
  return (
    <header className={classes.header}>
      <Link
        to="/"
        aria-label="Back"
        onClick={() => {
          singleEmbedSelection && framer.setSelection([]);
        }}
      >
        <ArrowLeftIcon />
        <span>Back</span>
      </Link>

      <h2>{title}</h2>
    </header>
  );
}
