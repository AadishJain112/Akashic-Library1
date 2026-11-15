import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../api/cart';
import { useAuth } from '../app/AuthContext';

export function useCartCount() {
  const { user } = useAuth();

  const { data: cart, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
    enabled: Boolean(user),
    staleTime: 1000 * 30, // 30s
    retry: false,
  });

  const count = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return {
    count,
    cart,
    refetchCart: refetch,
  };
}
