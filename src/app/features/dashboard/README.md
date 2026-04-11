# Dashboard Component

## Description
Le composant Dashboard fournit un tableau de bord complet pour les utilisateurs connectés, affichant leurs statistiques de trips et leurs 5 derniers voyages.

## Fonctionnalités

### 📊 Statistiques générales
- **Total des trips** : Nombre total de trips créés par l'utilisateur
- **Trips récents** : Nombre de trips récents affichés (maximum 5)

### 📋 Liste des 5 derniers trips
- Affichage des 5 trips les plus récents de l'utilisateur
- Informations détaillées pour chaque trip :
  - Route (ville de départ → ville d'arrivée)
  - Statut avec code couleur
  - Date de départ
  - Prix par unité
  - Quantité disponible
  - Date de création
  - ID du trip

### 📈 Répartition par statut
- Graphique en barres montrant la distribution des trips par statut
- Pourcentages calculés automatiquement
- Statuts supportés :
  - **En attente** (PENDING) - Orange
  - **Validé** (VALIDATE) - Vert
  - **Non validé** (NO_VALIDATE) - Orange foncé
  - **Fermé** (CLOSED_STATUS) - Gris
  - **Rejeté** (REJECTED_STATUS) - Rouge

## Interface utilisateur

### États d'affichage
- **Chargement** : Spinner avec message de chargement
- **Erreur** : Message d'erreur avec bouton de retry
- **Données** : Affichage complet du tableau de bord

### Design responsive
- **Desktop** : Layout en 2 colonnes (trips récents + statistiques)
- **Mobile** : Layout en 1 colonne empilé
- **Tablette** : Adaptation automatique

### Interactions
- **Bouton actualiser** : Recharge les données
- **Hover effects** : Animations sur les cartes
- **Status colorés** : Codes couleur pour les différents statuts

## Utilisation

### Accès
Le dashboard est accessible via la route `/dashboard` et est protégé par l'AuthGuard.

### Navigation
Un lien vers le dashboard est disponible dans le menu utilisateur du header.

### Données
Les données sont récupérées automatiquement au chargement du composant via :
- `AuthService.getCurrentUserId()` : Récupération de l'ID utilisateur
- `TripService.getTripByUserId()` : Récupération des trips de l'utilisateur

## Structure des fichiers

```
dashboard/
├── dashboard.component.ts          # Logique du composant
├── dashboard.component.html        # Template HTML
├── dashboard.component.scss        # Styles CSS
├── dashboard.component.spec.ts     # Tests unitaires
├── dashboard.module.ts             # Module Angular
└── README.md                      # Documentation
```

## Dépendances

- `TripService` : Service pour récupérer les données des trips
- `AuthService` : Service d'authentification
- `AuthGuard` : Guard pour protéger la route
- `ITrip` : Interface TypeScript pour les trips

## Tests

Le composant inclut des tests unitaires complets couvrant :
- Chargement des données
- Gestion des erreurs
- Formatage des dates
- Calcul des statistiques
- Méthodes utilitaires

## Styles

Utilise un design moderne avec :
- **Couleurs** : Palette cohérente avec le thème de l'application
- **Animations** : Transitions fluides et effets hover
- **Typography** : Hiérarchie claire des informations
- **Layout** : Grid responsive et flexbox
