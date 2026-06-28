import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Conditions de vente — Yaaré',
  description:
    'Conditions générales de vente de Yaaré : cadre des transactions, prix, paiements, livraisons et résolution des litiges entre utilisateurs.',
}

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions de vente"
      description="Ces conditions précisent le cadre commercial des services proposés par Yaaré et les règles applicables aux transactions conclues entre utilisateurs sur la plateforme."
      updatedAt="27 juin 2026"
    >
      <LegalSection number={1} title="Champ d'application">
        <p>
          Les présentes conditions générales de vente (CGV) s'appliquent à toutes les annonces
          publiées et à toutes les transactions réalisées entre utilisateurs de la plateforme
          Yaaré. Elles complètent les{' '}
          <Link href="/cgu" className="text-primary font-medium hover:underline">
            conditions d'utilisation
          </Link>{' '}
          et s'appliquent conjointement à ces dernières.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Nature du service de Yaaré">
        <p>
          Yaaré est une plateforme d'intermédiation qui permet à des particuliers et commerçants
          de publier des annonces de vente d'articles ou de services. Yaaré n'est pas vendeur,
          ne stocke pas de marchandises, ne collecte aucun paiement pour le compte des
          utilisateurs et n'intervient pas directement dans les transactions.
        </p>
        <p>
          Les ventes sont conclues directement et librement entre acheteur et vendeur, hors de
          tout contrôle de Yaaré.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Prix et négociation">
        <p>
          Le prix affiché dans une annonce est librement fixé par le vendeur. Il est exprimé en
          francs CFA (XOF) et peut être négocié entre les parties, sauf mention explicite
          "Prix ferme" dans l'annonce.
        </p>
        <p>
          Yaaré ne contrôle pas les prix pratiqués sur la plateforme. En cas de prix
          anormalement bas, soyez vigilant : cela peut être le signe d'une tentative d'arnaque.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Publication et durée des annonces">
        <p>
          La publication d'annonces sur Yaaré est proposée gratuitement dans le cadre standard.
          Les annonces restent en ligne jusqu'à leur suppression par le vendeur ou leur
          désactivation par la modération.
        </p>
        <p>
          Si Yaaré venait à proposer des options payantes (mise en avant, boost, renouvellement
          prioritaire), leurs prix, durées et modalités seraient affichés clairement avant toute
          souscription.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Processus de vente entre utilisateurs">
        <p>La transaction entre acheteur et vendeur suit généralement ces étapes :</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            L'acheteur consulte l'annonce et contacte le vendeur via WhatsApp depuis la page de
            l'annonce.
          </li>
          <li>Les deux parties conviennent du prix définitif, du lieu et du mode de remise.</li>
          <li>L'acheteur inspecte l'article au moment de la remise.</li>
          <li>Le paiement est effectué directement au vendeur.</li>
          <li>Le vendeur retire ou marque l'annonce comme vendue.</li>
        </ol>
        <p>
          Yaaré vous recommande de toujours finaliser les transactions en personne dans un endroit
          sûr et animé.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Paiement et transactions financières">
        <p>
          Yaaré ne propose aucun service de paiement en ligne et ne collecte aucune somme au nom
          des utilisateurs. Les modalités de paiement sont librement définies entre acheteur et
          vendeur (espèces, mobile money, virement, etc.).
        </p>
        <p>Conseils de sécurité financière :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ne versez jamais d'acompte avant d'avoir inspecté l'article.</li>
          <li>Méfiez-vous des vendeurs qui refusent tout contact en personne.</li>
          <li>N'envoyez pas d'argent via Mobile Money à un inconnu avant la remise physique.</li>
          <li>
            Toute demande de paiement anticipé via transfert d'argent est un signal d'alerte.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={7} title="Livraison et remise de l'article">
        <p>
          Les modalités de livraison ou de remise physique sont définies librement entre les
          parties. Yaaré recommande :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>de privilégier les lieux publics et fréquentés pour la remise en main propre ;</li>
          <li>de vérifier l'état et le fonctionnement de l'article avant tout paiement ;</li>
          <li>
            de ne pas communiquer votre adresse personnelle à quelqu'un que vous ne connaissez
            pas.
          </li>
        </ul>
        <p>
          En cas de livraison convenue (à domicile ou via un service de coursier), le vendeur est
          responsable de l'emballage approprié et du respect des conditions annoncées.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Obligations et garanties du vendeur">
        <p>Le vendeur certifie que :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>il est propriétaire de l'article ou dûment autorisé à le vendre ;</li>
          <li>
            la description, l'état et les photos de l'annonce correspondent fidèlement à l'article
            réel ;
          </li>
          <li>le prix est celui pratiqué à la conclusion de la vente ;</li>
          <li>l'article est libre de tout gage, vol ou litige juridique.</li>
        </ul>
        <p>
          En cas de description inexacte ou trompeuse, l'acheteur peut refuser l'article lors de
          la remise. Le vendeur ne peut exiger un paiement pour un article non conforme.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Annulation, rétractation et remboursements">
        <p>
          Yaaré n'impose aucune politique de retour ou de remboursement. Les conditions
          d'annulation, de rétractation ou de remboursement sont convenues librement entre
          acheteur et vendeur avant la transaction.
        </p>
        <p>
          Il est conseillé de clarifier ces conditions à l'avance, notamment pour les articles
          d'occasion dont le retour peut ne pas être possible.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Litiges entre utilisateurs">
        <p>
          En cas de désaccord, les parties sont invitées à tenter une résolution amiable directe.
          Yaaré peut recevoir un signalement pour fraude ou comportement abusif via le formulaire
          de signalement de l'annonce concernée, mais ne peut pas se substituer aux parties pour
          régler un litige commercial.
        </p>
        <p>
          Yaaré se réserve le droit de suspendre ou bannir un utilisateur dont le comportement
          frauduleux est avéré.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Responsabilité de Yaaré dans les transactions">
        <p>
          Yaaré ne peut être tenu responsable des dommages ou pertes résultant d'une transaction
          entre utilisateurs : article non conforme, paiement non reçu, escroquerie entre
          particuliers, litiges de livraison ou tout préjudice lié à la confiance accordée à un
          autre utilisateur.
        </p>
        <p>
          Les utilisateurs utilisent la plateforme à leurs risques dans le cadre des transactions
          qu'ils initient entre eux.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
