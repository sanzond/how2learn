import React, { useState, useEffect } from 'react';
import { KeyRound, X, ArrowLeft } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    account: '',
    securityQuestion: ''
  });
  const [step, setStep] = useState<'input' | 'success'>('input');

  // 关闭模态窗口并重置表单
  const handleClose = () => {
    setForgotPasswordForm({ account: '', securityQuestion: '' });
    setStep('input');
    onClose();
  };

  // 处理找回密码表单提交
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证所有字段
    if (!forgotPasswordForm.account || !forgotPasswordForm.securityQuestion) {
      alert('请填写完整的找回密码信息');
      return;
    }

    // 验证账号格式（手机号或用户名）
    const phoneRegex = /^1[3-9]\d{9}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!phoneRegex.test(forgotPasswordForm.account) && !usernameRegex.test(forgotPasswordForm.account)) {
      alert('请输入正确的手机号或用户名格式');
      return;
    }

    console.log('找回密码表单提交:', {
      account: forgotPasswordForm.account,
      securityQuestion: forgotPasswordForm.securityQuestion,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // 模拟验证找回密码问题
    console.log('正在验证找回密码问题...');
    
    // 这里应该调用后端API验证账号和找回密码问题是否匹配
    // 目前模拟验证成功
    setTimeout(() => {
      console.log('找回密码问题验证通过');
      setStep('success');
    }, 1000);
  };

  // 处理表单输入变化
  const handleInputChange = (field: string, value: string) => {
    setForgotPasswordForm({ ...forgotPasswordForm, [field]: value });
  };

  // 返回登录界面
  const handleBackToLogin = () => {
    handleClose();
    onSwitchToLogin();
  };

  // 重置密码（目前仅打印开发中）
  const handleResetPassword = () => {
    console.log('重置密码功能被触发');
    console.log('准备为账号重置密码:', forgotPasswordForm.account);
    alert('重置密码功能开发中...\n验证成功，可以重置密码！');
    
    // 这里以后可以跳转到重置密码页面或者发送重置邮件/短信
    // 目前先关闭模态窗口
    handleClose();
  };

  // 如果模态窗口未打开，不渲染任何内容
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* 模态窗口标题 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <KeyRound className="mr-2 text-orange-600" size={24} />
            找回密码
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'input' && (
          <>
            {/* 找回密码表单 */}
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              {/* 账号输入框（手机号或用户名） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名或手机号
                </label>
                <input
                  type="text"
                  value={forgotPasswordForm.account}
                  onChange={(e) => handleInputChange('account', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入注册时的用户名或手机号"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  请输入您注册时使用的用户名或手机号
                </p>
              </div>

              {/* 找回密码问题输入框 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  找回密码问题答案
                </label>
                <input
                  type="text"
                  value={forgotPasswordForm.securityQuestion}
                  onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入您设置的找回密码问题的答案"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  请输入您注册时设置的找回密码问题的答案
                </p>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition font-medium"
              >
                验证信息
              </button>
            </form>

            {/* 其他选项 */}
            <div className="mt-6 flex justify-center text-sm">
              <button
                onClick={handleBackToLogin}
                className="flex items-center text-blue-600 hover:text-blue-800 transition"
              >
                <ArrowLeft size={16} className="mr-1" />
                返回登录
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            {/* 验证成功界面 */}
            <div className="text-center">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">验证成功！</h3>
              <p className="text-gray-600 mb-6">
                您的身份验证已通过，现在可以重置密码了。
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  重置密码
                </button>
                
                <button
                  onClick={handleBackToLogin}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  返回登录
                </button>
              </div>
            </div>
          </>
        )}

        {/* 开发提示 */}
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-xs text-yellow-700">
            💡 开发提示：当前为演示版本，实际应用中需要与后端API集成验证
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;