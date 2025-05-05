"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { LockIcon, LogOutIcon } from "lucide-react";

export function AdminAuthDialog() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { isAdmin, setAdminStatus, logout } = useAuth();

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      setError(false);
      
      // 调用API验证密钥
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 验证成功，设置管理员状态
        setAdminStatus(true);
        setKey("");
        setOpen(false);
      } else {
        // 验证失败
        setError(true);
      }
    } catch (error) {
      console.error('验证管理员密钥时出错:', error);
      setError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isAdmin) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        title="退出管理员模式"
      >
        <LogOutIcon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="管理员模式"
      >
        <LockIcon className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>管理员验证</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="请输入管理员密钥"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError(false);
              }}
              className={error ? "border-red-500" : ""}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isVerifying) {
                  handleVerify();
                }
              }}
              disabled={isVerifying}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">密钥不正确</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline" disabled={isVerifying}>
              取消
            </Button>
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying ? "验证中..." : "验证"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 