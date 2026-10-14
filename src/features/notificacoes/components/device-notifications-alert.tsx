import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/**
 * Notificações desligadas no aparelho (celular e tablet) ou bloqueadas no navegador: mostra o
 * caminho exato nos ajustes; os e-mails continuam chegando.
 */
export function DeviceNotificationsAlert() {
  return (
    <section
      role="alert"
      className="flex items-start gap-3.5 rounded-bubble border border-[#5A4A1A] bg-tucano-bg p-4.5"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tucano-bg text-tucano"
      >
        <Icon name="alert-triangle" />
      </span>
      <div className="flex min-w-0 flex-col gap-2.5">
        <strong className="text-16">
          <span className="md:hidden">As notificações do Guará estão desligadas neste celular</span>
          <span className="hidden md:inline lg:hidden">
            As notificações do Guará estão desligadas neste iPad
          </span>
          <span className="hidden lg:inline">
            As notificações do navegador estão bloqueadas para o Guará
          </span>
        </strong>
        <p className="m-0 text-14 leading-[1.55] text-sand">
          Você não vai receber <span className="md:hidden">no celular</span>
          <span className="hidden md:inline">aqui</span> os avisos de tetos, preços e compras fora
          do padrão. Os e-mails continuam chegando.
        </p>
        <p className="m-0 text-13 text-mist">
          <strong className="text-sand">Para ligar:</strong>{" "}
          <span className="md:hidden">Ajustes › Guará › Notificações › Permitir notificações</span>
          <span className="hidden md:inline lg:hidden">
            Ajustes do iPad › Guará › Notificações › Permitir notificações
          </span>
          <span className="hidden lg:inline">
            Clique no cadeado ao lado do endereço › Notificações › Permitir
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="md" className="lg:hidden">
            <Icon name="external-link" size={18} />
            <span>Abrir ajustes</span>
          </Button>
          <Button variant="primary" size="md" className="hidden lg:inline-flex">
            <Icon name="retry" size={18} />
            <span>Já liberei, testar</span>
          </Button>
          <Button variant="ghost" size="md">
            <span>Agora não</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
