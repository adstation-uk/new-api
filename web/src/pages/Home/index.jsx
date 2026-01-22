import React, { useContext, useEffect, useState, useMemo } from 'react';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
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
  Github
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
  Play,
  FileText,
  Copy,
  Gift
} from 'lucide-react';
import { cn } from '../../lib/utils';

const MODEL_SCROLL_DATA = [
  { name: 'GPT-4o', price: '$10', discount: '-33%' },
  { name: 'GPT-4o-mini', price: '$0.60', discount: '-40%' },
  { name: 'GPT-5', price: '$12', discount: '-40%' },
  { name: 'GPT-5-mini', price: '$3', discount: '-25%' },
  { name: 'Gemini 2.0 Flash', price: '$0.5', discount: '-45%' },
  { name: 'Gemini 2.5 Flash', price: '$2.5', discount: '-33%' },
  { name: 'Gemini 2.5 Flash lite', price: '$0.4', discount: '-25%' },
  { name: 'Nano Banana', price: '$1.0', discount: '-33%' },
  { name: 'Gemini 3 Flash', price: '$5.0', discount: '-25%' },
  { name: 'Gemini 3 Pro', price: '$2.0', discount: '-33%' },
  { name: 'Nano Banana Pro', price: '$2.0', discount: '-33%' },
  { name: 'Veo 3.1', price: '$2.0', discount: '-60%' },
  { name: 'Suno lyrics', price: '$8.0', discount: '-25%' },
  { name: 'Suno music', price: '$1.0', discount: '-87.5%' },
];

const HERO_MODELS_DATA = [
  {
    name: 'Suno music',
    price: '$0.075',
    original: '$0.12',
    discount: '-37.5% OFF',
    unit: '/req',
    icon: (size) => <Suno size={size} />,
    pos: '-translate-x-32 -translate-y-36 rotate-[-6deg]',
  },
  {
    name: 'Gemini 3 Pro',
    price: '$9.0',
    original: '$12.0',
    discount: 'BEST VALUE',
    unit: '/M',
    icon: (size) => <Gemini size={size} />,
    pos: 'translate-x-4 -translate-y-8',
    featured: true,
  },
  {
    name: 'GPT-5',
    price: '$7.5',
    original: '$10',
    discount: '-25% OFF',
    unit: '/M',
    icon: (size) => <OpenAI size={size} />,
    pos: 'translate-x-40 -translate-y-44 rotate-[4deg]',
  },
  {
    name: 'Veo 3.1',
    price: '$3.0',
    original: '$4.38',
    discount: '-31% OFF',
    unit: '/req',
    icon: (size) => <Gemini size={size} />,
    pos: '-translate-x-20 translate-y-32 rotate-[-2deg]',
  },
  {
    name: 'Gemini 2.5 Flash',
    price: '$1.8',
    original: '$2.5',
    discount: '-28% OFF',
    unit: '/M',
    icon: (size) => <Gemini size={size} />,
    pos: 'translate-x-40 translate-y-24 rotate-[5deg]',
  },
];

