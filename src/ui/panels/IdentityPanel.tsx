import { AGE_GROUP_LABEL, ageGroup, type Sex } from '../../character/schema';
import { randomName } from '../../random/randomize';
import { Section, Segmented, Slider } from '../controls';
import type { PanelProps } from './types';

export function IdentityPanel({ cfg, set, locks, toggleLock }: PanelProps) {
  const lp = { locks, toggleLock };
  return (
    <>
      <Section title="Sexe" lock="sex" {...lp}>
        <Segmented<Sex>
          value={cfg.sex}
          onChange={(sex) => set({ sex })}
          options={[
            { value: 'female', label: 'Femme', icon: '♀' },
            { value: 'male', label: 'Homme', icon: '♂' },
            { value: 'neutral', label: 'Non genré', icon: '⚪' },
          ]}
        />
      </Section>
      <Section
        title="Nom"
        lock="name"
        {...lp}
        aside={
          <button class="mini" onClick={() => set(randomName(cfg.sex))} title="Prénom au hasard">
            🎲
          </button>
        }
      >
        <div class="fields">
          <input class="text" placeholder="Prénom" value={cfg.firstName} onInput={(e) => set({ firstName: (e.target as HTMLInputElement).value })} />
          <input class="text" placeholder="Nom" value={cfg.lastName} onInput={(e) => set({ lastName: (e.target as HTMLInputElement).value })} />
        </div>
      </Section>
      <Section title="Âge" lock="age" {...lp}>
        <Slider value={cfg.age} min={4} max={90} onChange={(age) => set({ age })} label={`${cfg.age} ans · ${AGE_GROUP_LABEL[ageGroup(cfg.age)]}`} />
        <div class="chips">
          {([['Enfant', 8], ['Ado', 16], ['Adulte', 30], ['Senior', 72]] as const).map(([l, a]) => (
            <button class={`chip ${AGE_GROUP_LABEL[ageGroup(cfg.age)] === l ? 'active' : ''}`} onClick={() => set({ age: a })}>
              {l}
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}
