import type { Metadata } from 'next'
import { LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Politique des cookies — Yaaré',
  description:
    "Découvrez comment Yaaré utilise les cookies et technologies de stockage pour faire fonctionner la plateforme et améliorer votre expérience.",
}

export default function CookiesPage() {
  return (
    <LegalPage
      title="Politique des cookies"
      description="Cette page explique comment Yaaré utilise les cookies et technologies de stockage local pour faire fonctionner la plateforme, maintenir votre session et améliorer votre expérience."
      updatedAt="27 juin 2026"
    >
      <LegalSection number={1} title="Qu'est-ce qu'un cookie ?">
        <p>
          Un cookie est un petit fichier texte déposé sur votre appareil (téléphone, tablette,
          ordinateur) par un site ou une application web lorsque vous le visitez. Les cookies
          permettent au site de mémoriser vos actions et préférences pendant ou après votre
          visite, afin que vous n'ayez pas à les ressaisir.
        </p>
        <p>
          D'autres technologies similaires — comme le localStorage, le sessionStorage ou les
          tokens de session — remplissent des fonctions comparables et sont également concernées
          par la présente politique.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Comment Yaaré utilise les cookies">
        <p>
          Yaaré utilise des cookies et technologies de stockage exclusivement pour les besoins
          fonctionnels de la plateforme. Nous ne vendons pas vos données à des annonceurs et
          n'utilisons pas de cookies publicitaires tiers de suivi.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Cookies strictement nécessaires">
        <p>
          Ces cookies sont indispensables au bon fonctionnement de Yaaré. Sans eux, certaines
          fonctions essentielles (connexion, formulaires, navigation sécurisée) ne peuvent pas
          fonctionner. Ils ne peuvent pas être désactivés.
        </p>
        <p>Exemples :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cookies de session pour maintenir votre connexion entre les pages ;</li>
          <li>Tokens CSRF pour protéger vos formulaires contre les attaques ;</li>
          <li>Préférences de langue et de région.</li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Cookies d'authentification">
        <p>
          Lorsque vous vous connectez avec votre numéro de téléphone via un code OTP, Yaaré
          stocke un jeton d'authentification sécurisé (token JWT) pour maintenir votre session
          active sans vous redemander un code à chaque page.
        </p>
        <p>
          Ce token est stocké de manière sécurisée et expiré automatiquement après une période
          d'inactivité ou lors de votre déconnexion.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Stockage local (localStorage et sessionStorage)">
        <p>
          En complément des cookies, Yaaré peut utiliser le stockage local de votre navigateur
          pour des fonctions comme :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>mémoriser les annonces récemment consultées ;</li>
          <li>
            éviter de recompter plusieurs fois la même visite sur une annonce (déduplication) ;
          </li>
          <li>conserver temporairement des préférences de recherche ou de filtrage.</li>
        </ul>
        <p>
          Ces données ne quittent pas votre appareil et ne sont pas transmises à nos serveurs.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Cookies d'analyse (si activés)">
        <p>
          Si Yaaré active des outils de mesure d'audience à l'avenir, ils seront utilisés
          uniquement pour comprendre les performances globales du service (pages les plus vues,
          temps de chargement, erreurs). Ces données seront agrégées et anonymisées.
        </p>
        <p>
          Nous n'utilisons pas d'outils d'analyse qui permettent le profilage individuel ou le
          suivi cross-site de nos utilisateurs.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Cookies tiers">
        <p>
          Yaaré n'intègre pas de traceurs publicitaires tiers. Si vous cliquez sur le bouton
          WhatsApp pour contacter un vendeur, vous êtes redirigé vers l'application WhatsApp
          (Meta). Cette application applique sa propre politique de données, indépendamment de
          Yaaré.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Durée de conservation des cookies">
        <p>
          La durée de vie des cookies varie selon leur type :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Cookies de session</strong> : supprimés automatiquement à la fermeture de
            votre navigateur ou de l'application.
          </li>
          <li>
            <strong>Cookies d'authentification</strong> : conservés pour la durée de votre
            session active, généralement quelques jours à quelques semaines.
          </li>
          <li>
            <strong>Données de stockage local</strong> : conservées jusqu'à suppression manuelle
            ou réinitialisation de l'application.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={9} title="Comment gérer vos cookies">
        <p>
          Vous pouvez à tout moment consulter, bloquer ou supprimer les cookies depuis les
          paramètres de votre navigateur ou les réglages de votre application mobile. Les
          principaux navigateurs proposent une gestion des cookies dans leur menu "Paramètres" ou
          "Confidentialité".
        </p>
        <p>
          Attention : bloquer les cookies strictement nécessaires peut empêcher la connexion à
          votre compte Yaaré et rendre la plateforme inutilisable.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Mise à jour de cette politique">
        <p>
          Cette politique des cookies peut être mise à jour pour refléter l'évolution de nos
          pratiques ou des exigences légales. La date de dernière mise à jour est indiquée en
          haut de cette page. Nous vous encourageons à la consulter régulièrement.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
