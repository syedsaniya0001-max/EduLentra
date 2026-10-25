import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

describe("College not found page", () => {
  afterEach(() => cleanup());

  it("explains an unmatched route and provides valid home and portal links", () => {
    render(
      <MemoryRouter initialEntries={["/missing-page"]}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Page not found" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "Go to home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Choose a portal" }).getAttribute("href")).toBe("/role");
  });
});
