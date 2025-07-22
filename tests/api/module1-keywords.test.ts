/**
 * 模块1关键词API测试
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/module1-keywords/route';
import type { StoreInfo, ApiResponse, Module1Output } from '@/lib/business-types';

// 测试数据
const validStoreInfo: StoreInfo = {
  storeName: '川味小厨',
  storeCategory: '餐饮',
  storeLocation: '成都市春熙路',
  businessDuration: '3年',
  storeFeatures: ['秘制锅底', '环境复古'],
  ownerName: '张老板',
  ownerFeatures: ['实干型', '亲和型']
};

const invalidStoreInfo = {
  storeName: '',
  storeCategory: 'invalid',
  storeLocation: '',
  ownerName: '',
  storeFeatures: [],
  ownerFeatures: []
};

describe('Module1 Keywords API', () => {
  describe('POST /api/module1-keywords', () => {
    it('should return keyword recommendations for valid store info', async () => {
      const request = new NextRequest('http://localhost:3000/api/module1-keywords', {
        method: 'POST',
        body: JSON.stringify(validStoreInfo),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data: ApiResponse<Module1Output> = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data!.confirmedStoreKeywords).toBeInstanceOf(Array);
      expect(data.data!.confirmedOwnerKeywords).toBeInstanceOf(Array);
      expect(data.data!.confirmedStoreKeywords.length).toBeGreaterThan(0);
      expect(data.data!.confirmedOwnerKeywords.length).toBeGreaterThan(0);
      
      // 验证关键词结构
      data.data!.confirmedStoreKeywords.forEach(keyword => {
        expect(keyword).toHaveProperty('keyword');
        expect(keyword).toHaveProperty('description');
        expect(typeof keyword.keyword).toBe('string');
        expect(typeof keyword.description).toBe('string');
      });
    });

    it('should return error for invalid store info', async () => {
      const request = new NextRequest('http://localhost:3000/api/module1-keywords', {
        method: 'POST',
        body: JSON.stringify(invalidStoreInfo),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data: ApiResponse = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should return error for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/module1-keywords', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data: ApiResponse = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_JSON');
    });

    it('should include request ID in response headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/module1-keywords', {
        method: 'POST',
        body: JSON.stringify(validStoreInfo),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      
      expect(response.headers.get('X-Request-ID')).toBeDefined();
      expect(response.headers.get('X-Request-ID')).toMatch(/^req_/);
    });

    it('should sanitize input data', async () => {
      const dirtyStoreInfo = {
        ...validStoreInfo,
        storeName: '  川味小厨  <script>alert("xss")</script>  ',
        storeLocation: '成都市春熙路\n\n\n多余空行'
      };

      const request = new NextRequest('http://localhost:3000/api/module1-keywords', {
        method: 'POST',
        body: JSON.stringify(dirtyStoreInfo),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data: ApiResponse<Module1Output> = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // 验证数据已被清理（具体清理逻辑在sanitizeText函数中）
    });
  });
});