import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  showSuccess,
  showError,
  renderQuota,
  stringToColor,
} from '../../helpers';
import { UserContext } from '../../context/User';
import { Coins, CheckCircle, X, AlertCircle } from 'lucide-react';

// PLEASE REPLACE WITH YOUR ACTUAL PAYPAL CLIENT ID
const PAYPAL_CLIENT_ID =
  'AZp0F12FiE7f_U8W341aZjsHPnrfT24khK8Jt8uKt8rOqcZ_qDku9UAAmEoWR7u2H6aPUUlZqTffzjM5';
const API_BASE = 'http://170.64.198.229:5000';

const Recharge = () => {
  const { t } = useTranslation();
  const [userState] = useContext(UserContext);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [customAmount, setCustomAmount] = useState(5);

  const packages = [
    {
      amount: 5,
      features: ['50', '5', 'No concurrent tasks.'],
    },
    {
      amount: 10,
      features: ['50', '5', 'Gain 3 concurrent tasks'],
    },
    {
      amount: 20,
      features: ['100', '10', 'Gain 6 concurrent tasks'],
      highlight: true,
    },
    {
      amount: 50,
      features: ['200', '20', 'Gain 12 concurrent tasks'],
    },
    {
      amount: 100,
      features: ['500', '60', 'Gain 100 concurrent tasks'],
    },
    {
      amount: 500,
      features: ['3,000', '600', 'Gain 2,000 concurrent tasks'],
    },
  ];

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
        showError('Failed to load PayPal payment module.');
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
    setShowModal(true);
  };

  const getAmount = () => {
    if (!selectedPackage) return 0;
    return selectedPackage.amount;
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
                    showError('Invalid amount');
                    throw new Error('Invalid amount');
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
                    throw new Error(
                      errorData.message || 'Network response was not ok',
                    );
                  }

                  const order = await response.json();
                  return order.id;
                } catch (err) {
                  console.error('Create Order Error:', err);
                  showError('Failed to create order: ' + err.message);
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
                    throw new Error('Capture failed');
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
                    showSuccess('Payment successful!');
                    setShowModal(false);
                  }
                } catch (err) {
                  console.error('Capture Error:', err);
                  showError('Payment capture failed: ' + err.message);
                }
              },
              onError: (err) => {
                console.error('PayPal Error:', err);
                showError('PayPal encountered an error.');
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
    <div className='w-full max-w-7xl mx-auto relative min-h-screen lg:min-h-0 mt-[60px] px-2'>
      {PAYPAL_CLIENT_ID === 'YOUR_PAYPAL_CLIENT_ID' && (
        <div className='mb-6 p-4 bg-amber-900/40 border border-amber-500/50 rounded-lg flex items-center gap-3 text-amber-200'>
          <AlertCircle size={20} />
          <p>
            Please configure your PayPal Client ID in the code for the payment
            buttons to appear correctly.
          </p>
        </div>
      )}

      <div className='w-full flex flex-col lg:flex-row gap-8  rounded-md'>
        {/* Left Section: Pricing Packages */}
        <div className='flex-1 border border-neutral-700 bg-neutral-800 rounded-2xl pt-3 p-2'>
          <h2 className='text-2xl font-bold mb-4'>Top Up</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {packages.map((pkg, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(pkg)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl ${
                  pkg.highlight
                    ? 'border-red-500 bg-red-900/20 ring-1 ring-red-500/30 border-2'
                    : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-700'
                }`}
              >
                {pkg.highlight && (
                  <div className='absolute left-0 top-0 bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-br-lg'>
                    HOT
                  </div>
                )}

                <div className='flex flex-col h-full justify-between gap-4'>
                  <div className='flex items-center justify-between'>
                    <div className='text-5xl font-black mb-2'>
                      <span className='text-sm align-top mr-1'>$</span>
                      {pkg.amount.toLocaleString()}
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-start gap-2 text-sm text-neutral-400'>
                        <CheckCircle
                          size={14}
                          className='mt-0.5 text-red-500 shrink-0'
                        />
                        <span>
                          <strong className='text-red-400'>
                            {pkg.features[0]}
                          </strong>{' '}
                          images per minute
                        </span>
                      </div>
                      <div className='flex items-start gap-2 text-sm text-neutral-400'>
                        <CheckCircle
                          size={14}
                          className='mt-0.5 text-red-500 shrink-0'
                        />
                        <span>
                          <strong className='text-red-400'>
                            {pkg.features[1]}
                          </strong>{' '}
                          videos per minute
                        </span>
                      </div>
                      {pkg.features[2] && (
                        <div className='flex items-start gap-2 text-sm text-neutral-400'>
                          <CheckCircle
                            size={14}
                            className='mt-0.5 text-red-500 shrink-0'
                          />
                          <span>{pkg.features[2]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Account Summary */}
        <div className='lg:w-80 w-full shrink-0  border border-neutral-700 bg-neutral-800 rounded-2xl pt-3 p-2 flex flex-col'>
          <h2 className='text-2xl font-bold mb-4'>My Account</h2>
          <div className='flex-1 rounded-2xl bg-neutral-900/80 border border-neutral-700 p-8 flex flex-col items-center text-center shadow-lg'>
            <div
              className='w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-2 border-neutral-700 ring-4 ring-neutral-900 shadow-inner'
              style={{
                backgroundColor: stringToColor(userState?.user?.username || ''),
                color: '#fff',
              }}
            >
              {userState?.user?.username?.slice(0, 2).toUpperCase()}
            </div>

            <h3 className='text-xl font-bold'>{userState?.user?.username}</h3>
            <p className='text-sm text-neutral-500 mb-6'>
              {userState?.user?.email}
            </p>

            <div className='w-full h-px bg-neutral-800 my-6' />

            <div className='flex w-full items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50'>
              <div className='flex items-center gap-2'>
                <div className='p-2 bg-yellow-500/10 rounded-lg'>
                  <Coins size={18} className='text-yellow-500' />
                </div>
                <span className='font-medium text-neutral-300 uppercase text-xs tracking-wider'>
                  Balance
                </span>
              </div>
              <span className='text-lg font-bold text-red-400'>
                {renderQuota(userState?.user?.quota || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
          <div className='relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between p-6 border-b border-neutral-700'>
              <h3 className='text-xl font-bold font-sans'>Confirm Recharge</h3>
              <button
                onClick={() => setShowModal(false)}
                className='text-neutral-500 hover:text-white transition-colors'
              >
                <X size={20} />
              </button>
            </div>

            <div className='p-8'>
              <div className='mb-8 text-center'>
                <p className='text-neutral-400 mb-2'>Selected Plan</p>
                <div className='text-4xl font-black'>
                  ${selectedPackage?.amount}
                </div>
              </div>

              {selectedPackage?.isCustom && (
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-neutral-400 mb-2'>
                    Enter Amount ($)
                  </label>
                  <input
                    type='number'
                    min={5}
                    value={customAmount}
                    onChange={(e) =>
                      setCustomAmount(parseFloat(e.target.value))
                    }
                    className='w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold text-xl'
                  />
                </div>
              )}

              <div className='bg-neutral-800/80 rounded-xl p-6 min-h-[150px] flex flex-col items-center justify-center border border-neutral-700/50'>
                {!paypalLoaded ? (
                  <div className='flex flex-col items-center gap-3 text-neutral-500'>
                    <div className='w-8 h-8 border-4 border-neutral-600 border-t-red-500 rounded-full animate-spin' />
                    <p>Loading Payment Options...</p>
                  </div>
                ) : (
                  <div id='paypal-button-container' className='w-full' />
                )}
              </div>

              <div className='mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium'>
                <CheckCircle size={12} />
                Secure payment via PayPal
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recharge;