const MODEL_GROUPS_ITEMS = [
  { name: 'OpenAI', icon: <OpenAI size={24} />, desc: 'GPT-4o, GPT-5' },
  {
    name: 'Anthropic',
    icon: <Claude.Color size={24} />,
    desc: 'Claude 3.5 Sonnet',
  },
  {
    name: 'Google',
    icon: <Gemini.Color size={24} />,
    desc: 'Gemini 3 Pro, Gemini 3 Flash',
  },
  {
    name: 'Moonshot',
    icon: <Moonshot size={24} />,
    desc: 'Kimi-latest',
  },
  {
    name: 'Zhipu',
    icon: <Zhipu size={24} />,
    desc: 'GLM-4 Plus',
  },
  {
    name: 'Volcengine',
    icon: <Volcengine size={24} />,
    desc: 'Doubao-pro',
  },
  {
    name: 'Midjourney',
    icon: <Midjourney size={24} />,
    desc: 'Image Gen V6',
  },
  { name: 'X.AI', icon: <XAI size={24} />, desc: 'Grok-2' },
  { name: 'Aliyun', icon: <Qwen.Color size={24} />, desc: 'Qwen 2.5 72B' },
  {
    name: 'DeepSeek',
    icon: <DeepSeek.Color size={24} />,
    desc: 'DeepSeek V3',
  },
  { name: 'Baidu', icon: <Wenxin.Color size={24} />, desc: 'Ernie Bot 4.0' },
  { name: 'Minimax', icon: <Minimax size={24} />, desc: 'abab 6.5s' },
  { name: 'Suno', icon: <Suno size={24} />, desc: 'Suno V3.5' },
  { name: 'iFlytek', icon: <Spark size={24} />, desc: 'Spark 4.0 Ultra' },
  { name: 'Tencent', icon: <Hunyuan size={24} />, desc: 'Hunyuan-Turbo' },
];

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
  const endpointItems = useMemo(
    () => API_ENDPOINTS.map((e) => ({ value: e })),
    [],
  );
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  // New State for Animations
  // activeModelIndices is a Set of strings like "row-col" to satisfy the random active requirement
  const [activeModelIndices, setActiveModelIndices] = useState(new Set());
  const [isHoveringModels, setIsHoveringModels] = useState(false);

  const advantages = useMemo(
    () => [
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
    ],
    [t],
  );

  const statsData = useMemo(
    () => [
      { label: t('推理速度'), value: '3.5x', desc: t('更快的推理速率') },
      { label: t('训练速度'), value: '2.3x', desc: t('更高的训练效率') },
      { label: t('成本节约'), value: '20%', desc: t('更低的支出成本') },
      { label: t('网络压缩'), value: '117x', desc: t('更佳的网络压缩') },
    ],
    [t],
  );

  const shuffledRows = useMemo(() => {
    return [0, 1, 2, 3, 4].map(() => {
      const items = [...MODEL_GROUPS_ITEMS];
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return [...items, ...items, ...items];
    });
  }, []);

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
        const itemsLen = MODEL_GROUPS_ITEMS.length;
        // Target items that are visually central during the scroll cycle.
        // For a 3-repeat list scrolling from 0 to -33%, the visible window shifts from block 1 to block 2.
        // Picking col around the itemsLen boundary ensures items appear centrally.
        const col = Math.floor(itemsLen * 0.4) + Math.floor(Math.random() * itemsLen);
        newActive.add(`row${row}-${col}`);
      }
      setActiveModelIndices(newActive);
    }, 2500);

    return () => clearInterval(interval);
  }, [isHoveringModels, isMobile]);

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
          <div className='w-full  lg:h-[calc(100vh-120px)] relative overflow-hidden flex flex-col justify-center pt-20 bg-white dark:bg-slate-900'>
            {/* 动态背景装饰 */}
            <div className="absolute inset-0 z-0">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,rgba(248,250,252,1),rgba(241,245,249,1))] dark:bg-[radial-gradient(circle_at_50%_20%,rgba(15,23,42,1),rgba(2,6,23,1))]" />
               <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
               <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
               <div className='absolute inset-0 opacity-[0.05] dark:opacity-[0.1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]'></div>
            </div>

            <div className='container mx-auto px-6 z-10 text-slate-900 dark:text-white h-full flex items-center'>
              <div className='flex flex-col lg:flex-row items-center justify-between gap-12 w-full'>
                {/* 左侧内容区 */}
                <div className='flex flex-col items-start text-left max-w-2xl w-full lg:w-1/2'>
                  <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6'>
                    <Zap size={14} />
                    <span>{t('下一代 API 网关')}</span>
                  </div>
                  <h1
                    className={cn(
                      'text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-slate-900 dark:text-white mb-6',
                      isChinese && 'tracking-wide',
                    )}
                    style={{
                      textShadow:
                        actualTheme === 'dark'
                          ? '0 4px 20px rgba(0,0,0,0.5)'
                          : 'none',
                    }}
                  >
                    {t('统一的')}
                    <br />
                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300'>
                      {t('大模型接口网关')}
                    </span>
                  </h1>
                  <p className='text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed'>
                    {t('更好的价格，更好的稳定性，只需要将模型基址替换为：')}
                  </p>
                  
                  {/* BASE URL */}
                  <div className='w-full max-w-md mb-10'>
                    <div className='relative flex items-center h-14 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 hover:border-blue-500/50 transition-colors group'>
                      <input
                        readOnly
                        value={serverAddress}
                        className='bg-transparent border-none outline-none flex-1 text-slate-800 dark:text-gray-200 font-medium focus:ring-0 w-full'
                      />
                      <button
                        onClick={handleCopyBaseURL}
                        className='ml-2 p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer border-none flex items-center justify-center'
                        title={t('复制')}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className='flex flex-wrap gap-4 items-center'>
                    <Link
                      to='/register'
                      className='inline-flex items-center justify-center gap-2 rounded-xl px-10 h-14 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 cursor-pointer no-underline'
                    >
                      <span>{t('立即免费开始')}</span>
                      <ArrowRight size={20} />
                    </Link>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2 px-2 text-sm font-medium text-red-600 dark:text-red-400 animate-pulse'>
                          <Gift size={16} />
                          <span>{t('注册即送 $1')}</span>
                      </div>
                      <div className='flex items-center gap-2 px-2 text-sm font-medium text-blue-600 dark:text-blue-400'>
                          <Zap size={14} className="fill-current" />
                          <span>{t('全场模型 75 折起')}</span>
                      </div>
                    </div>
                    {isDemoSiteMode && statusState?.status?.version ? (
                      <button
                        className='inline-flex items-center gap-2 rounded-xl px-6 h-14 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer justify-center'
                        onClick={() =>
                          window.open(
                            'https://github.com/QuantumNous/new-api',
                            '_blank',
                          )
                        }
                      >
                        <Github size={20} />
                        <span>{statusState.status.version}</span>
                      </button>
                    ) : (
                      docsLink && (
                        <button
                          className='inline-flex items-center gap-2 rounded-xl px-6 h-14 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer justify-center'
                          onClick={() => window.open(docsLink, '_blank')}
                        >
                          <FileText size={20} />
                          <span>{t('查看文档')}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* 右侧展示区 - 错落卡片 */}
                <div className='relative lg:w-1/2 w-full hidden md:flex justify-center items-center h-[600px]'>
                   {HERO_MODELS_DATA.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          'absolute transform transition-all hover:scale-105 hover:z-50',
                          item.pos,
                          item.featured ? 'z-30' : 'z-20'
                        )}
                      >
                         <div className={cn(
                           'p-8 rounded-3xl border shadow-2xl backdrop-blur-xl',
                           item.featured 
                             ? 'w-80 bg-gradient-to-br from-blue-600 to-indigo-700 border-white/20 shadow-[0_20px_50px_rgba(37,99,235,0.3)]' 
                             : 'w-72 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-white/10'
                         )}>
                           <div className='flex items-center gap-4 mb-5'>
                              {item.icon(item.featured ? 48 : 40)}
                              <span className={cn(
                                'font-bold tracking-tight',
                                item.featured ? 'text-2xl text-white' : 'text-xl text-slate-900 dark:text-white'
                              )}>
                                {item.name}
                              </span>
                           </div>
                           <div className='space-y-3'>
                              <div className='flex items-baseline gap-2'>
                                 <span className={cn(
                                   'text-4xl font-black',
                                   item.featured ? 'text-white' : 'text-slate-900 dark:text-white'
                                 )}>
                                   {item.price}<span className={cn(
                                     'text-lg font-normal',
                                     item.featured ? 'text-blue-100' : 'text-slate-500 dark:text-gray-400'
                                   )}>{t(item.unit || '/M')}</span>
                                 </span>
                                 <span className={cn(
                                   'text-sm line-through',
                                   item.featured ? 'text-blue-200/60' : 'text-slate-400 dark:text-gray-500'
                                 )}>
                                   {item.original}{t(item.unit || '/M')}
                                 </span>
                              </div>
                              <div className={cn(
                                'inline-flex px-3 py-1 rounded-full text-xs font-bold border',
                                item.featured 
                                  ? 'bg-white/20 text-white border-white/10' 
                                  : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                              )}>
                                 {t(item.discount)}
                              </div>
                           </div>
                         </div>
                      </div>
                   ))}
                </div>

                {/* 移动端展示 */}
                <div className='md:hidden grid grid-cols-1 gap-4 w-full mb-12'>
                   {HERO_MODELS_DATA.map((item, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'p-5 rounded-2xl border flex items-center justify-between',
                          item.featured
                            ? 'bg-blue-600/20 border-blue-500/30'
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10',
                        )}
                      >
                         <div className='flex items-center gap-3'>
                            {item.icon(24)}
                            <span className='font-bold text-lg text-slate-900 dark:text-white'>{item.name}</span>
                         </div>
                         <div className='text-right flex flex-col items-end gap-2'>
                            <div className='flex items-baseline gap-1'>
                               <span className='text-2xl font-black text-slate-900 dark:text-white'>{item.price}</span>
                               <span className='text-xs text-slate-500 dark:text-slate-400'>{t(item.unit || '/M')}</span>
                            </div>
                            <span className='text-xs font-bold text-green-600 dark:text-green-400 ml-2 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20'>
                               {t(item.discount)}
                            </span>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
            </div>

            <style>{`
              @keyframes scroll-left { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
              @keyframes scroll-right { from { transform: translateX(-33.333%); } to { transform: translateX(0); } }
              .animate-scroll-left { animation: scroll-left 30s linear infinite; }
              .animate-scroll-left-slower { animation: scroll-left 45s linear infinite; }
              .animate-scroll-right { animation: scroll-right 40s linear infinite; }
              /* Mask Image Gradient for fading edges */
              .mask-image-gradient {
                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              }
            `}</style>
          </div>

          {/* Section 3: Advantages */}
          <div className='w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 dark:opacity-40'>
              <div className='absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50' />
              <div className='absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen opacity-50' />
            </div>
            <div className='container mx-auto px-4 py-24 relative z-10'>
              <div className='text-center mb-16'>
                <h2 className='text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white'>
                  {t('优势')}
                </h2>
                <div className='w-24 h-1 bg-blue-500 mx-auto rounded-full mb-6' />
                <p className='text-xl text-slate-600 dark:text-slate-400'>
                  {t('为什么选择我们')}
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {advantages.map((adv, idx) => (
                  <div
                    key={idx}
                    className='p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden'
                  >
                    <div className='absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all' />
                    <div className='mb-6 p-4 rounded-full bg-slate-100 dark:bg-slate-900 w-fit group-hover:scale-110 transition-transform hidden md:block relative z-10 shadow-sm'>
                      {adv.icon}
                    </div>
                    <h3 className='text-2xl font-bold mb-4 text-slate-900 dark:text-white relative z-10'>
                      {adv.title}
                    </h3>
                    <p className='text-slate-600 dark:text-slate-400 leading-relaxed relative z-10'>
                      {adv.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Added AI Icons List beneath Advantages */}
              <div className='mt-24 pt-12 border-t border-slate-200 dark:border-white/10'>
                <p className='text-center text-slate-400 dark:text-slate-500 mb-10 font-medium tracking-widest uppercase text-sm'>
                  {t('采用领先的 AI 技术赋能')}
                </p>
                <div className='flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 bg-slate-100/30 dark:bg-slate-900/30 py-10 px-8 rounded-3xl'>
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
          <div className='w-full py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 overflow-hidden relative'>
            <div className='absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 dark:from-slate-900/50 to-transparent z-10 pointer-events-none' />
            <div className='absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 dark:from-slate-900/50 to-transparent z-10 pointer-events-none' />
            <div className='flex animate-scroll-right w-max hover:[animation-play-state:paused]'>
              {[
                ...MODEL_SCROLL_DATA,
                ...MODEL_SCROLL_DATA,
                ...MODEL_SCROLL_DATA,
                ...MODEL_SCROLL_DATA,
              ].map((item, idx) => (
                <div
                  key={idx}
                  className='flex-shrink-0 mx-4 w-64 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-between'
                >
                  <div className='font-bold text-lg text-slate-900 dark:text-white'>
                    {item.name}
                  </div>
                  <div className='flex flex-col items-end'>
                    <span className='text-slate-400 dark:text-slate-500 line-through text-xs'>
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
          <div className='bg-slate-100 dark:bg-slate-900 py-32 border-b border-slate-200 dark:border-white/10 relative'>
            <div className='absolute inset-0 opacity-[0.1] dark:opacity-[0.15] bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:24px_24px]' />
            <div className='container mx-auto px-4 relative z-10'>
              <div className='text-center mb-20'>
                <h2 className='text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white'>
                  {t('卓越成效')}
                </h2>
                <p className='text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto'>
                  {t('通过突破性创新更快进入市场并降低成本')}
                </p>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                {statsData.map((stat, idx) => (
                  <div
                    key={idx}
                    className='flex flex-col justify-between p-8 h-80 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-500 transition-all hover:shadow-xl hover:-translate-y-2'
                  >
                    <div>
                      <span className='text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block'>
                        {stat.desc}
                      </span>
                      <h3 className='text-xl font-bold text-slate-900 dark:text-white'>
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
          <div className='py-32 overflow-hidden relative border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950'>
            <div className='absolute inset-0 opacity-[0.08] dark:opacity-[0.12] bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]' />
            <div className='container mx-auto relative z-10'>
              <div className='flex flex-col items-center mb-20 text-center px-4'>
                <h2 className='text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white'>
                  {t('模型群组')}
                </h2>
                <p className='text-xl text-slate-600 dark:text-slate-400 mb-8'>
                  {t('支持的模型')}
                </p>
              </div>

              <div className='relative w-full overflow-hidden mask-image-gradient py-10'>
                {[0, 1, 2, 3, 4].map((rowIndex) => (
                  <div
                    key={rowIndex}
                    className={cn(
                      'flex gap-4 mb-4 w-max hover:[animation-play-state:paused]',
                      rowIndex % 2 === 0
                        ? 'animate-scroll-left'
                        : 'animate-scroll-left-slower',
                    )}
                    style={{
                      marginLeft: rowIndex % 2 === 0 ? '-100px' : '-50px',
                      animationDuration: `${30 + rowIndex * 5}s`,
                    }}
                  >
                    {shuffledRows[rowIndex].map((group, colIndex) => {
                      const uniqueId = `row${rowIndex}-${colIndex}`;
                      // Check if this specific item is active in the Set
                      const isActive = activeModelIndices.has(uniqueId);

                      return (
                        <div
                          key={colIndex}
                          className={cn(
                            'relative transition-all duration-500 ease-in-out cursor-pointer group bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-full flex items-center overflow-hidden h-16 md:h-20',
                            (isActive ||
                              (isHoveringModels &&
                                activeModelIndices.has(uniqueId))) &&
                              'bg-slate-100 dark:bg-slate-900 shadow-lg scale-105',
                            isActive ||
                              (isHoveringModels &&
                                activeModelIndices.has(uniqueId))
                              ? isMobile
                                ? 'w-56 pr-4 gap-2'
                                : 'w-60 pr-6 gap-4'
                              : 'w-16 md:w-20 justify-start hover:w-80 hover:pr-6 hover:gap-4 hover:bg-slate-100 dark:hover:bg-slate-900 hover:shadow-lg hover:scale-105',
                          )}
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
                            <div className='transform transition-transform group-hover:scale-110 text-slate-900 dark:text-white'>
                              {group.icon}
                            </div>
                          </div>
                          <div
                            className={cn(
                              'flex flex-col justify-center flex-1 min-w-0 pr-4 transition-opacity duration-300',
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            )}
                          >
                            <h3 className='text-sm md:text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis'>
                              {group.name}
                            </h3>
                            <p className='text-xs md:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis'>
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
                <Link
                  to='/pricing'
                  className='inline-flex items-center justify-center rounded-full px-10 py-6 text-lg font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors no-underline'
                >
                  {t('查看所有模型')}
                </Link>
              </div>
            </div>
          </div>

          {/* Section 7: Code Snippet */}
          <div className='py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 relative overflow-hidden'>
            <div className='absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(ellipse_at_center,theme(colors.slate.900)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,theme(colors.white)_0%,transparent_70%)]' />
            <div className='container mx-auto px-4 relative z-10'>
              <div className='flex flex-col lg:flex-row items-center gap-12'>
                <div className='lg:w-1/2'>
                  <h2 className='text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white'>
                    {t('简单集成')}
                  </h2>
                  <p className='text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed'>
                    {t(
                      '兼容 OpenAI SDK，只需切换您的基础 URL，即可在几秒钟内开始使用我们的高性能 API。',
                    )}
                  </p>
                  <ul className='space-y-4'>
                    {['标准 OpenAI 协议', '高并发支持', '实时用量追踪'].map(
                      (item, i) => (
                        <li
                          key={i}
                          className='flex items-center gap-3 text-slate-900 dark:text-white font-medium'
                        >
                          <div className='w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center'>
                            <Zap size={14} className='text-green-500' />
                          </div>
                          {t(item)}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className='lg:w-1/2 w-full'>
                  <div className='bg-[#1e1e1e] rounded-2xl p-1 shadow-2xl overflow-hidden border border-white/10'>
                    <div className='flex gap-1.5 p-4 border-b border-white/5'>
                      <div className='w-3 h-3 rounded-full bg-red-500/50' />
                      <div className='w-3 h-3 rounded-full bg-yellow-500/50' />
                      <div className='w-3 h-3 rounded-full bg-green-500/50' />
                    </div>
                    <pre className='p-6 overflow-x-auto text-sm md:text-base font-mono leading-relaxed text-gray-300'>
                      <code>
                        <span className="text-purple-400">import</span> openai{'\n\n'}
                        client = openai.<span className="text-blue-400">OpenAI</span>({'\n'}
                        {'    '}<span className="text-orange-400">api_key</span>=<span className="text-green-400">"your-api-key"</span>,{'\n'}
                        {'    '}<span className="text-orange-400">base_url</span>=<span className="text-green-400">"{serverAddress}/v1"</span>{'\n'}
                        ){'\n\n'}
                        response = client.chat.completions.<span className="text-blue-400">create</span>({'\n'}
                        {'    '}<span className="text-orange-400">model</span>=<span className="text-green-400">"gpt-4o"</span>,{'\n'}
                        {'    '}<span className="text-orange-400">messages</span>=[{'{'}<span className="text-green-400">"role"</span>: <span className="text-green-400">"user"</span>, <span className="text-green-400">"content"</span>: <span className="text-green-400">"Hello!"</span>{'}'}]{'\n'}
                        ){'\n\n'}
                        <span className="text-purple-400">print</span>(response.choices[0].message.content)
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Start Using */}
          <div className='py-32 bg-slate-100 dark:bg-slate-900 relative overflow-hidden'>
            <div className='absolute inset-0 opacity-[0.05] dark:opacity-[0.1] bg-[repeating-linear-gradient(45deg,theme(colors.blue.500),theme(colors.blue.500)_2px,transparent_2px,transparent_30px)]' />
            <div className='container mx-auto px-4 text-center relative z-10'>
              <h2 className='text-3xl md:text-5xl font-bold mb-8 text-slate-900 dark:text-white'>
                {t('准备好开始了吗？')}
              </h2>
              <div className='flex flex-col md:flex-row justify-center gap-4 items-center'>
                <Link
                  to='/console'
                  className='inline-flex items-center justify-center rounded-full px-12 h-14 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all no-underline'
                >
                  {t('立即开始')}
                </Link>
                {isDemoSiteMode && statusState?.status?.version ? (
                  <button
                    className='inline-flex items-center justify-center gap-2 rounded-full px-8 h-14 font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer'
                    onClick={() =>
                      window.open(
                        'https://github.com/QuantumNous/new-api',
                        '_blank',
                      )
                    }
                  >
                      <Github size={20} />
                    <span>{statusState.status.version}</span>
                  </button>
                ) : (
                  docsLink && (
                    <button
                      className='inline-flex items-center justify-center gap-2 rounded-full px-8 h-12 font-bold bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer'
                      onClick={() => window.open(docsLink, '_blank')}
                    >
                      <FileText size={20} />
                      <span>{t('文档')}</span>
                    </button>
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
