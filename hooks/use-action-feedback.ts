"use client";

import { useState, useCallback } from "react";

export interface ActionFeedback {
  type: "success" | "error" | null;
  message: string | null;
}

/**
 * useActionFeedback — lightweight state manager for server action responses.
 *
 * Problem it solves: admin list components manually tracked toast/notification
 * state with multiple `useState` calls and inline alert() calls. This hook
 * provides a consistent API for surfacing success and error feedback from
 * any server action.
 *
 * Usage:
 *   const { feedback, setSuccess, setError, clearFeedback } = useActionFeedback();
 *
 *   // After a server action resolves:
 *   const res = await someAction(id);
 *   if (res.success) setSuccess(res.message ?? "Done");
 *   else setError(res.message ?? "Something went wrong.");
 *
 *   // Render:
 *   {feedback && <FormBanner status={feedback.type} message={feedback.message} />}
 */
export function useActionFeedback(autoDismissMs?: number) {
  const [feedback, setFeedback] = useState<ActionFeedback>({
    type: null,
    message: null,
  });

  const dismiss = useCallback(() => {
    setFeedback({ type: null, message: null });
  }, []);

  const setSuccess = useCallback(
    (message: string) => {
      setFeedback({ type: "success", message });
      if (autoDismissMs) setTimeout(dismiss, autoDismissMs);
    },
    [autoDismissMs, dismiss],
  );

  const setError = useCallback(
    (message: string) => {
      setFeedback({ type: "error", message });
      if (autoDismissMs) setTimeout(dismiss, autoDismissMs);
    },
    [autoDismissMs, dismiss],
  );

  return { feedback, setSuccess, setError, clearFeedback: dismiss };
}
