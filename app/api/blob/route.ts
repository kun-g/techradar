import { NextRequest, NextResponse } from 'next/server';
import { 
  storeRadarDataToBlob, 
  getRadarDataFromBlob, 
  listRadarDataBlobs,
  deleteRadarDataFromBlob
} from '@/lib/blob-storage';

/**
 * PUT /api/blob - 上传数据到Blob存储
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { radarId, type } = data;
    
    if (!radarId || !type || !['blips', 'logs'].includes(type)) {
      return NextResponse.json(
        { error: '无效的请求参数，需要提供radarId和type(blips或logs)' }, 
        { status: 400 }
      );
    }
    
    const url = await storeRadarDataToBlob(radarId, type as 'blips' | 'logs', data.content);
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('上传到Blob时出错:', error);
    return NextResponse.json(
      { error: error.message || '上传到Blob时出错' }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/blob - 获取Blob存储数据
 * 
 * 查询参数:
 * - radarId: 雷达ID
 * - type: 数据类型 (blips或logs)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const radarId = url.searchParams.get('radarId');
    const type = url.searchParams.get('type');
    const list = url.searchParams.get('list') === 'true';
    
    // 如果指定了list=true，则列出所有Blob
    if (list) {
      const blobs = await listRadarDataBlobs();
      return NextResponse.json({ blobs });
    }
    
    // 否则获取特定的Blob数据
    if (!radarId || !type || !['blips', 'logs'].includes(type)) {
      return NextResponse.json(
        { error: '无效的请求参数，需要提供radarId和type(blips或logs)' }, 
        { status: 400 }
      );
    }
    
    const data = await getRadarDataFromBlob(radarId, type as 'blips' | 'logs');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('从Blob获取数据时出错:', error);
    return NextResponse.json(
      { error: error.message || '从Blob获取数据时出错' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blob - 删除Blob存储数据
 * 
 * 查询参数:
 * - radarId: 雷达ID
 * - type: 数据类型 (blips或logs)
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const radarId = url.searchParams.get('radarId');
    const type = url.searchParams.get('type');
    
    if (!radarId || !type || !['blips', 'logs'].includes(type)) {
      return NextResponse.json(
        { error: '无效的请求参数，需要提供radarId和type(blips或logs)' }, 
        { status: 400 }
      );
    }
    
    await deleteRadarDataFromBlob(radarId, type as 'blips' | 'logs');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除Blob数据时出错:', error);
    return NextResponse.json(
      { error: error.message || '删除Blob数据时出错' }, 
      { status: 500 }
    );
  }
} 