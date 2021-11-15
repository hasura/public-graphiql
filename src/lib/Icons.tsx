import React from "react";

const IconChevronRight = () => (
  <svg
    style={{ display: "inline", marginRight: "0.25rem", height: "0.75rem" }}
    width="16"
    height="16"
    viewBox="0 0 192 512"
  >
    <path
      fillRule="evenodd"
      d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"
    />
  </svg>
);

const IconChevronDown = () => (
  <svg
    style={{ display: "inline", marginRight: "0.25rem", height: "0.75rem" }}
    width="16"
    height="16"
    viewBox="0 0 320 512"
  >
    <path
      fillRule="evenodd"
      d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
    />
  </svg>
);

const IconCross = () => (
  <svg
    style={{ display: "inline", height: "0.75rem" }}
    width="12"
    height="12"
    viewBox="0 0 352 512"
  >
    <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" />
  </svg>
);

export { IconChevronDown, IconChevronRight, IconCross };
