import { DiscoverContent } from '@/components/discover-content';
import { users } from '@/lib/data';

export default function DiscoverPage() {
  return <DiscoverContent initialUsers={users} />;
}
