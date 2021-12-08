import * as React from "react";

export default function ErrorNotification({
  message,
}: {
  message: string;
}) {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;
  return (
    <div className="hasura-graphiql-notifications-wrapper">
      <div className="hasura-graphiql-notification-tr">
        <div className="hasura-graphiql-notification-inner">
          <h4 className="hasura-graphiql-notification-title">
            Schema Introspection Error
          </h4>
          <div className="hasura-graphiql-notification-message">{message}</div>
          <span
            className="hasura-graphiql-notification-dismiss"
            onClick={() => setVisible(false)}
          >
            ×
          </span>
        </div>
      </div>
    </div>
  );
}
