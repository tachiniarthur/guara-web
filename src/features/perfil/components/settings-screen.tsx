"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { StatusToast } from "@/components/states/status-toast";
import { Button } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { pickSettings, useSettings, type Settings } from "@/stores/settings";

import { AppearanceCard, NotificationsCard, SecurityCard } from "./sections";

const subscribeNothing = () => () => {};

const same = (a: Settings, b: Settings) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Configurações: notificações, aparência e segurança. As mudanças ficam num rascunho e só valem
 * ao tocar em "Salvar alterações" ("Descartar" volta ao que estava salvo). Sair da página com
 * mudanças pendentes pede confirmação do navegador.
 */
export function SettingsScreen({ deviceOff }: { deviceOff?: boolean }) {
  const state = useSettings();
  // O salvo vive no navegador: até ler, o formulário mostra o padrão (igual no servidor).
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  return (
    <SettingsForm
      key={hydrated ? "salvo" : "inicial"}
      saved={pickSettings(state)}
      onSave={state.save}
      deviceOff={deviceOff}
    />
  );
}

function SettingsForm({
  saved,
  onSave,
  deviceOff,
}: {
  saved: Settings;
  onSave: (settings: Settings) => void;
  deviceOff?: boolean;
}) {
  const [draft, setDraft] = useState(saved);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const dirty = !same(draft, saved);
  const edit = (patch: Partial<Settings>) => setDraft((current) => ({ ...current, ...patch }));

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save() {
    onSave(draft);
    setSavedAt(Date.now());
  }

  const sections = (suffix: string) => ({
    notifications: <NotificationsCard deviceOff={deviceOff} value={draft} onChange={edit} />,
    appearance: <AppearanceCard idSuffix={suffix} value={draft} onChange={edit} />,
    security: (
      <SecurityCard idSuffix={suffix} value={draft} onChange={edit} className="@desk:grow" />
    ),
  });
  const mobile = sections("m");
  const wide = sections("d");

  return (
    <>
      <header className="hidden flex-wrap items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Configurações
          </h1>
          <p role="status" className="m-0 min-h-5 text-14 text-mist">
            {dirty ? "Você tem alterações que ainda não foram salvas." : "Tudo salvo."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            className="text-15"
            disabled={!dirty}
            onClick={() => setDraft(saved)}
          >
            <span>Descartar</span>
          </Button>
          <Button variant="primary" className="text-15" disabled={!dirty} onClick={save}>
            <Icon name="check" size={18} />
            <span>Salvar alterações</span>
          </Button>
        </div>
      </header>

      {/* Celular: empilhado, com "Salvar" fixo no rodapé. */}
      <div className="flex flex-col gap-4 @tab:hidden">
        {mobile.notifications}
        {mobile.appearance}
        {mobile.security}
      </div>

      {/* Tablet e desktop: notificações e aparência à esquerda, segurança à direita. */}
      <div className="hidden grid-cols-2 items-stretch gap-4 @tab:grid @desk:gap-5">
        <div className="flex min-w-0 flex-col gap-4 @desk:gap-5">
          {wide.notifications}
          {wide.appearance}
        </div>
        <div className="flex min-w-0 flex-col">{wide.security}</div>
      </div>

      <MobileActionBar>
        <Button
          variant="ghost"
          size="xl"
          className="text-16"
          disabled={!dirty}
          onClick={() => setDraft(saved)}
        >
          <span>Descartar</span>
        </Button>
        <Button
          variant="primary"
          size="xl"
          className="min-w-0 grow text-16"
          disabled={!dirty}
          onClick={save}
        >
          <Icon name="check" size={18} />
          <span>Salvar alterações</span>
        </Button>
      </MobileActionBar>

      {savedAt !== null && (
        <StatusToast
          key={savedAt}
          tone="neutral"
          icon="check"
          title="Configurações salvas"
          position="bottom"
        >
          As mudanças já valem em todo o app.
        </StatusToast>
      )}
    </>
  );
}
