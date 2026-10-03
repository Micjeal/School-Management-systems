import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SchoolSwitcher } from "@/components/layout/school-switcher";

vi.mock("next/navigation", () => ({ usePathname: () => "/app/students" }));

const SCHOOL_A = "11111111-1111-4111-8111-111111111111";
const SCHOOL_B = "22222222-2222-4222-8222-222222222222";
const SCHOOLS = [
  { school_id: SCHOOL_A, school_name: "Acceptance School", school_slug: "acceptance", school_code: "ACC", school_status: "active", subscription_status: "trial" },
  { school_id: SCHOOL_B, school_name: "Kampala High School", school_slug: "kampala-high", school_code: "KHS", school_status: "active", subscription_status: "trial" }
];

function renderSwitcher(action = vi.fn()) {
  render(<SchoolSwitcher activeSchoolId={SCHOOL_A} schools={SCHOOLS} isPlatformAdmin={false} action={action} />);
  return action;
}

describe("SchoolSwitcher", () => {
  afterEach(() => cleanup());
  it("opens a searchable popover and marks the active school", () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Active school" }));
    expect(screen.getByRole("textbox", { name: "Search schools" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Acceptance School/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("Selected")).toBeInTheDocument();
  });

  it("filters case-insensitively by school name, code, and short name", () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Active school" }));
    const search = screen.getByRole("textbox", { name: "Search schools" });
    fireEvent.change(search, { target: { value: "kHs" } });
    expect(screen.getByRole("option", { name: /Kampala High School/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Acceptance School/ })).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: "ACCEPTANCE" } });
    expect(screen.getByRole("option", { name: /Acceptance School/ })).toBeInTheDocument();
  });

  it("shows an empty state when search has no matches", () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Active school" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Search schools" }), { target: { value: "missing" } });
    expect(screen.getByText("No schools found.")).toBeInTheDocument();
  });

  it("submits the selected school using the canonical form action", async () => {
    const action = renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Active school" }));
    fireEvent.click(screen.getByRole("option", { name: /Kampala High School/ }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const submitted = action.mock.calls[0]![0] as FormData;
    expect(submitted.get("school_id")).toBe(SCHOOL_B);
    expect(submitted.get("return_to")).toBe("/app/students");
  });

  it("supports arrow keys, Enter, and Escape", async () => {
    const action = renderSwitcher();
    const trigger = screen.getByRole("button", { name: "Active school" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const search = screen.getByRole("textbox", { name: "Search schools" });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "Enter" });
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect((action.mock.calls[0]![0] as FormData).get("school_id")).toBe(SCHOOL_B);
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Search schools" }), { key: "Escape" });
    expect(screen.queryByRole("textbox", { name: "Search schools" })).not.toBeInTheDocument();
  });

  it("cannot display schools that were not supplied by the server-authorized list", () => {
    render(<SchoolSwitcher activeSchoolId={SCHOOL_A} schools={[SCHOOLS[0]!]} isPlatformAdmin={false} action={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Active school" }));
    expect(screen.queryByRole("option", { name: /Kampala High School/ })).not.toBeInTheDocument();
  });
});
