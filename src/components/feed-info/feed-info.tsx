import { selectFeed } from '@slices/feedSlice';
import { FeedInfoUI } from '@ui';

import { useSelector } from '@services/store';

import type { TOrder } from '@utils-types';

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((order) => order.status === status)
    .map((order) => order.number)
    .slice(0, 20);

export const FeedInfo = (): React.JSX.Element => {
  const feed = useSelector(selectFeed);

  const readyOrders = getOrders(feed.orders, 'done');
  const pendingOrders = getOrders(feed.orders, 'pending');

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
