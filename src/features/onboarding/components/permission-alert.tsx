import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/**
 * Notificações bloqueadas no aparelho (celular e tablet) ou no navegador (computador).
 * Mostra o caminho exato para ligar; o e-mail continua chegando.
 */
export function NotificationPermissionAlert({ className }: { className?: string }) {
  return (
    <div
      role="alert"
      className={`mb-2 flex items-start gap-3 rounded-[1.125rem] border border-[#5A4A1A] bg-tucano-bg px-4 py-3.5 ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-tucano-bg text-tucano"
      >
        <Icon name="alert-triangle" />
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <strong className="text-15">
          <span className="md:hidden">As notificações do Guará estão desligadas neste celular</span>
          <span className="hidden md:inline lg:hidden">
            As notificações do Guará estão desligadas neste iPad
          </span>
          <span className="hidden lg:inline">O navegador bloqueou as notificações do Guará</span>
        </strong>
        <p className="m-0 text-14 leading-normal text-sand">
          Sem a permissão, os avisos de tetos, preços e compras fora do padrão não chegam{" "}
          <span className="md:hidden">no celular</span>
          <span className="hidden md:inline lg:hidden">no iPad</span>
          <span className="hidden lg:inline">neste computador</span>. Por e-mail continuam chegando.
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
          <Button variant="primary" size="sm" className="lg:hidden">
            <Icon name="external-link" size={18} />
            <span>Abrir ajustes</span>
          </Button>
          <Button variant="primary" size="sm" className="hidden lg:inline-flex">
            <Icon name="retry" size={18} />
            <span>Já liberei, testar</span>
          </Button>
          <Button variant="ghost" size="sm">
            <span>Seguir só com e-mail</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
