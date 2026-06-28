import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { LegalPage } from '@/components/legal/LegalPage'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Questions fréquentes — Yaaré',
  description:
    'Toutes les réponses à vos questions sur Yaaré : inscription, annonces, contact vendeur, sécurité et gestion de votre compte.',
}

function FAQItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group border-b border-gray-50 last:border-0">
      <summary className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10 cursor-pointer list-none hover:bg-gray-50/70 transition-colors">
        <span className="font-medium text-gray-900 text-sm sm:text-base">{question}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-6 sm:px-10 text-gray-600 text-sm sm:text-base leading-7 space-y-2">
        {children}
      </div>
    </details>
  )
}

export default function FaqPage() {
  return (
    <LegalPage
      title="Questions fréquentes"
      description="Tout ce que vous devez savoir pour acheter, vendre et utiliser Yaaré en toute confiance."
      updatedAt="27 juin 2026"
    >
      {/* Bloc sans numéro, section titre */}
      <div className="px-6 py-6 sm:px-10 bg-primary/5 border-b border-gray-100">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">
          Réponses aux questions les plus posées
        </p>
      </div>

      <FAQItem question="Qu'est-ce que Yaaré ?">
        <p>
          Yaaré est la première plateforme de petites annonces dédiée au Burkina Faso. Elle
          permet à toute personne de publier gratuitement des articles à vendre, de parcourir des
          milliers d'annonces et de contacter les vendeurs directement via WhatsApp.
        </p>
        <p>
          Notre mission : simplifier les échanges locaux entre particuliers et commerçants, dans
          chaque ville du pays.
        </p>
      </FAQItem>

      <FAQItem question="Qui peut utiliser Yaaré ?">
        <p>
          Toute personne disposant d'un numéro de téléphone mobile burkinabè peut créer un
          compte et utiliser la plateforme. Les mineurs doivent avoir l'autorisation d'un parent
          ou tuteur légal.
        </p>
      </FAQItem>

      <FAQItem question="Comment créer un compte ?">
        <p>
          L'inscription est simple et rapide : entrez votre numéro de téléphone, recevez un code
          à 6 chiffres par SMS, puis complétez votre profil avec votre prénom et votre ville.
          Aucun mot de passe à retenir — la connexion se fait toujours par code OTP.
        </p>
      </FAQItem>

      <FAQItem question="Que faire si je ne reçois pas le code SMS ?">
        <p>
          Vérifiez d'abord que le numéro saisi est correct. Si le SMS n'arrive pas dans les 2
          minutes, attendez la fin du délai d'expiration et faites une nouvelle tentative.
          Assurez-vous d'avoir du réseau et que votre opérateur accepte les SMS courts.
          Contactez notre support si le problème persiste.
        </p>
      </FAQItem>

      <FAQItem question="Comment publier une annonce ?">
        <p>
          Connectez-vous, puis appuyez sur le bouton <strong>Publier une annonce</strong>.
          Renseignez le titre, la description, le prix, la catégorie, la ville et l'état de
          l'article, puis ajoutez jusqu'à 5 photos. Vérifiez les informations et confirmez la
          publication. Votre annonce est visible immédiatement.
        </p>
      </FAQItem>

      <FAQItem question="Combien de photos puis-je ajouter par annonce ?">
        <p>
          Vous pouvez ajouter jusqu'à <strong>5 photos</strong> par annonce. Nous vous
          recommandons d'utiliser des images nettes, bien éclairées et représentatives de
          l'article réel. Les annonces avec photos reçoivent beaucoup plus de contacts.
        </p>
      </FAQItem>

      <FAQItem question="Comment modifier ou supprimer une annonce ?">
        <p>
          Rendez-vous dans votre tableau de bord (icône Profil → Mes annonces). Vous pouvez
          modifier les informations, changer les photos, marquer l'article comme vendu ou
          supprimer définitivement l'annonce.
        </p>
      </FAQItem>

      <FAQItem question="Pendant combien de temps mon annonce reste-t-elle en ligne ?">
        <p>
          Les annonces restent actives jusqu'à ce que vous les supprimiez ou les marquiez comme
          vendues. Nous vous conseillons de retirer les annonces dès que l'article est vendu pour
          éviter des contacts inutiles.
        </p>
      </FAQItem>

      <FAQItem question="Comment contacter un vendeur ?">
        <p>
          Depuis la page d'une annonce, appuyez sur le bouton <strong>Contacter le vendeur</strong>.
          Vous serez redirigé vers WhatsApp avec un message pré-rempli décrivant l'annonce. Vous
          devez être connecté pour contacter un vendeur.
        </p>
        <p>
          Confirmez toujours la disponibilité, le prix et les modalités de remise avant de vous
          déplacer.
        </p>
      </FAQItem>

      <FAQItem question="Yaaré prend-il une commission sur les ventes ?">
        <p>
          Non. La publication d'annonces et les contacts entre utilisateurs sont entièrement
          gratuits. Yaaré ne perçoit aucune commission sur les transactions. Les paiements se
          règlent directement entre l'acheteur et le vendeur.
        </p>
      </FAQItem>

      <FAQItem question="Comment payer en toute sécurité ?">
        <p>
          Yaaré ne gère aucun paiement. Voici nos conseils pour des transactions sûres :
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Préférez les rendez-vous dans des lieux publics et animés.</li>
          <li>Inspectez l'article avant de payer.</li>
          <li>Ne payez jamais à l'avance sans avoir vu l'article.</li>
          <li>Méfiez-vous des prix anormalement bas.</li>
          <li>N'envoyez jamais d'argent via des services de transfert à un inconnu.</li>
        </ul>
      </FAQItem>

      <FAQItem question="Que faire en cas d'annonce suspecte ou d'arnaque ?">
        <p>
          Signalez l'annonce directement depuis sa page en appuyant sur
          &laquo; Signaler cette annonce &raquo;. Notre équipe de modération examine chaque
          signalement. Ne partagez jamais votre code OTP, vos informations bancaires ou votre mot
          de passe avec quelqu'un qui vous le demande.
        </p>
      </FAQItem>

      <FAQItem question="Comment supprimer mon compte ?">
        <p>
          Depuis votre profil, accédez aux paramètres du compte. Vous pouvez demander la
          suppression de votre compte et de vos données. Certaines informations peuvent être
          conservées pour des raisons légales ou de sécurité, conformément à notre{' '}
          <Link href="/privacy" className="text-primary font-medium hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </FAQItem>

      <FAQItem question="Où consulter les règles complètes de la plateforme ?">
        <p>Retrouvez tous nos documents officiels ci-dessous :</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>
            <Link href="/cgu" className="text-primary font-medium hover:underline">
              Conditions d'utilisation
            </Link>{' '}
            — règles générales d'accès à la plateforme
          </li>
          <li>
            <Link href="/cgv" className="text-primary font-medium hover:underline">
              Conditions de vente
            </Link>{' '}
            — cadre commercial des transactions
          </li>
          <li>
            <Link href="/privacy" className="text-primary font-medium hover:underline">
              Confidentialité des données
            </Link>{' '}
            — collecte et utilisation de vos données
          </li>
          <li>
            <Link href="/cookies" className="text-primary font-medium hover:underline">
              Politique des cookies
            </Link>{' '}
            — utilisation des cookies sur Yaaré
          </li>
        </ul>
      </FAQItem>
    </LegalPage>
  )
}
