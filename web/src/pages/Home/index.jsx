/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';
import {
  Zap,
  Shield,
  Unlock,
  ArrowRight,
  BarChart3,
  Cpu,
  Coins,
  Network,
} from 'lucide-react';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  // New State for Animations
  // activeModelIndices is a Set of strings like "row-col" to satisfy the random active requirement
  const [activeModelIndices, setActiveModelIndices] = useState(new Set());
  const [isHoveringModels, setIsHoveringModels] = useState(false);

  const modelScrollData = [
    { name: 'GPT-4o', price: '$2.50', discount: '-50%' },
    { name: 'Claude 3.5', price: '$1.50', discount: '-50%' },
    { name: 'Gemini 1.5', price: '$0.50', discount: '-70%' },
    { name: 'Llama 3.1', price: '$0.10', discount: '-90%' },
    { name: 'Mixtral', price: '$0.20', discount: '-60%' },
    { name: 'Qwen 2.5', price: '$0.05', discount: '-80%' },
    { name: 'DeepSeek', price: '$0.10', discount: '-80%' },
  ];

  const advantages = [
    {
      title: t('价格更低'),
      desc: t('相比官方定价，我们的价格更具竞争力，为您节省每一分钱。'),
      icon: <Coins size={32} className='text-blue-500' />,
    },
    {
      title: t('服务稳定'),
      desc: t('高可用架构设计，确保服务全天候在线，随时响应您的请求。'),
      icon: <Shield size={32} className='text-green-500' />,
    },
    {
      title: t('无限制'),
      desc: t('没有繁琐的请求限制，释放您的创造力，尽情探索 AI 的可能性。'),
      icon: <Unlock size={32} className='text-purple-500' />,
    },
  ];

  const statsData = [
    { label: t('推理速度'), value: '3.5x', desc: t('Faster Inference') },
    { label: t('训练速度'), value: '2.3x', desc: t('Faster Training') },
    { label: t('成本节约'), value: '20%', desc: t('Lower Cost') },
    { label: t('网络压缩'), value: '117x', desc: t('Network Compression') },
  ];

  const modelGroupsItems = [
    { name: 'OpenAI', icon: <OpenAI size={24} />, desc: 'GPT-4o, DALL-E 3' },
    {
      name: 'Anthropic',
      icon: <Claude.Color size={24} />,
      desc: 'Claude 3.5 Sonnet',
    },
    {
      name: 'Google',
      icon: <Gemini.Color size={24} />,
      desc: 'Gemini 1.5 Pro',
    },
    {
      name: 'Midjourney',
      icon: <Midjourney size={24} />,
      desc: 'Image Gen V6',
    },
    { name: 'X.AI', icon: <XAI size={24} />, desc: 'Grok Beta' },
    { name: 'Aliyun', icon: <Qwen.Color size={24} />, desc: 'Qwen 2.5 72B' },
    {
      name: 'DeepSeek',
      icon: <DeepSeek.Color size={24} />,
      desc: 'DeepSeek V3',
    },
    { name: 'Baidu', icon: <Wenxin.Color size={24} />, desc: 'Ernie Bot 4.0' },
  ];

  // Randomly activate models Effect
  useEffect(() => {
    if (isHoveringModels) return;

    const interval = setInterval(() => {
      // Target the middle repetition of items to stay away from edges
      const newActive = new Set();
      // Increase active count for mobile to ensure visibility if list is shorter/scrolling faster
      const numActive = isMobile ? 3 : 2 + Math.floor(Math.random() * 2);

      for (let i = 0; i < numActive; i++) {
        const row = Math.floor(Math.random() * 5); // 5 rows
        const itemsLen = modelGroupsItems.length;
        // In mobile/small screens, narrow the range to the absolute center of the viewport
        const col = itemsLen + Math.floor(Math.random() * itemsLen);
        newActive.add(`row${row}-${col}`);
      }
      setActiveModelIndices(newActive);
    }, 2500);

    return () => clearInterval(interval);
  }, [isHoveringModels, modelGroupsItems.length, isMobile]);

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden'>
          {/* Banner 部分 */}
          <div className='w-full border-b border-semi-color-border min-h-screen relative overflow-x-hidden flex flex-col justify-between pt-20'>
            <div className='flex items-center justify-center flex-grow px-4 z-10 text-white'>
              {/* 居中内容区 */}
              <div className='flex flex-col items-center justify-center text-center max-w-4xl mx-auto'>
                <div className='flex flex-col items-center justify-center mb-6 md:mb-8'>
                  <h1
                    className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white mb-4 ${isChinese ? 'tracking-wide md:tracking-wider' : ''}`}
                    style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  >
                    <>
                      {t('统一的')}
                      <br />
                      <span className='text-blue-300'>
                        {t('大模型接口网关')}
                      </span>
                    </>
                  </h1>
                  <p className='text-base md:text-lg lg:text-xl text-gray-200 mt-4 md:mt-6 max-w-xl'>
                    {t('更好的价格，更好的稳定性，只需要将模型基址替换为：')}
                  </p>
                  {/* BASE URL 与端点选择 */}
                  <div className='flex flex-col md:flex-row items-center justify-center gap-4 w-full mt-4 md:mt-6 max-w-md'>
                    <Input
                      readonly
                      value={serverAddress}
                      className='flex-1 !rounded-full !bg-white/90 !text-black !border-none'
                      size={isMobile ? 'default' : 'large'}
                      suffix={
                        <div className='flex items-center gap-2'>
                          <ScrollList
                            bodyHeight={32}
                            style={{ border: 'unset', boxShadow: 'unset' }}
                          >
                            <ScrollItem
                              mode='wheel'
                              cycled={true}
                              list={endpointItems}
                              selectedIndex={endpointIndex}
                              onSelect={({ index }) => setEndpointIndex(index)}
                            />
                          </ScrollList>
                          <Button
                            type='primary'
                            onClick={handleCopyBaseURL}
                            icon={<IconCopy />}
                            className='!rounded-full'
                          />
                        </div>
                      }
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className='flex flex-row gap-4 justify-center items-center'>
                  <Link to='/console'>
                    <Button
                      theme='solid'
                      type='primary'
                      size={isMobile ? 'default' : 'large'}
                      className='!rounded-3xl px-8 py-2 !font-bold'
                      icon={<IconPlay />}
                    >
                      {t('获取密钥')}
                    </Button>
                  </Link>
                  {isDemoSiteMode && statusState?.status?.version ? (
                    <Button
                      size={isMobile ? 'default' : 'large'}
                      className='flex items-center !rounded-3xl px-6 py-2 !bg-white/20 !text-white hover:!bg-white/30 !border-white/20'
                      icon={<IconGithubLogo />}
                      onClick={() =>
                        window.open(
                          'https://github.com/QuantumNous/new-api',
                          '_blank',
                        )
                      }
                    >
                      {statusState.status.version}
                    </Button>
                  ) : (
                    docsLink && (
                      <Button
                        size={isMobile ? 'default' : 'large'}
                        className='flex items-center !rounded-3xl px-6 py-2 !bg-white/20 !text-white hover:!bg-white/30 !border-white/20'
                        icon={<IconFile />}
                        onClick={() => window.open(docsLink, '_blank')}
                      >
                        {t('文档')}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            <style>{`
              @keyframes scroll-left { from { transform: translateX(0); } to { transform: translateX(-25%); } }
              @keyframes scroll-right { from { transform: translateX(-25%); } to { transform: translateX(0); } }
              .animate-scroll-left { animation: scroll-left 30s linear infinite; }
              .animate-scroll-left-slower { animation: scroll-left 45s linear infinite; }
              .animate-scroll-right { animation: scroll-right 40s linear infinite; }
              /* Mask Image Gradient for fading edges */
              .mask-image-gradient {
                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              }
            `}</style>

            <div
              className='absolute inset-0 z-0 bg-cover bg-center brightness-50'
              style={{
                backgroundImage: 'url(/背景.gif)',
              }}
            ></div>

            {/* Section 2: Infinite Scroll (Right to Left) */}
            <div className='w-full py-6 backdrop-blur-md bg-white/10 relative overflow-hidden mt-12 mb-0 z-10 border-t border-white/10'>
              <div className='flex animate-scroll-left w-max hover:[animation-play-state:paused]'>
                {[
                  ...modelScrollData,
                  ...modelScrollData,
                  ...modelScrollData,
                  ...modelScrollData,
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className='flex-shrink-0 mx-4 w-64 p-4 rounded-xl border border-white/30 bg-black/70 backdrop-blur-md flex items-center justify-between shadow-lg'
                  >
                    <div className='font-bold text-lg text-white'>
                      {item.name}
                    </div>
                    <div className='flex flex-col items-end'>
                      <span className='text-gray-400 line-through text-xs'>
                        {item.price}
                      </span>
                      <span className='text-yellow-400 font-bold'>
                        {item.discount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {isMobile && (
                <div
                  className='flex animate-scroll-left w-max hover:[animation-play-state:paused] mt-4'
                  style={{ animationDuration: '70s' }}
                >
                  {[
                    ...modelScrollData,
                    ...modelScrollData,
                    ...modelScrollData,
                    ...modelScrollData,
                  ]
                    .reverse()
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className='flex-shrink-0 mx-4 w-64 p-4 rounded-xl border border-white/30 bg-black/70 backdrop-blur-md flex items-center justify-between shadow-lg'
                      >
                        <div className='font-bold text-lg text-white'>
                          {item.name}
                        </div>
                        <div className='flex flex-col items-end'>
                          <span className='text-gray-400 line-through text-xs'>
                            {item.price}
                          </span>
                          <span className='text-yellow-400 font-bold'>
                            {item.discount}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Advantages */}
          <div className='w-full bg-[var(--semi-color-bg-0)] border-b border-[var(--semi-color-border)] relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 dark:opacity-40'>
              <div className='absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50' />
              <div className='absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen opacity-50' />
            </div>
            <div className='container mx-auto px-4 py-24 relative z-10'>
              <div className='text-center mb-16'>
                <h2 className='text-3xl md:text-5xl font-bold mb-4 text-[var(--semi-color-text-0)]'>
                  {t('Advantage')}
                </h2>
                <div className='w-24 h-1 bg-blue-500 mx-auto rounded-full mb-6' />
                <p className='text-xl text-[var(--semi-color-text-1)]'>
                  {t('Why Choose Us')}
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {advantages.map((adv, idx) => (
                  <div
                    key={idx}
                    className='p-8 rounded-2xl bg-[var(--semi-color-bg-1)] border border-[var(--semi-color-border)] hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden'
                  >
                    <div className='absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all' />
                    <div className='mb-6 p-4 rounded-full bg-[var(--semi-color-bg-2)] w-fit group-hover:scale-110 transition-transform hidden md:block relative z-10 shadow-sm'>
                      {adv.icon}
                    </div>
                    <h3 className='text-2xl font-bold mb-4 text-[var(--semi-color-text-0)] relative z-10'>
                      {adv.title}
                    </h3>
                    <p className='text-[var(--semi-color-text-1)] leading-relaxed relative z-10'>
                      {adv.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Added AI Icons List beneath Advantages */}
              <div className='mt-24 pt-12 border-t border-[var(--semi-color-border)]/50'>
                <p className='text-center text-[var(--semi-color-text-2)] mb-10 font-medium tracking-widest uppercase text-sm'>
                  {t('Empowering with Leading AI Technologies')}
                </p>
                <div className='flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 bg-[var(--semi-color-bg-2)]/30 py-10 px-8 rounded-3xl'>
                  <OpenAI size={40} />
                  <Claude.Color size={40} />
                  <Gemini.Color size={40} />
                  <DeepSeek.Color size={40} />
                  <Qwen.Color size={40} />
                  <Wenxin.Color size={40} />
                  <Midjourney size={40} />
                  <XAI size={40} />
                  <Moonshot size={40} />
                  <Zhipu size={40} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Scroll Reverse */}
          <div className='w-full py-16 bg-[var(--semi-color-bg-1)] border-b border-[var(--semi-color-border)] overflow-hidden relative'>
            <div className='absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--semi-color-bg-1)] to-transparent z-10 pointer-events-none' />
            <div className='absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--semi-color-bg-1)] to-transparent z-10 pointer-events-none' />
            <div className='flex animate-scroll-right w-max hover:[animation-play-state:paused]'>
              {[
                ...modelScrollData,
                ...modelScrollData,
                ...modelScrollData,
                ...modelScrollData,
              ].map((item, idx) => (
                <div
                  key={idx}
                  className='flex-shrink-0 mx-4 w-64 p-4 rounded-xl border border-[var(--semi-color-border)] bg-[var(--semi-color-bg-1)] flex items-center justify-between'
                >
                  <div className='font-bold text-lg text-[var(--semi-color-text-0)]'>
                    {item.name}
                  </div>
                  <div className='flex flex-col items-end'>
                    <span className='text-[var(--semi-color-text-2)] line-through text-xs'>
                      {item.price}
                    </span>
                    <span className='text-red-500 font-bold'>
                      {item.discount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Stats */}
          <div className='bg-[var(--semi-color-bg-2)] py-32 border-b border-[var(--semi-color-border)] relative'>
            <div className='absolute inset-0 opacity-[0.1] dark:opacity-[0.15] bg-[radial-gradient(var(--semi-color-primary)_1.5px,transparent_1.5px)] [background-size:24px_24px]' />
            <div className='container mx-auto px-4 relative z-10'>
              <div className='text-center mb-20'>
                <h2 className='text-3xl md:text-5xl font-bold mb-6 text-[var(--semi-color-text-0)]'>
                  {t('Proven results')}
                </h2>
                <p className='text-xl text-[var(--semi-color-text-1)] max-w-2xl mx-auto'>
                  {t(
                    'Get to market faster and save costs with breakthrough innovations',
                  )}
                </p>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                {statsData.map((stat, idx) => (
                  <div
                    key={idx}
                    className='flex flex-col justify-between p-8 h-80 bg-[var(--semi-color-bg-0)] rounded-2xl border border-[var(--semi-color-border)] hover:border-blue-500 transition-all hover:shadow-xl hover:-translate-y-2'
                  >
                    <div>
                      <span className='text-sm font-semibold uppercase tracking-wider text-[var(--semi-color-text-2)] mb-2 block'>
                        {stat.desc}
                      </span>
                      <h3 className='text-xl font-bold text-[var(--semi-color-text-0)]'>
                        {stat.label}
                      </h3>
                    </div>
                    <span className='text-5xl md:text-6xl font-bold text-blue-600 tracking-tighter'>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Model List with Honeycomb-like Layout */}
          <div className='py-32 overflow-hidden relative border-b border-[var(--semi-color-border)] bg-[var(--semi-color-bg-0)]'>
            <div className='absolute inset-0 opacity-[0.08] dark:opacity-[0.12] bg-[linear-gradient(to_right,var(--semi-color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--semi-color-border)_1px,transparent_1px)] [background-size:40px_40px]' />
            <div className='container mx-auto relative z-10'>
              <div className='flex flex-col items-center mb-20 text-center px-4'>
                <h2 className='text-3xl md:text-5xl font-bold mb-6 text-[var(--semi-color-text-0)]'>
                  {t('model group')}
                </h2>
                <p className='text-xl text-[var(--semi-color-text-1)] mb-8'>
                  {t('Supported Models')}
                </p>
              </div>

              <div className='relative w-full overflow-hidden mask-image-gradient py-10'>
                {[0, 1, 2, 3, 4].map((rowIndex) => (
                  <div
                    key={rowIndex}
                    className={`flex gap-4 mb-4 ${rowIndex % 2 === 0 ? 'animate-scroll-left' : 'animate-scroll-left-slower'} w-max hover:[animation-play-state:paused]`}
                    style={{
                      marginLeft: rowIndex % 2 === 0 ? '-100px' : '-50px',
                      animationDuration: `${30 + rowIndex * 5}s`,
                    }}
                  >
                    {[
                      ...modelGroupsItems,
                      ...modelGroupsItems,
                      ...modelGroupsItems,
                    ].map((group, colIndex) => {
                      const uniqueId = `row${rowIndex}-${colIndex}`;
                      // Check if this specific item is active in the Set
                      const isActive = activeModelIndices.has(uniqueId);

                      return (
                        <div
                          key={colIndex}
                          className={`relative transition-all duration-500 ease-in-out cursor-pointer group bg-[var(--semi-color-bg-0)] border border-[var(--semi-color-border)] rounded-full flex items-center overflow-hidden
                          ${isActive || (isHoveringModels && activeModelIndices.has(uniqueId)) ? (isMobile ? 'w-56 pr-4 gap-2 bg-[var(--semi-color-bg-2)] shadow-lg scale-105' : 'w-60 pr-6 gap-4 bg-[var(--semi-color-bg-2)] shadow-lg scale-105') : 'w-16 md:w-20 justify-start hover:w-80 hover:pr-6 hover:gap-4 hover:bg-[var(--semi-color-bg-2)] hover:shadow-lg hover:scale-105'}
                          h-16 md:h-20
                        `}
                          onMouseEnter={() => {
                            setIsHoveringModels(true);
                            // Clear auto set and set only this one
                            setActiveModelIndices(new Set([uniqueId]));
                          }}
                          onMouseLeave={() => {
                            setIsHoveringModels(false);
                            // Reset to empty, let interval pick up
                            setActiveModelIndices(new Set());
                          }}
                        >
                          <div className='flex-shrink-0 w-16 md:w-20 h-16 md:h-20 flex items-center justify-center '>
                            <div className='transform transition-transform group-hover:scale-110 text-[var(--semi-color-text-0)]'>
                              {group.icon}
                            </div>
                          </div>
                          <div
                            className={`flex flex-col justify-center flex-1 min-w-0 pr-4 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          >
                            <h3 className='text-sm md:text-lg font-bold text-[var(--semi-color-text-0)] whitespace-nowrap overflow-hidden text-ellipsis'>
                              {group.name}
                            </h3>
                            <p className='text-xs md:text-sm text-[var(--semi-color-text-1)] whitespace-nowrap overflow-hidden text-ellipsis'>
                              {group.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className='flex justify-center mt-12'>
                <Link to='/pricing'>
                  <Button
                    theme='solid'
                    type='secondary'
                    size='large'
                    className='!rounded-full !px-10 !py-6 !text-lg !font-bold'
                  >
                    {t('View All Models')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Section 7: Code Snippet */}
          <div className='py-24 bg-[var(--semi-color-bg-1)] border-b border-[var(--semi-color-border)] relative overflow-hidden'>
            <div className='absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(ellipse_at_center,_var(--semi-color-text-0)_0%,_transparent_70%)]' />
            <div className='container mx-auto px-4 relative z-10'>
              <div className='flex flex-col lg:flex-row items-center gap-12'>
                <div className='lg:w-1/2'>
                  <h2 className='text-3xl md:text-5xl font-bold mb-6 text-[var(--semi-color-text-0)]'>
                    {t('Simple Integration')}
                  </h2>
                  <p className='text-xl text-[var(--semi-color-text-1)] mb-8 leading-relaxed'>
                    {t(
                      'Compatible with OpenAI SDK, switch your base URL and start using our high-performance API in seconds.',
                    )}
                  </p>
                  <ul className='space-y-4'>
                    {[
                      'Standard OpenAI Protocol',
                      'High Concurrency Support',
                      'Real-time Usage Tracking',
                    ].map((item, i) => (
                      <li
                        key={i}
                        className='flex items-center gap-3 text-[var(--semi-color-text-0)] font-medium'
                      >
                        <div className='w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center'>
                          <Zap size={14} className='text-green-500' />
                        </div>
                        {t(item)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='lg:w-1/2 w-full'>
                  <div className='bg-[#1e1e1e] rounded-2xl p-1 shadow-2xl overflow-hidden border border-white/10'>
                    <div className='flex gap-1.5 p-4 border-b border-white/5'>
                      <div className='w-3 h-3 rounded-full bg-red-500/50' />
                      <div className='w-3 h-3 rounded-full bg-yellow-500/50' />
                      <div className='w-3 h-3 rounded-full bg-green-500/50' />
                    </div>
                    <pre className='p-6 overflow-x-auto text-sm md:text-base font-mono leading-relaxed text-blue-300'>
                      <code>{`import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="${serverAddress}/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Start Using */}
          <div className='py-32 bg-[var(--semi-color-bg-2)] relative overflow-hidden'>
            <div className='absolute inset-0 opacity-[0.05] dark:opacity-[0.1] bg-[repeating-linear-gradient(45deg,var(--semi-color-primary),var(--semi-color-primary)_2px,transparent_2px,transparent_30px)]' />
            <div className='container mx-auto px-4 text-center relative z-10'>
              <h2 className='text-3xl md:text-5xl font-bold mb-8 text-[var(--semi-color-text-0)]'>
                {t('Ready to start?')}
              </h2>
              <div className='flex flex-col md:flex-row justify-center gap-4 items-center'>
                <Link to='/console'>
                  <Button
                    theme='solid'
                    type='primary'
                    size='large'
                    className='!rounded-full px-12 !text-lg !h-14 font-bold shadow-lg shadow-blue-500/30'
                  >
                    {t('Get Started Now')}
                  </Button>
                </Link>
                {isDemoSiteMode && statusState?.status?.version ? (
                  <Button
                    size='large'
                    className='flex items-center !rounded-full px-8 !h-14 font-bold !bg-[var(--semi-color-bg-2)]'
                    icon={<IconGithubLogo />}
                    onClick={() =>
                      window.open(
                        'https://github.com/QuantumNous/new-api',
                        '_blank',
                      )
                    }
                  >
                    {statusState.status.version}
                  </Button>
                ) : (
                  docsLink && (
                    <Button
                      size='large'
                      className='flex items-center !rounded-full px-8 !h-14 font-bold !bg-[var(--semi-color-bg-2)]'
                      icon={<IconFile />}
                      onClick={() => window.open(docsLink, '_blank')}
                    >
                      {t('文档')}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
