import { fetchFeed, selectFeed } from '@slices/feedSlice';
import {
  fetchIngredients,
  selectIngredientsError,
  selectIngredientsStatus,
} from '@slices/ingredientsSlice';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const feed = useSelector(selectFeed);
  const ingredientsStatus = useSelector(selectIngredientsStatus);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(fetchFeed());

    const intervalId = window.setInterval(() => {
      void dispatch(fetchFeed());
    }, 10000);

    return (): void => {
      window.clearInterval(intervalId);
    };
  }, [dispatch]);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeed());

    if (ingredientsStatus === 'failed') {
      void dispatch(fetchIngredients());
    }
  };

  if (ingredientsStatus === 'failed') {
    return (
      <div>
        <p role="alert">{ingredientsError}</p>
        <button type="button" onClick={handleGetFeeds}>
          Повторить загрузку
        </button>
      </div>
    );
  }

  if (!feed.isLoaded && feed.error) {
    return (
      <div>
        <p role="alert">{feed.error}</p>
        <button type="button" onClick={handleGetFeeds}>
          Повторить загрузку
        </button>
      </div>
    );
  }

  if (
    !feed.isLoaded ||
    ingredientsStatus === 'idle' ||
    ingredientsStatus === 'loading'
  ) {
    return <Preloader />;
  }

  return (
    <>
      {feed.isLoading && <p role="status">Обновляем ленту...</p>}

      {feed.error && <p role="alert">{feed.error}</p>}

      {!feed.orders.length && <p>Заказов пока нет</p>}

      <FeedUI orders={feed.orders} handleGetFeeds={handleGetFeeds} />
    </>
  );
};
