"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { initPreventCopy, cleanupProtection } from "@/utils/prevent-copy"
import { updateCopySettingsByRoute } from "@/config/copy-settings"

export function CopyPreventionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // 根据当前路由更新复制设置
    console.log('🎯 当前路由:', pathname);
    if (pathname) {
      updateCopySettingsByRoute(pathname);
    }
    
    // 初始化全面内容保护系统
    console.log('🚀 启动路由感知的内容保护系统');
    initPreventCopy();

    // 清理函数
    return () => {
      cleanupProtection();
    };
  }, [pathname]); // 当路由变化时重新初始化

  return <>{children}</>;
}