export interface AppConfig {
  dataSource: 'local' | 'network';
  networkUrl: string;
  localPath: string;
}

export const config: AppConfig = {
  // 切换数据源：'local' 为本地加载，'network' 为网络加载
  dataSource: 'network',
  // 网络数据源地址 - 使用相对路径通过Vite代理访问
  networkUrl: '/api/learning/data',
  // 本地数据源路径
  localPath: './unified_learning_data.json'
};