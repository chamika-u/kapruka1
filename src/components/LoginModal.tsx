"use client";

import React, { useState } from "react";
import { X, Mail, User, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import styles from "./LoginModal.module.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) return;
    
    setIsLoading(true);
    // Use the name for login if sign up, otherwise derive from email
    const displayName = isSignUp ? name : email.split("@")[0];
    await login(email, displayName);
    setIsLoading(false);
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        
        <div className={styles.header}>
          <h2 className={styles.title}>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p className={styles.subtitle}>
            {isSignUp ? "Sign up to start shopping with Kapruka." : "Sign in to access your cart and history."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignUp && (
            <div className={styles.inputGroup}>
              <User size={16} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Full Name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email Address"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock size={16} className={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <div className={styles.loadingDots}>
                <span></span><span></span><span></span>
              </div>
            ) : (
              <>
                {isSignUp ? "Sign Up" : "Log In"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className={styles.toggleBtn}
              onClick={() => setIsSignUp(!isSignUp)}
              type="button"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
