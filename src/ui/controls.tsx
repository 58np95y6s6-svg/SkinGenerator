// Petits composants d'interface réutilisables (gros boutons tactiles, pastilles…).

import type { ComponentChildren } from 'preact';
import type { PartDef } from '../character/parts/types';
import type { Styled } from '../character/schema';
import type { LockKey } from '../random/randomize';

export interface LockProps {
  locks: ReadonlySet<LockKey>;
  toggleLock: (k: LockKey) => void;
}

export function Section(props: {
  title: string;
  lock?: LockKey;
  locks?: ReadonlySet<LockKey>;
  toggleLock?: (k: LockKey) => void;
  aside?: ComponentChildren;
  children: ComponentChildren;
}) {
  const locked = props.lock && props.locks?.has(props.lock);
  return (
    <section class="section">
      <header class="section-head">
        <h3>{props.title}</h3>
        {props.aside}
        {props.lock && props.toggleLock && (
          <button
            class={`lock ${locked ? 'on' : ''}`}
            onClick={() => props.toggleLock!(props.lock!)}
            aria-pressed={!!locked}
            title={locked ? 'Verrouillé : ne change pas en aléatoire' : 'Déverrouillé'}
          >
            {locked ? '🔒' : '🔓'}
          </button>
        )}
      </header>
      {props.children}
    </section>
  );
}

export function Segmented<T extends string>(props: {
  value: T;
  options: { value: T; label: string; icon?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div class="segmented">
      {props.options.map((o) => (
        <button class={o.value === props.value ? 'active' : ''} onClick={() => props.onChange(o.value)}>
          {o.icon && <span class="ico">{o.icon}</span>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Swatches(props: { value: string; colors: string[]; onChange: (c: string) => void; custom?: boolean }) {
  const v = props.value.toLowerCase();
  return (
    <div class="swatches">
      {props.colors.map((c) => (
        <button
          class={`swatch ${c.toLowerCase() === v ? 'active' : ''}`}
          style={{ '--c': c }}
          onClick={() => props.onChange(c)}
          aria-label={c}
        />
      ))}
      {props.custom !== false && (
        <label class={`swatch custom ${props.colors.some((c) => c.toLowerCase() === v) ? '' : 'active'}`} style={{ '--c': props.value }}>
          <input type="color" value={props.value} onInput={(e) => props.onChange((e.target as HTMLInputElement).value)} />
          <span>+</span>
        </label>
      )}
    </div>
  );
}

export function OptionGrid(props: { value: string; parts: PartDef[]; onChange: (id: string) => void }) {
  return (
    <div class="options">
      {props.parts.map((p) => (
        <button class={`option ${p.id === props.value ? 'active' : ''}`} onClick={() => props.onChange(p.id)}>
          <span class="ico">{p.icon}</span>
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Slider(props: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <div class="slider">
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onInput={(e) => props.onChange(Number((e.target as HTMLInputElement).value))}
      />
      {props.label && <span class="slider-label">{props.label}</span>}
    </div>
  );
}

/** Sélecteur complet pour une pièce : style + couleur(s). */
export function PartPicker(props: {
  parts: PartDef[];
  value: Styled;
  palette: string[];
  palette2?: string[];
  onChange: (v: Styled) => void;
}) {
  const part = props.parts.find((p) => p.id === props.value.style);
  return (
    <>
      <OptionGrid value={props.value.style} parts={props.parts} onChange={(style) => props.onChange({ ...props.value, style })} />
      {part && part.id !== 'none' && (
        <>
          <p class="sub">Couleur</p>
          <Swatches value={props.value.color} colors={props.palette} onChange={(color) => props.onChange({ ...props.value, color })} />
          {part.twoTone && (
            <>
              <p class="sub">{part.label2 ?? 'Seconde couleur'}</p>
              <Swatches
                value={props.value.color2}
                colors={props.palette2 ?? props.palette}
                onChange={(color2) => props.onChange({ ...props.value, color2 })}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
