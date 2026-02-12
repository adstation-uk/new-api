import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  API,
  showSuccess,
  showError,
  renderQuota,
  stringToColor,
  renderQuotaWithAmount,
  getCurrencyConfig,
  convertUSDToCurrency,
  renderQuotaWithPrompt,
} from '../../helpers';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';
import { useDashboardData } from '../../hooks/dashboard/useDashboardData';
import { Coins, CheckCircle, X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const QUOTA_PER_UNIT = 500000;
const PAYPAL_CLIENT_ID =
  'ARZHtnqotObgNjK7RXfvlGf39QY5NDupFJbEqjyIMkRL0LQYjX9vTF8UXoxW_xj9Z8PwV_IprsCVUQMY';
const API_BASE = 'https://aiapi.tnt-pub.com';

const packages = [
  { amount: 5 },
  { amount: 10 },
  { amount: 20, highlight: true },
  { amount: 50 },
  { amount: 100, bonus: 0.05 },
  { amount: 500, bonus: 0.1 },
];

const Recharge = () => {
  const { t } = useTranslation();
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const { getUserData } = useDashboardData(
    userState,
    userDispatch,
    statusState,
  );

  const quota_per_unit =
    localStorage.getItem('quota_per_unit') || QUOTA_PER_UNIT;

  useEffect(() => {
    // Select default package
    const defaultPkg = packages.find((p) => p.highlight) || packages[0];
    setSelectedPackage(defaultPkg);
  }, []);

  useEffect(() => {
    // Load PayPal SDK if not already loaded
    if (!document.querySelector('#paypal-sdk')) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        showError(t('加载 PayPal 支付模块失败。'));
      };
      document.body.appendChild(script);
    } else {
      if (window.paypal) {
        setPaypalLoaded(true);
      }
    }
  }, []);

  const handleCardClick = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePayClick = () => {
    if (!selectedPackage) {
      showError(t('请选择一个套餐'));
      return;
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-17369711139/XsEZCJSPlugbEKOEw9pA',
        value: 1.0,
        currency: 'USD',
      });
    }

    setShowModal(true);
  };

  const getAmount = () => {
    if (!selectedPackage) return 0;
    return selectedPackage.amount;
  };

  const getWorthAmount = () => {
    const amount = getAmount();
    return amount;
  };

  useEffect(() => {
    if (showModal && paypalLoaded && selectedPackage) {
      const containerId = 'paypal-button-container';
      const container = document.getElementById(containerId);

      if (container) {
        container.innerHTML = '';

        try {
          window.paypal
            .Buttons({
              createOrder: async (data, actions) => {
                try {
                  const amount = getAmount();
                  if (amount <= 0) {
                    showError(t('无效金额'));
                    throw new Error(t('无效金额'));
                  }

                  const response = await fetch(
                    `${API_BASE}/api/paypal/orders`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: userState?.user?.id,
                        cart: [
                          {
                            id: 'topup',
                            quantity: amount,
                          },
                        ],
                      }),
                    },
                  );

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || t('网络响应不正常'));
                  }

                  const order = await response.json();
                  return order.id;
                } catch (err) {
                  console.error('Create Order Error:', err);
                  showError(t('创建订单失败:') + err.message);
                  throw err;
                }
              },
              onApprove: async (data, actions) => {
                try {
                  const response = await fetch(
                    `${API_BASE}/api/paypal/orders/${data.orderID}/capture`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    },
                  );

                  if (!response.ok) {
                    throw new Error(t('支付捕获失败:'));
                  }

                  const orderData = await response.json();
                  const errorDetail = orderData?.details?.[0];

                  if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
                    return actions.restart();
                  } else if (errorDetail) {
                    throw new Error(
                      `${errorDetail.description} (${orderData.debug_id})`,
                    );
                  } else if (!orderData.purchase_units) {
                    throw new Error(JSON.stringify(orderData));
                  } else {
                    if (typeof window.gtag === 'function') {
                      window.gtag('event', 'conversion', {
                        send_to: 'AW-17369711139/WmDvCO3Rwt8bEKOEw9pA',
                        value: getAmount(),
                        currency: 'USD',
                        transaction_id: data.orderID,
                      });
                    }
                    setShowModal(false);
                    setShowSuccessModal(true);
                    getUserData();
                  }
                } catch (err) {
                  console.error('Capture Error:', err);
                  showError(t('支付捕获失败: ') + err.message);
                }
              },
              onError: (err) => {
                console.error('PayPal Error:', err);
                showError(t('PayPal 遇到错误。'));
              },
            })
            .render(`#${containerId}`);
        } catch (err) {
          console.error('Render Error:', err);
        }
      }
    }
  }, [showModal, paypalLoaded, selectedPackage, userState]);

  return (
    <div className='w-full max-w-7xl mx-auto relative min-h-screen lg:min-h-0 mt-[60px] px-2 text-slate-900 dark:text-white'>
      {PAYPAL_CLIENT_ID === 'YOUR_PAYPAL_CLIENT_ID' && (
        <div className='mb-6 p-4 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-500/50 rounded-lg flex items-center gap-3 text-amber-800 dark:text-amber-200'>
          <AlertCircle size={20} />
          <p>
            {t(
              '请在代码中配置您的 PayPal Client ID，以便更准确地显示支付按钮。',
            )}
          </p>
        </div>
      )}

      <div className='w-full flex flex-col lg:flex-row gap-4 rounded-md'>
        {/* Left Section: Pricing Packages */}
        <div className='flex-1 border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 rounded-2xl pt-3 p-4 space-y-4 shadow-sm'>
          <h2 className='text-2xl font-bold'>{t('充值')}</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {packages.map((pkg, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(pkg)}
                className={cn(
                  'group relative cursor-pointer overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl',
                  selectedPackage?.amount === pkg.amount
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500/30'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                )}
              >
                {(pkg.highlight || selectedPackage?.amount === pkg.amount) && (
                  <div
                    className={cn(
                      'absolute left-0 top-0 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-br-lg',
                      selectedPackage?.amount === pkg.amount
                        ? 'bg-red-500'
                        : 'bg-red-600'
                    )}
                  >
                    {selectedPackage?.amount === pkg.amount
                      ? t('已选择')
                      : t('热门')}
                  </div>
                )}

                <div className='flex flex-col h-full justify-between gap-4'>
                  <div className='flex items-center justify-between font-sans'>
                    <div>
                      <div className='text-4xl font-black mb-2 shadow-sm text-slate-900 dark:text-white'>
                        {renderQuota(
                          pkg.amount * quota_per_unit * (1 + (pkg.bonus || 0)),
                        )}
                      </div>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <div className='flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400'>
                        <CheckCircle
                          size={14}
                          className='mt-0.5 text-red-500 shrink-0'
                        />
                        <span>
                          <strong className='text-red-600 dark:text-red-400'>
                            {t('支付')} {pkg.amount} USD
                          </strong>
                        </span>
                      </div>
                      {pkg.bonus && (
                        <div className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight'>
                          <span className='relative flex h-1.5 w-1.5'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500'></span>
                          </span>
                          {pkg.bonus * 100}% {t('额外积分')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex justify-end'>
            <div className='flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10'>
              <div className='flex items-center gap-2'>
                <svg
                  viewBox='0 0 24 24'
                  className='w-10 h-10'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M18.3 5.3c-.2-1-.7-1.8-1.4-2.4C16.2 2.3 15.1 2 13.9 2H6c-.5 0-.9.4-1.1.9l-2.8 17.5c-.1.3 0 .7.3.9.1.1.3.2.5.2h4.5c.4 0 .8-.3 1-.7l.9-5.5c.1-.5.5-.9 1.1-.9h1.1c3.7 0 6.1-1.8 6.9-5.3.4-1.8.3-3.3-.7-4.7z'
                    fill='#003087'
                  />
                  <path
                    d='M18.3 5.3c-.2-1-.7-1.8-1.4-2.4C16.2 2.3 15.1 2 13.9 2H6c-.5 0-.9.4-1.1.9l-2.8 17.5c-.1.3 0 .7.3.9.1.1.3.2.5.2h4.5c.4 0 .8-.3 1-.7l.9-5.5c.1-.5.5-.9 1.1-.9h1.1c3.7 0 6.1-1.8 6.9-5.3.4-1.8.3-3.3-.7-4.7z'
                    fill='#002C87'
                  />
                  <path
                    d='M18.3 5.3c-.2-1-.7-1.8-1.4-2.4C16.2 2.3 15.1 2 13.9 2H6c-.5 0-.9.4-1.1.9l-2.8 17.5v-.1c.2-.9.9-1.5 1.8-1.5h4.1l1.1-7.1c.1-.5.5-.9 1.1-.9h1.1c3.7 0 6.1-1.8 6.9-5.3.4-1.8.3-3.3-.7-4.7z'
                    fill='#003087'
                  />
                  <path
                    d='M12.9 14.4h-1.1c-.6 0-1 .4-1.1.9l-.9 5.5c-.2.4-.6.7-1 .7H4.3c-.2 0-.4-.1-.5-.2-.1-.1-.1-.3-.1-.5l2.8-17.5c.1-.5.6-.9 1.1-.9h7.9c1.2 0 2.3.3 3 .9.7.6 1.2 1.4 1.4 2.4.4 1.8.3 3.3-.7 4.7-1 1.7-2.6 3-4.9 3.8-1.1.4-2.4.6-3.8.6z'
                    fill='#009CDE'
                  />
                </svg>
                <div className='flex flex-col leading-none'>
                  <span className='text-[10px] text-slate-500 dark:text-slate-400 italic font-bold uppercase'>
                    {t('技术支持')}
                  </span>
                  <span className='font-black text-blue-600 dark:text-blue-500 italic text-xl'>
                    PayPal
                  </span>
                </div>
              </div>
              <div className='w-px h-10 bg-slate-200 dark:bg-white/10' />
              <button
                onClick={handlePayClick}
                className='bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20'
              >
                {t('立即支付')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Account Summary */}
        <div className='lg:w-80 w-full shrink-0 border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 rounded-2xl pt-3 p-4 flex flex-col shadow-sm'>
          <h2 className='text-2xl font-bold mb-4'>{t('我的账户')}</h2>
          <div className='flex-1 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-8 flex flex-col items-center text-center shadow-lg'>
            <div
              className='w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-2 border-slate-200 dark:border-white/10 ring-4 ring-white dark:ring-zinc-900 shadow-inner'
              style={{
                backgroundColor: stringToColor(userState?.user?.username || ''),
                color: '#fff',
              }}
            >
              {userState?.user?.username?.slice(0, 2).toUpperCase()}
            </div>

            <h3 className='text-xl font-bold text-slate-900 dark:text-white'>{userState?.user?.username}</h3>
            <p className='text-sm text-slate-500 dark:text-slate-400 mb-6'>
              {userState?.user?.email}
            </p>

            <div className='w-full h-px bg-slate-200 dark:bg-white/10 my-6' />

            <div className='flex w-full items-center justify-between p-4 bg-white dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm'>
              <div className='flex items-center gap-2'>
                <div className='p-2 bg-yellow-500/10 rounded-lg'>
                  <Coins size={18} className='text-yellow-500' />
                </div>
                <span className='font-medium text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider'>
                  {t('余额')}
                </span>
              </div>
              <span className='text-lg font-bold text-red-600 dark:text-red-400'>
                {renderQuota(userState?.user?.quota || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm'>
          <div className='relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10'>
              <h3 className='text-xl font-bold font-sans text-slate-900 dark:text-white'>{t('确认充值')}</h3>
              <button
                onClick={() => setShowModal(false)}
                className='text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-white transition-colors'
              >
                <X size={20} />
              </button>
            </div>

            <div className='p-8'>
              <div className='mb-8 text-center'>
                <p className='text-slate-500 dark:text-neutral-400 mb-2'>{t('支付确认')}</p>
                <div className='text-4xl font-black font-sans text-slate-900 dark:text-white'>
                  {renderQuota(
                    getAmount() *
                      quota_per_unit *
                      (1 + (selectedPackage?.bonus || 0)),
                  )}
                </div>
                <div className='flex items-center justify-center gap-3 mt-3'>
                  <div className='text-sm text-slate-400 dark:text-neutral-500'>
                    {t('应付金额')}: {getAmount()} USD
                  </div>
                  {selectedPackage?.bonus && (
                    <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight'>
                      {selectedPackage.bonus * 100}% {t('额外赠送')}
                    </div>
                  )}
                </div>
              </div>

              <div className='bg-slate-50 dark:bg-white/5 rounded-xl p-6 min-h-[150px] flex flex-col items-center justify-center border border-slate-200 dark:border-white/10'>
                {!paypalLoaded ? (
                  <div className='flex flex-col items-center gap-3 text-slate-400 dark:text-neutral-500'>
                    <div className='w-8 h-8 border-4 border-slate-200 dark:border-neutral-600 border-t-red-500 rounded-full animate-spin' />
                    <p>{t('加载支付选项..')}</p>
                  </div>
                ) : (
                  <div id='paypal-button-container' className='w-full' />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/90 backdrop-blur-md'>
          <div className='relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 text-center'>
            <div className='flex justify-center mb-6'>
              <div className='w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center ring-4 ring-green-500/10 dark:ring-green-900/30'>
                <CheckCircle size={40} className='text-green-500' />
              </div>
            </div>

            <h3 className='text-2xl font-bold mb-2 text-slate-900 dark:text-white'>{t('支付成功！')}</h3>
            <p className='text-slate-500 dark:text-neutral-400 mb-8'>{t('您的账户余额已更新。')}</p>

            <button
              onClick={() => {
                setShowSuccessModal(false);
              }}
              className='w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-600/20'
            >
              {t('继续')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recharge;
