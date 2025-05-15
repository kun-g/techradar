import { list, put, del } from '@vercel/blob';

console.log('BLOB_READ_WRITE_URL:', process.env.BLOB_READ_WRITE_URL);
/**
 * 将数据存储到Vercel Blob
 * @param radarId 雷达ID
 * @param type 数据类型 ('blips' | 'logs')
 * @param data 要存储的数据
 */
export async function storeRadarDataToBlob(radarId: string, type: 'blips' | 'logs', data: any) {
  try {
    const key = `${radarId}_${type}.json`;
    const dataString = JSON.stringify(data, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    
    // 存储到Vercel Blob
    const { url } = await put(key, blob, {
      access: 'public', // 公开访问
      allowOverwrite: true
    });
    
    console.log(`已将 ${radarId} 的 ${type} 数据存储到Blob: ${url}`);
    return url;
  } catch (error) {
    console.error(`存储 ${radarId} 的 ${type} 数据到Blob时出错:`, error);
    throw error;
  }
}

/**
 * 从Vercel Blob获取数据
 * @param radarId 雷达ID
 * @param type 数据类型 ('blips' | 'logs')
 */
export async function getRadarDataFromBlob(radarId: string, type: 'blips' | 'logs') {
  try {
    const key = `${radarId}_${type}.json`;
    const url = `${process.env.BLOB_READ_WRITE_URL || ''}/${key}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`获取 ${url} 失败: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`从Blob获取 ${radarId} 的 ${type} 数据时出错:`, error);
    throw error;
  }
}

/**
 * 从Vercel Blob获取数据URL
 * @param radarId 雷达ID
 * @param type 数据类型 ('blips' | 'logs')
 */
export async function getRadarDataBlobUrl(radarId: string, type: 'blips' | 'logs') {
  const key = `${radarId}_${type}.json`;
  // Blob URL格式: ${BLOB_READ_WRITE_URL}/${key}
  return `${process.env.BLOB_READ_WRITE_URL || ''}/${key}`;
}

/**
 * 删除Vercel Blob中的数据
 * @param radarId 雷达ID
 * @param type 数据类型 ('blips' | 'logs')
 */
export async function deleteRadarDataFromBlob(radarId: string, type: 'blips' | 'logs') {
  try {
    const key = `${radarId}_${type}.json`;
    await del(key);
    console.log(`已删除 ${radarId} 的 ${type} 数据`);
    return true;
  } catch (error) {
    console.error(`删除 ${radarId} 的 ${type} 数据时出错:`, error);
    throw error;
  }
}

/**
 * 列出所有存储的Blob
 */
export async function listRadarDataBlobs() {
  try {
    const { blobs } = await list();
    return blobs;
  } catch (error) {
    console.error('列出Blob数据时出错:', error);
    throw error;
  }
} 