import { redirect } from "next/navigation";

/** Os dados agora se editam direto em Meu perfil; o endereço antigo leva para lá. */
export default function EditarPerfilPage() {
  redirect("/perfil");
}
