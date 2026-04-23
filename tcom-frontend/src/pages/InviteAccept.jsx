import { useParams } from 'react-router-dom';

export default function InviteAccept() {
  const { token } = useParams();
  return <div className="container card">Invite acceptance flow for token: {token}</div>;
}
