import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation de la plateforme Yaaré.",
}

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      description="Ces conditions définissent les règles d'accès et d'utilisation de la plateforme Yaaré."
      updatedAt="27 juin 2026"
    >
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions encadrent l&apos;utilisation de Yaaré, une plateforme de petites
          annonces permettant aux utilisateurs de publier, consulter et gérer des annonces.
        </p>
      </LegalSection>

      <LegalSection title="2. Compte utilisateur">
        <p>
          L&apos;inscription et la connexion se font par numéro de téléphone et code OTP.
          L&apos;utilisateur est responsable de l&apos;exactitude des informations fournies et de la
          confidentialité des
          codes reçus.
        </p>
      </LegalSection>

      <LegalSection title="3. Publication des annonces">
        <p>
          Chaque annonce doit décrire un produit ou service réel, disponible et conforme à la loi.
          Les photos, prix, descriptions et coordonnées doivent être exacts et ne pas induire les
          autres utilisateurs en erreur.
        </p>
      </LegalSection>

      <LegalSection title="4. Contenus interdits">
        <p>
          Sont interdits les contenus frauduleux, diffamatoires, dangereux, contrefaits, illicites,
          discriminatoires ou contraires aux bonnes pratiques de la plateforme.
        </p>
      </LegalSection>

      <LegalSection title="5. Rôle de Yaaré">
        <p>
          Yaaré facilite la mise en relation entre utilisateurs. La plateforme n&apos;est pas partie aux
          transactions conclues directement entre acheteurs et vendeurs.
        </p>
      </LegalSection>

      <LegalSection title="6. Modération">
        <p>
          Yaaré peut refuser, masquer, modifier, suspendre ou supprimer une annonce ou un compte en
          cas de non-respect des règles, de signalement crédible ou de risque pour la communauté.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilité">
        <p>
          Chaque utilisateur reste responsable de ses annonces, échanges, rendez-vous, paiements et
          livraisons. Yaaré ne garantit pas l&apos;identité, la solvabilité ni le comportement des
          utilisateurs.
        </p>
      </LegalSection>

      <LegalSection title="8. Données personnelles">
        <p>
          Les données personnelles sont traitées selon la politique de confidentialité de Yaaré,
          notamment pour l&apos;authentification, la gestion du profil, la publication des annonces et
          la sécurité de la plateforme.
        </p>
      </LegalSection>

      <LegalSection title="9. Modification des conditions">
        <p>
          Yaaré peut mettre à jour ces conditions. La version publiée sur cette page est celle qui
          s&apos;applique à l&apos;utilisation de la plateforme.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
