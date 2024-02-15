import React, {useEffect, useState} from "react";
import { useLocation } from "react-router-dom";

function AlertMessage() {
  const location = useLocation();
  const qp = new URLSearchParams(location.search);
  const message = qp.get("message");
  const [visible, setVisible] = useState(!!message); // Check if message exists

  useEffect(() => {
    let timeoutId;
    if (visible) {
      // Set timeout to hide the message after 10 seconds
      timeoutId = setTimeout(() => {
        setVisible(false);
      }, 10000); // 10 seconds in milliseconds
    }

    return () => {
      clearTimeout(timeoutId); // Clear the timeout on component unmount
    };
  }, [visible])

  return;
  <div>
    {message && (
      <div className="alert alert-info text-danger" role="alert">
        {message}
      </div>
    )}
  </div>;
}

export default AlertMessage;
