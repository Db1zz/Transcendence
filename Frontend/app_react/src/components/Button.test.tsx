import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Button } from "./Button";

describe("Button Component", () => {

  it("renders the button with provided text", () => {
    render(<Button text="Click Me" />);

    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });


  it("renders children when text prop is not provided", () => {
    render(
      <Button>
        <span>Icon</span> Send
      </Button>,
    );
    const buttonElement = screen.getByRole("button", { name: /icon send/i });
    expect(buttonElement).toBeInTheDocument();
  });


  it("fires the onClick callback when clicked", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button text="Submit" onClick={handleClick} />);

    const buttonElement = screen.getByRole("button", { name: /submit/i });

    await user.click(buttonElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button text="Submit" disabled={true} onClick={handleClick} />);

    const buttonElement = screen.getByRole("button", { name: /submit/i });

    expect(buttonElement).toBeDisabled();

    await user.click(buttonElement);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies custom className and colors correctly", () => {
    render(
      <Button text="Custom" color="bg-red-500" className="my-custom-class" />,
    );

    const buttonElement = screen.getByRole("button", { name: /custom/i });

    expect(buttonElement).toHaveClass("bg-red-500");
    expect(buttonElement).toHaveClass("my-custom-class");
  });
});
