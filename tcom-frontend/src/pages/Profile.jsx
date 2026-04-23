import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/users';
import { XProfile } from '../components/profile/XProfile';

export default function Profile() {
  const { username } = useParams();
  const { data } = useQuery({ queryKey: ['profile', username], queryFn: () => userApi.getByUsername(username) });
  return <div className="container"><XProfile user={data} /></div>;
}
