import React, { useState } from 'react';
import { AppSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onCancel: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, onCancel }) => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const { planName, effectiveDailyLimit } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCurrentSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentSettings);
  };

  const InputField: React.FC<{label: string, name: keyof AppSettings, type?: string, unit?: string, min?: number, max?: number, step?: number}> = ({label, name, type='text', unit, min, max, step}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type={type}
            name={name}
            id={name}
            value={String(currentSettings[name])}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            className="block w-full p-2 border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 focus:ring-blue-500 focus:border-blue-500"
          />
          {unit && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 text-sm">{unit}</div>}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">系统设置</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">孩子信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="昵称" name="nickname" />
                <InputField label="年龄" name="age" type="number" min={3} max={18} />
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-slate-700 dark:text-slate-300">年级</label>
                  <select id="grade" name="grade" value={currentSettings.grade} onChange={handleChange} className="mt-1 block w-full p-2 border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 focus:ring-blue-500 focus:border-blue-500">
                    <option value="幼儿园">幼儿园</option>
                    <option value="小学一年级">小学一年级</option>
                    <option value="小学二年级">小学二年级</option>
                    <option value="小学三年级">小学三年级</option>
                    <option value="小学四年级">小学四年级</option>
                    <option value="小学五年级">小学五年级</option>
                    <option value="小学六年级">小学六年级</option>
                    <option value="初中一年级">初中一年级</option>
                    <option value="初中二年级">初中二年级</option>
                    <option value="初中三年级">初中三年级</option>
                  </select>
                </div>
                 <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-slate-700 dark:text-slate-300">性别</label>
                  <select id="gender" name="gender" value={currentSettings.gender} onChange={handleChange} className="mt-1 block w-full p-2 border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 focus:ring-blue-500 focus:border-blue-500">
                    <option value="boy">男孩</option>
                    <option value="girl">女孩</option>
                  </select>
                </div>
            </div>
        </div>
        
        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">监督设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">每日最长学习</label>
                    <p className="mt-1 block w-full p-2 text-slate-500 dark:text-slate-400">
                        {effectiveDailyLimit} 小时
                        <span className="text-xs ml-2">({planName})</span>
                    </p>
                </div>
                <InputField label="连续学习时长" name="workDurationBeforeForcedBreak" type="number" unit="分钟" min={15} />
                <InputField label="强制休息时长" name="forcedBreakDuration" type="number" unit="分钟" min={5} />
                 <p className="text-xs text-slate-400 md:col-span-2">每日学习时长上限由您的订阅计划决定。可在“订阅”页面更改计划。</p>
            </div>
        </div>

        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">休息设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="伸懒腰时长" name="stretchBreak" type="number" unit="分钟" min={1} />
                <InputField label="喝水时长" name="waterBreak" type="number" unit="分钟" min={1} />
                <InputField label="厕所时长" name="restroomBreak" type="number" unit="分钟" min={1} />
                <InputField label="每小时喝水次数" name="waterBreakLimit" type="number" unit="次" min={0} />
                <InputField label="每小时厕所次数" name="restroomBreakLimit" type="number" unit="次" min={0} />
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
            取消
          </button>
          <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            保存设置
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;