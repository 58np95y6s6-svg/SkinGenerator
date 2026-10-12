import type { CharacterConfig } from '../../character/schema';
import type { LockProps } from '../controls';

export interface PanelProps extends LockProps {
  cfg: CharacterConfig;
  set: (patch: Partial<CharacterConfig>) => void;
}
