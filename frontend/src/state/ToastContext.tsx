import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";
import type { SlideProps } from "@mui/material/Slide";

export type ToastSeverity = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, severity?: ToastSeverity, duration?: number) => void;
}

const DEFAULT_DURATIONS: Record<ToastSeverity, number> = {
  success: 3000,
  info: 3000,
  warning: 5000,
  error: 5000
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {}
});

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Toast | null>(null);
  const [open, setOpen] = useState(false);
  const queueRef = useRef<Toast[]>([]);
  const nextIdRef = useRef(0);

  const processQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setCurrent(next);
      setOpen(true);
    }
  }, []);

  const showToast = useCallback(
    (message: string, severity: ToastSeverity = "info", duration?: number) => {
      const toast: Toast = {
        id: nextIdRef.current++,
        message,
        severity,
        duration: duration ?? DEFAULT_DURATIONS[severity]
      };

      if (open) {
        queueRef.current.push(toast);
        setOpen(false);
      } else {
        setCurrent(toast);
        setOpen(true);
      }
    },
    [open]
  );

  function handleClose(_?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  }

  function handleExited() {
    processQueue();
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        key={current?.id}
        open={open}
        autoHideDuration={current?.duration ?? 3000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity={current?.severity ?? "info"} variant="filled" sx={{ width: "100%" }}>
          {current?.message ?? ""}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
