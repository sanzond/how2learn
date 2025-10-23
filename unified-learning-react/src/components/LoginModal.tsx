import React, { useState, useEffect } from 'react';
import { User, X, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    captcha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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
    setLoginForm({ username: '', password: '', captcha: '' });
    setShowPassword(false);
    onClose();
  };

  // 处理登录表单提交
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('登录表单提交:', {
      username: loginForm.username,
      password: '***',
      captcha: loginForm.captcha,
      expectedCaptcha: captchaCode
    });
    
    if (loginForm.captcha.toLowerCase() !== captchaCode.toLowerCase()) {
      alert('验证码错误，请重新输入');
      generateCaptcha();
      setLoginForm({ ...loginForm, captcha: '' });
      return;
    }
    
    alert('登录功能开发中...');
    console.log('登录验证通过，准备调用登录API');
    // 这里可以添加实际的登录逻辑
    // handleClose(); // 登录成功后关闭模态窗口
  };

  // 处理找回密码按钮
  const handleForgotPassword = () => {
    console.log('找回密码按钮被点击 - 切换到找回密码界面');
    onSwitchToForgotPassword();
  };

  // 处理登录表单输入变化
  const handleLoginInputChange = (field: string, value: string) => {
    setLoginForm({ ...loginForm, [field]: value });
  };

  // 如果模态窗口未打开，不渲染任何内容
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* 模态窗口标题 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <User className="mr-2 text-blue-600" size={24} />
            用户登录
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* 用户名输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => handleLoginInputChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入用户名"
              required
            />
          </div>

          {/* 密码输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginForm.password}
                onChange={(e) => handleLoginInputChange('password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入密码"
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

          {/* 验证码输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              验证码
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={loginForm.captcha}
                onChange={(e) => handleLoginInputChange('captcha', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            登录
          </button>
        </form>

        {/* 其他选项 */}
        <div className="mt-6 flex justify-between text-sm">
          <button
            onClick={onSwitchToRegister}
            className="text-green-600 hover:text-green-800 transition"
          >
            注册账号
          </button>
          <button
            onClick={handleForgotPassword}
            className="text-blue-600 hover:text-blue-800 transition"
          >
            找回密码
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

export default LoginModal;