import React from 'react';
import { useGame } from '@/lib/game-context';
import { useLocation } from 'wouter';
import Layout from '@/components/layout';
import RoleReveal from '@/components/game/role-reveal';
import Discussion from '@/components/game/discussion';
import Voting from '@/components/game/voting';
import Result from '@/components/game/result';

export default function GameRoom() {
  const { state } = useGame();
  const [_, setLocation] = useLocation();

  // Protect route
  React.useEffect(() => {
    if (state.players.length === 0) {
      setLocation('/');
    }
  }, [state.players, setLocation]);

  if (state.players.length === 0) return null;

  const renderPhase = () => {
    switch (state.phase) {
      case 'reveal':
        return <RoleReveal />;
      case 'playing':
        return <Discussion />;
      case 'voting':
        return <Voting />;
      case 'result':
        return <Result />;
      default:
        return <div>Unknown Phase</div>;
    }
  };

  return (
    <Layout>
       {renderPhase()}
    </Layout>
  );
}
