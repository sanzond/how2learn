import React, { useState, useEffect } from 'react';
import { UserPlus, X, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [registerForm, setRegisterForm] = useState({
    account: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    captcha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');

  // 生成随机验证码
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    return result;
  };

  // 初始化验证码
  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
    }
  }, [isOpen]);

  // 关闭模态窗口并重置表单
  const handleClose = () => {
    setRegisterForm({ account: '', password: '', confirmPassword: '', securityQuestion: '', captcha: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  // 获取客户端公网IP地址
  const getPublicIP = async (): Promise<string> => {
    try {
      // 使用多个IP查询服务作为备选
      const ipServices = [
        'https://ipapi.co/json/',
        'https://api.ip.sb/jsonip'
      ];
      
      for (const service of ipServices) {
        try {
          const response = await fetch(service, {
            method: 'GET'
          });
          
          if (response.ok) {
            const data = await response.json();
            // 不同服务返回的IP字段名可能不同
            return data.ip || data.query || data.IPv4 || 'unknown';
          }
        } catch (error) {
          console.warn(`IP服务 ${service} 请求失败:`, error);
          continue;
        }
      }
      
      return 'unknown';
    } catch (error) {
      console.error('获取公网IP地址失败:', error);
      return 'unknown';
    }
  };

  // 处理注册表单提交
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 获取客户端公网IP地址
    console.log('正在获取客户端公网IP地址...');
    const publicIP = await getPublicIP();
    
    console.log('注册表单提交:', {
      account: registerForm.account,
      password: '***',
      confirmPassword: '***',
      securityQuestion: registerForm.securityQuestion,
      captcha: registerForm.captcha,
      expectedCaptcha: captchaCode,
      clientPublicIP: publicIP,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // 验证码校验
    if (registerForm.captcha.toLowerCase() !== captchaCode.toLowerCase()) {
      alert('验证码错误，请重新输入');
      generateCaptcha();
      setRegisterForm({ ...registerForm, captcha: '' });
      return;
    }
    
    // 密码长度校验
    if (registerForm.password.length < 6) {
      alert('密码长度不能少于6位');
      return;
    }
    
    // 密码确认校验
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('两次输入的密码不一致，请重新输入');
      return;
    }
    
    // 账号格式校验（手机号或用户名）
    const phoneRegex = /^1[3-9]\d{9}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!phoneRegex.test(registerForm.account) && !usernameRegex.test(registerForm.account)) {
      alert('请输入有效的手机号或用户名（用户名3-20位，只能包含字母、数字、下划线）');
      return;
    }
    
    console.log('注册验证通过，准备调用注册API');
    console.log(`客户端公网IP地址: ${publicIP}`);
    
    alert(`注册功能正在实现中...
客户端IP: ${publicIP}`);
    // 这里可以添加实际的注册逻辑
    // handleClose(); // 注册成功后关闭模态窗口
  };



  // 处理注册表单输入变化
  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterForm({ ...registerForm, [field]: value });
  };

  // 如果模态窗口未打开，不渲染任何内容
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* 模态窗口标题 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <UserPlus className="mr-2 text-green-600" size={24} />
            注册账号
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {/* 账号输入框（手机号或用户名） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手机号或用户名
            </label>
            <input
              type="text"
              value={registerForm.account}
              onChange={(e) => handleRegisterInputChange('account', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="请输入手机号或用户名"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              手机号格式：1xxxxxxxxx，用户名格式：3-20位字母数字下划线
            </p>
          </div>

          {/* 密码输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={registerForm.password}
                onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="请输入密码（至少6位）"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* 确认密码输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={registerForm.confirmPassword}
                onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="请再次输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* 找回密码问题输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              找回密码问题
            </label>
            <input
              type="text"
              value={registerForm.securityQuestion}
              onChange={(e) => handleRegisterInputChange('securityQuestion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="请设置找回密码问题（如：您的出生地是？）"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              用于找回密码时的身份验证，请设置一个只有您知道答案的问题
            </p>
          </div>

          {/* 验证码输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图形验证码
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={registerForm.captcha}
                onChange={(e) => handleRegisterInputChange('captcha', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="请输入验证码"
                maxLength={4}
                required
              />
              <div className="flex items-center space-x-1">
                <div className="bg-gray-100 px-3 py-2 rounded-lg border font-mono text-lg font-bold text-gray-700 min-w-[60px] text-center">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 text-gray-500 hover:text-gray-700 transition"
                  title="刷新验证码"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">防止机器人注册</p>
          </div>

          {/* 注册按钮 */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
          >
            注册账号
          </button>
        </form>

        {/* 其他选项 */}
        <div className="mt-6 text-sm text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 transition"
          >
            已有账号？登录
          </button>
        </div>

        {/* 开发提示 */}
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-xs text-yellow-700">
            💡 开发提示：当前为演示版本，所有功能均在开发中
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;