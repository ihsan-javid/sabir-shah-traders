"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger"
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                variant === "danger" ? "bg-red-50 text-red-500" : "bg-primary/10 text-primary"
              }`}>
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  variant === "danger" 
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-glow-red" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary"
                }`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-all active:scale-95 border border-border"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
