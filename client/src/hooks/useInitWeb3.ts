import { useWeb3React } from '@web3-react/core';
import { uiActions } from '../store/ui-slice';
import { useAppDispatch } from '../store/hooks';
import useEagerConnect from './useEagerConnect';
import useInactiveListener from './useInactiveListener';

const useInitWeb3 = () => {
  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager);

  const dispatch = useAppDispatch();
  const { error } = useWeb3React();

  if (error) {
    dispatch(
      uiActions.setNotification({
        display: true,
        message: error.message,
        type: 'error',
      })
    );
  }
};

export default useInitWeb3;
