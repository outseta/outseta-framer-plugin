import { ListControls } from "@triozer/framer-toolbox";
import { useEmbedMode } from "../app-state";

export function EmbedModeListControls({ disabled }: { disabled?: boolean }) {
  const { embedMode, setEmbedMode } = useEmbedMode();

  return (
    <ListControls
      title="Embed type"
      items={[
        { label: "As a pop-up", value: "popup" },
        { label: "On a page", value: "embed" },
      ]}
      value={embedMode}
      onChange={(value) => setEmbedMode(value)}
      disabled={disabled}
    />
  );
}
