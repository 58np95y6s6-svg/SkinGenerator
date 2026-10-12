import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { AGE_GROUP_LABEL, ageGroup, type CharacterConfig } from '../character/schema';
import { randomize, type LockKey } from '../random/randomize';
import { Stage } from '../scene/Stage';
import { loadCurrent, saveCurrent } from '../storage/current';
import { AccessoriesPanel } from './panels/AccessoriesPanel';
import { BodyPanel } from './panels/BodyPanel';
import { ClothesPanel } from './panels/ClothesPanel';
import { HairPanel } from './panels/HairPanel';
import { IdentityPanel } from './panels/IdentityPanel';
import type { PanelProps } from './panels/types';

const TABS = [
  { id: 'identity', label: 'Identité', icon: '🪪', Panel: IdentityPanel },
  { id: 'body', label: 'Physique', icon: '🧍', Panel: BodyPanel },
  { id: 'hair', label: 'Cheveux', icon: '💇', Panel: HairPanel },
  { id: 'clothes', label: 'Vêtements', icon: '👕', Panel: ClothesPanel },
  { id: 'accessories', label: 'Accessoires', icon: '🕶️', Panel: AccessoriesPanel },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function App() {
  const [cfg, setCfg] = useState<CharacterConfig>(loadCurrent);
  const [locks, setLocks] = useState<ReadonlySet<LockKey>>(new Set());
  const [tab, setTab] = useState<TabId>('identity');
  const [spin, setSpin] = useState(0);
  const viewRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage | null>(null);

  useEffect(() => {
    const stage = new Stage(viewRef.current!);
    stageRef.current = stage;
    return () => stage.dispose();
  }, []);

  // Mise à jour en direct du personnage (une fois par image au maximum).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      stageRef.current?.character.update(cfg);
      saveCurrent(cfg);
    });
    return () => cancelAnimationFrame(id);
  }, [cfg]);

  const set = useCallback((patch: Partial<CharacterConfig>) => {
    setCfg((c) => ({ ...c, ...patch }));
    stageRef.current?.poke();
  }, []);

  const toggleLock = useCallback((k: LockKey) => {
    setLocks((l) => {
      const n = new Set(l);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }, []);

  const roll = () => {
    setCfg((c) => randomize(c, locks));
    setSpin((s) => s + 1);
  };

  const props: PanelProps = { cfg, set, locks, toggleLock };
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div class="app">
      <div class="viewer" ref={viewRef}>
        <div class="brand">
          <span class="logo">✦</span> Skin Generator
        </div>
        <div class="nametag">
          <strong>{cfg.firstName || 'Sans nom'}</strong>
          <span>
            {cfg.age} ans · {AGE_GROUP_LABEL[ageGroup(cfg.age)]}
          </span>
        </div>
        <button class="dice" onClick={roll} aria-label="Personnage aléatoire">
          <span class="dice-ico" key={spin}>
            🎲
          </span>
          <span>Aléatoire</span>
          {locks.size > 0 && <span class="badge">🔒{locks.size}</span>}
        </button>
      </div>
      <div class="panel">
        <nav class="tabs">
          {TABS.map((t) => (
            <button class={`tab ${t.id === tab ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span class="ico">{t.icon}</span>
              <span class="tab-label">{t.label}</span>
            </button>
          ))}
        </nav>
        <div class="panel-body">
          <current.Panel {...props} />
        </div>
      </div>
    </div>
  );
}
