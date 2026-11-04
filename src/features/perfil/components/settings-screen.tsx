"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { StatusToast } from "@/components/states/status-toast";
import { Button } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { pickSettings, useSettings, type Settings } from "@/stores/settings";

import { SectionRow } from "./section-row";
import { AppearanceFields, NotificationsFields, SecurityFields } from "./sections";

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

      {/* Um bloco largo por assunto, um embaixo do outro, em todos os tamanhos. */}
      <SectionRow
        title="Notificações"
        description="Por onde cada aviso chega: notificação no celular, e-mail ou os dois."
      >
        <NotificationsFields deviceOff={deviceOff} value={draft} onChange={edit} />
      </SectionRow>
      <SectionRow
        title="Aparência e acessibilidade"
        description="Tamanho do texto, animações e valores escondidos ao abrir o app."
      >
        <AppearanceFields idSuffix="c" value={draft} onChange={edit} />
      </SectionRow>
      <SectionRow
        title="Segurança e privacidade"
        description="Como você entra, os aparelhos com acesso e os seus dados."
      >
        <SecurityFields idSuffix="c" value={draft} onChange={edit} />
      </SectionRow>

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
