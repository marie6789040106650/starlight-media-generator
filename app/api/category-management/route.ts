import { NextRequest, NextResponse } from 'next/server';
import { categoryManager } from '@/lib/category-manager';
import { generateRequestId } from '@/lib/business-utils';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    console.log(`[${requestId}] Category management GET request`);
    
    const stats = categoryManager.getCategoryStats();
    const allCategories = categoryManager.getAllCategories();
    
    return NextResponse.json({
      success: true,
      data: {
        categories: allCategories,
        stats
      }
    }, {
      headers: {
        'X-Request-ID': requestId
      }
    });
    
  } catch (error) {
    console.error(`[${requestId}] Category management error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取品类信息失败'
    }, {
      status: 500,
      headers: {
        'X-Request-ID': requestId
      }
    });
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    console.log(`[${requestId}] Category management POST request`);
    
    const body = await request.json();
    const { action, category, keywords } = body;
    
    let result: any = {};
    
    switch (action) {
      case 'add':
        if (!category) {
          return NextResponse.json({
            success: false,
            error: '品类名称不能为空'
          }, { status: 400 });
        }
        
        const added = categoryManager.manuallyAddCategory(category, keywords);
        result = {
          added,
          message: added ? `品类"${category}"添加成功` : `品类"${category}"已存在或添加失败`
        };
        break;
        
      case 'remove':
        if (!category) {
          return NextResponse.json({
            success: false,
            error: '品类名称不能为空'
          }, { status: 400 });
        }
        
        const removed = categoryManager.removeCustomCategory(category);
        result = {
          removed,
          message: removed ? `品类"${category}"删除成功` : `品类"${category}"不存在或删除失败`
        };
        break;
        
      case 'record':
        if (!category) {
          return NextResponse.json({
            success: false,
            error: '品类名称不能为空'
          }, { status: 400 });
        }
        
        result = categoryManager.recordCategoryUsage(category);
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: '不支持的操作类型'
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      data: result
    }, {
      headers: {
        'X-Request-ID': requestId
      }
    });
    
  } catch (error) {
    console.error(`[${requestId}] Category management POST error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '品类管理操作失败'
    }, {
      status: 500,
      headers: {
        'X-Request-ID': requestId
      }
    });
  }
}