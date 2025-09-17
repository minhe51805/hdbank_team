import React, { useEffect, useState } from 'react';
import './PlanUpdateNotification.css';

interface PlanUpdateNotificationProps {
  show: boolean;
  onClose: () => void;
  message?: string;
}

const PlanUpdateNotification: React.FC<PlanUpdateNotificationProps> = ({ 
  show, 
  onClose, 
  message = "✅ Kế hoạch đã được cập nhật!" 
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="plan-update-notification">
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default PlanUpdateNotification;