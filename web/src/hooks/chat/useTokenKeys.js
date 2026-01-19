import { useEffect, useState } from 'react';
import { fetchTokenKeys, getServerAddress } from '../../helpers/token';
import { showError } from '../../helpers';
import { useTranslation } from 'react-i18next';

export function useTokenKeys(id) {
  const { t } = useTranslation();
  const [keys, setKeys] = useState([]);
  const [serverAddress, setServerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      const fetchedKeys = await fetchTokenKeys();
      if (fetchedKeys.length === 0) {
        showError(t('当前没有可用的启用令牌，请确认是否有令牌处于启用状态！'));
        setTimeout(() => {
          window.location.href = '/console/token';
        }, 1500); // 延迟 1.5 秒后跳转
      }
      setKeys(fetchedKeys);
      setIsLoading(false);

      const address = getServerAddress();
      setServerAddress(address);
    };

    loadAllData();
  }, []);

  return { keys, serverAddress, isLoading };
}
