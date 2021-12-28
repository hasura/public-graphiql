import * as React from "react";

export default function Notification({
  message,
  title,
  info = false,
  onDismiss = () => null,
}: {
  message: string;
  title: string;
  info?: boolean;
  onDismiss?: VoidFunction;
}) {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;
  return (
    <div
      className={`hasura-graphiql-notifications-wrapper ${
        info ? "hasura-graphiql-notification-info" : ""
      }`}
    >
      <div className="hasura-graphiql-notification-tr">
        <div className="hasura-graphiql-notification-inner">
          <h4 className="hasura-graphiql-notification-title">{title}</h4>
          <div className="hasura-graphiql-notification-message">{message}</div>
          <span
            className="hasura-graphiql-notification-dismiss"
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
          >
            ×
          </span>
        </div>
      </div>
    </div>
  );
}
