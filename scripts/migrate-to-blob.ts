import fs from 'fs';
import path from 'path';
import { storeRadarDataToBlob } from '../lib/blob-storage';
import { getRadarConfigs } from '../lib/data';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 将所有雷达数据从public/data目录迁移到Vercel Blob
 */
async function migrateDataToBlob() {
  // 获取所有雷达配置
  const radarConfigs = getRadarConfigs();
  console.log(`找到 ${radarConfigs.length} 个雷达配置`);
  
  for (const config of radarConfigs) {
    console.log(`开始迁移雷达数据: ${config.id} (${config.name})`);
    
    try {
      // 读取blips和logs文件
      const blipsPath = path.join(process.cwd(), 'public', 'data', `${config.id}_blips.json`);
      const logsPath = path.join(process.cwd(), 'public', 'data', `${config.id}_logs.json`);
      
      // 检查文件是否存在
      if (!fs.existsSync(blipsPath) || !fs.existsSync(logsPath)) {
        console.warn(`警告: ${config.id} 的数据文件不存在，跳过`);
        continue;
      }
      
      // 读取文件内容
      const blipsData = JSON.parse(fs.readFileSync(blipsPath, 'utf-8'));
      const logsData = JSON.parse(fs.readFileSync(logsPath, 'utf-8'));
      
      // 存储到Vercel Blob
      const [blipsUrl, logsUrl] = await Promise.all([
        storeRadarDataToBlob(config.id, 'blips', blipsData),
        storeRadarDataToBlob(config.id, 'logs', logsData)
      ]);
      
      console.log(`成功将 ${config.id} 的数据迁移到Blob:`);
      console.log(`- Blips URL: ${blipsUrl}`);
      console.log(`- Logs URL: ${logsUrl}`);
    } catch (error) {
      console.error(`迁移 ${config.id} 数据时出错:`, error);
    }
  }
  
  console.log('迁移完成!');
}

// 执行迁移
migrateDataToBlob().catch(error => {
  console.error('迁移过程中出错:', error);
  process.exit(1);
}); 