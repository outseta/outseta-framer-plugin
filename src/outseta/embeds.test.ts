import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CanvasNode } from "framer-plugin";
import { OUTSETA_EMBED_URL, upsertAuthEmbed } from "./embeds";

const mockIsAllowedTo = vi.fn((_method: unknown) => true);
const mockAddComponentInstance = vi.fn();

vi.mock("framer-plugin", () => ({
  framer: {
    isAllowedTo: (method: unknown) => mockIsAllowedTo(method),
    addComponentInstance: (...args: unknown[]) =>
      mockAddComponentInstance(...args),
  },
}));

describe("embed permission guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAllowedTo.mockReturnValue(true);
  });

  it("checks permission before adding an embed", async () => {
    await upsertAuthEmbed({ widgetMode: "login" }, null);

    expect(mockIsAllowedTo).toHaveBeenCalledWith("addComponentInstance");
    expect(mockAddComponentInstance).toHaveBeenCalledWith({
      url: OUTSETA_EMBED_URL,
      attributes: {
        controls: expect.objectContaining({
          widget: "auth",
          widgetMode: "login",
        }),
      },
    });
  });

  it("does not add an embed without permission", async () => {
    mockIsAllowedTo.mockReturnValue(false);

    await expect(
      upsertAuthEmbed({ widgetMode: "login" }, null),
    ).rejects.toThrow("You don't have permission to add component embeds");
    expect(mockAddComponentInstance).not.toHaveBeenCalled();
  });

  it("checks permission before updating an embed", async () => {
    const setAttributes = vi.fn();
    const component = { setAttributes } as unknown as CanvasNode;

    await upsertAuthEmbed({ widgetMode: "register" }, component);

    expect(mockIsAllowedTo).toHaveBeenCalledWith("Node.setAttributes");
    expect(setAttributes).toHaveBeenCalledWith({
      controls: expect.objectContaining({
        widget: "auth",
        widgetMode: "register",
      }),
    });
  });
});
