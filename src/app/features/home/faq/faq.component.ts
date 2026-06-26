import { Component } from '@angular/core';

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  standalone: false,
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  openIndex: number | null = null;

  faqs: FaqItem[] = [
    {
      q: 'Comment fonctionne Donkoun ?',
      a: 'Donkoun met en relation des expéditeurs et des voyageurs. L\'expéditeur publie une annonce avec les détails de son colis et sa destination. Un voyageur qui se rend au même endroit accepte de le transporter contre une rémunération convenue. Le paiement est sécurisé par la plateforme et libéré à la livraison.'
    },
    {
      q: 'Comment est sécurisé le paiement ?',
      a: 'Le montant est prélevé dès la confirmation et placé en séquestre. Il n\'est libéré au voyageur qu\'après confirmation de la livraison par l\'expéditeur. En cas de litige, notre équipe intervient pour analyser la situation et trancher.'
    },
    {
      q: 'Comment les voyageurs sont-ils vérifiés ?',
      a: 'Chaque voyageur fournit une pièce d\'identité valide et un justificatif de voyage (billet, réservation). Notre équipe valide chaque profil avant activation. Les avis laissés après chaque livraison renforcent la transparence et la confiance au sein de la communauté.'
    },
    {
      q: 'Quels types de colis puis-je envoyer ?',
      a: 'Vous pouvez envoyer des colis personnels, documents, vêtements, cadeaux, produits alimentaires non périssables. Les articles illégaux, dangereux, contrefaits ou soumis à des restrictions douanières particulières sont strictement interdits.'
    },
    {
      q: 'Que se passe-t-il si mon colis n\'arrive pas ?',
      a: 'Contactez notre service client dans les 48 heures suivant la date de livraison prévue. Le paiement reste bloqué en séquestre jusqu\'à résolution du litige. Notre équipe analyse chaque situation et vous accompagne vers une solution.'
    },
    {
      q: 'Puis-je suivre mon colis en temps réel ?',
      a: 'Oui. Une fois votre colis pris en charge, vous recevez des notifications à chaque étape clé : confirmation, départ, arrivée et livraison. Vous pouvez aussi échanger directement avec le voyageur via la messagerie intégrée.'
    }
  ];

  toggle(i: number): void {
    this.openIndex = this.openIndex === i ? null : i;
  }
}
