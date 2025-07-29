'use client';

/**
 * 业务流程演示页面
 * 展示完整的老板IP打造方案生成流程
 */

import BusinessProcessDemo from '../../components/business/BusinessProcessDemo';

export default function BusinessDemoPage() {
  return (
    <main className="min-h-screen">
      <BusinessProcessDemo
        initialStoreInfo={{
          storeName: '',
          storeCategory: '',
          storeLocation: '',
          ownerName: ''
        }}
        onComplete={(data) => {
          console.log('业务流程完成:', data);
          // 可以在这里处理完成后的逻辑，比如保存数据、跳转页面等
        }}
      />
    </main>
  );
}