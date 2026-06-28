import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Confidentialité des données — Yaaré',
  description:
    'Politique de confidentialité de Yaaré : données collectées, finalités du traitement, droits des utilisateurs et sécurité des informations personnelles.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Confidentialité des données"
      description="Nous prenons la protection de vos données personnelles très au sérieux. Cette politique décrit quelles informations Yaaré collecte, pourquoi et comment elles sont utilisées, et quels droits vous avez sur ces données."
      updatedAt="27 juin 2026"
    >
      <LegalSection number={1} title="Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées sur la plateforme
          Yaaré est l'équipe Yaaré, dont le siège est établi à Ouagadougou, Burkina Faso. Pour
          toute question relative à vos données, vous pouvez nous contacter via les coordonnées
          disponibles sur la plateforme.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Données collectées">
        <p>Yaaré peut collecter les catégories de données suivantes :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Données d'identité</strong> : numéro de téléphone, prénom ou nom d'affichage,
            photo de profil ;
          </li>
          <li>
            <strong>Données de localisation</strong> : ville et quartier renseignés sur le profil
            ou dans les annonces ;
          </li>
          <li>
            <strong>Contenus publiés</strong> : annonces, descriptions, photos, prix, catégories ;
          </li>
          <li>
            <strong>Données d'interaction</strong> : annonces mises en favoris, signalements,
            vues d'annonces ;
          </li>
          <li>
            <strong>Données techniques</strong> : adresse IP, type d'appareil, navigateur, horodatages.
          </li>
        </ul>
        <p>
          Nous ne collectons pas de données de paiement : toutes les transactions se font
          directement entre utilisateurs, sans intervention de Yaaré.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Finalités et bases légales du traitement">
        <p>Vos données sont traitées pour les finalités suivantes :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Exécution du service</strong> : création et gestion de votre compte,
            authentification par code OTP, publication et affichage des annonces ;
          </li>
          <li>
            <strong>Sécurité et modération</strong> : détection des fraudes, traitement des
            signalements, prévention des abus ;
          </li>
          <li>
            <strong>Amélioration du service</strong> : analyse des usages agrégés pour optimiser
            les performances et l'expérience utilisateur ;
          </li>
          <li>
            <strong>Communication</strong> : envoi de codes OTP, notifications liées à votre
            compte (si activées).
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Partage des données avec des tiers">
        <p>
          Yaaré ne vend pas vos données personnelles à des tiers. Des données peuvent être
          partagées uniquement avec des prestataires techniques nécessaires au fonctionnement du
          service :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Hébergement et base de données</strong> : Supabase (infrastructure cloud
            sécurisée) ;
          </li>
          <li>
            <strong>Envoi de SMS OTP</strong> : prestataire de messagerie SMS pour l'envoi des
            codes de connexion ;
          </li>
          <li>
            <strong>Stockage d'images</strong> : solution de stockage cloud pour les photos
            d'annonces.
          </li>
        </ul>
        <p>
          Ces prestataires agissent en qualité de sous-traitants et sont tenus de respecter la
          confidentialité de vos données.
        </p>
        <p>
          Yaaré peut également divulguer des données en cas d'obligation légale (réquisition
          judiciaire, autorité compétente) ou pour protéger ses droits légaux.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Transferts internationaux de données">
        <p>
          Les données traitées par nos prestataires techniques peuvent être stockées sur des
          serveurs situés en dehors du Burkina Faso, notamment dans des pays de l'Union
          européenne ou aux États-Unis. Ces transferts sont encadrés par des garanties
          contractuelles appropriées conformément aux standards internationaux de protection des
          données.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Durée de conservation des données">
        <p>
          Vos données sont conservées aussi longtemps que votre compte est actif ou que cela est
          nécessaire pour vous fournir les services Yaaré. En cas de suppression de compte :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            les données de profil et les annonces actives sont supprimées dans un délai
            raisonnable ;
          </li>
          <li>
            certaines données peuvent être conservées plus longtemps pour des raisons légales,
            de sécurité ou de prévention des abus (par exemple, les signalements traités).
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={7} title="Sécurité des données">
        <p>
          Yaaré met en œuvre des mesures techniques et organisationnelles raisonnables pour
          protéger vos données contre tout accès non autorisé, perte ou divulgation :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>chiffrement des communications (HTTPS) ;</li>
          <li>authentification sécurisée par code OTP à usage unique ;</li>
          <li>contrôle d'accès strict aux bases de données (Row Level Security) ;</li>
          <li>clés API sécurisées pour les opérations sensibles.</li>
        </ul>
        <p>
          Vous aussi, protégez votre compte : ne communiquez jamais votre code OTP à quelqu'un
          d'autre, même à une personne se présentant comme membre de l'équipe Yaaré.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Vos droits sur vos données">
        <p>
          Conformément aux lois applicables en matière de protection des données, vous disposez
          des droits suivants :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Droit d'accès</strong> : obtenir une copie des données que nous détenons sur
            vous ;
          </li>
          <li>
            <strong>Droit de rectification</strong> : corriger des informations inexactes ou
            incomplètes ;
          </li>
          <li>
            <strong>Droit à l'effacement</strong> : demander la suppression de vos données dans
            les conditions prévues par la loi ;
          </li>
          <li>
            <strong>Droit à la portabilité</strong> : recevoir vos données dans un format
            structuré et lisible par machine ;
          </li>
          <li>
            <strong>Droit d'opposition</strong> : vous opposer à certains traitements de vos
            données.
          </li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous via les moyens indiqués dans l'application ou
          supprimez votre compte depuis vos paramètres de profil.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Protection des mineurs">
        <p>
          Yaaré n'est pas destiné aux enfants de moins de 13 ans. Si vous avez moins de 18 ans,
          vous devez obtenir l'autorisation d'un parent ou tuteur légal pour créer un compte.
          Nous ne collectons pas intentionnellement de données personnelles concernant des mineurs
          sans autorisation parentale.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Cookies et stockage local">
        <p>
          L'utilisation des cookies et technologies de stockage local est décrite en détail dans
          notre{' '}
          <Link href="/cookies" className="text-primary font-medium hover:underline">
            politique des cookies
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection number={11} title="Modifications de la politique de confidentialité">
        <p>
          Yaaré peut mettre à jour cette politique pour refléter l'évolution des services ou des
          obligations légales. La version en vigueur est celle publiée sur cette page avec sa
          date de mise à jour. En continuant à utiliser Yaaré après une modification, vous
          acceptez la nouvelle version de la politique.
        </p>
      </LegalSection>

      <LegalSection number={12} title="Contact et réclamations">
        <p>
          Pour toute question, demande ou réclamation concernant vos données personnelles,
          contactez notre équipe via les moyens disponibles sur la plateforme. Nous nous
          engageons à répondre dans un délai raisonnable.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
