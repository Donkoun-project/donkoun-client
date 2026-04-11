# Mon Profil Component

## Description
Le composant `MonProfilComponent` permet aux utilisateurs de consulter et modifier leurs informations de profil personnelles.

## Fonctionnalités

### 📋 Consultation du profil
- **Chargement automatique** : Récupération des données utilisateur au chargement du composant
- **Affichage des informations** : Nom complet, email, téléphone
- **Avatar dynamique** : Initiale du prénom affichée dans un cercle coloré

### ✏️ Modification du profil
- **Formulaire réactif** : Validation en temps réel des champs
- **Champs modifiables** :
  - Nom complet (obligatoire)
  - Email (obligatoire, validation email)
  - Téléphone (obligatoire)
- **Changement de mot de passe** : Section séparée (non implémentée côté API)

### 🔒 Validation et sécurité
- **Validation côté client** : Vérification des formats et champs obligatoires
- **Validation des mots de passe** : Vérification que les nouveaux mots de passe correspondent
- **Authentification** : Vérification du token utilisateur
- **Headers sécurisés** : Envoi du token d'authentification dans les requêtes

## Interface utilisateur

### États d'affichage
- **Chargement** : Spinner avec message "Chargement du profil..."
- **Formulaire** : Interface complète avec tous les champs
- **Mise à jour** : Bouton désactivé avec spinner "Mise à jour en cours..."
- **Messages** : Notifications de succès (vert) et d'erreur (rouge)

### Design
- **Gradient de fond** : Dégradé bleu subtil
- **Carte principale** : Fond blanc avec ombre portée
- **Avatar** : Cercle avec initiale et dégradé bleu
- **Boutons** : Dégradé bleu avec états hover et disabled
- **Responsive** : Adaptation mobile et desktop

## API Integration

### Endpoints utilisés
- **GET** `/api/v1/users/{id}` : Récupération du profil
- **PUT** `/api/v1/users/{id}` : Mise à jour du profil

### Structure des données

#### Requête de mise à jour
```typescript
interface IUpdateUserProfileRequest {
  fullName: string;
  email: string;
  phone: string;
}
```

#### Réponse de mise à jour
```typescript
interface IUpdateUserProfileResponse {
  success: boolean;
  message: string;
  data: IUserProfile;
  error: {
    code: number;
    message: string;
    details: string;
  };
  timestamp: string;
  status: number;
}
```

## Flux de données

### Chargement initial
```
1. ngOnInit() → getCurrentUserId()
2. getUserProfile(userId) → API GET
3. initForm(userData) → Formulaire réactif
4. Affichage du formulaire
```

### Mise à jour du profil
```
1. onSubmit() → Validation du formulaire
2. updateUserProfile(userId, data) → API PUT
3. Mise à jour des données locales
4. updateLocalStorage() → Synchronisation
5. initForm(updatedData) → Réinitialisation
6. Notification de succès
```

## Gestion d'erreurs

### Types d'erreurs gérées
- **Validation** : Champs manquants ou invalides
- **Authentification** : Token expiré ou manquant
- **API** : Erreurs de communication avec le serveur
- **Mots de passe** : Non-correspondance des nouveaux mots de passe

### Notifications
- **Service de notification** : Utilisation de `SharedService.showAlert()`
- **Messages contextuels** : Erreurs spécifiques selon le type d'erreur
- **Feedback visuel** : Couleurs et icônes appropriées

## Tests

### Couverture des tests
- ✅ Chargement du profil
- ✅ Initialisation du formulaire
- ✅ Validation des mots de passe
- ✅ Mise à jour réussie
- ✅ Gestion des erreurs
- ✅ Validation du formulaire
- ✅ Mise à jour du localStorage
- ✅ Extraction de l'ID utilisateur

### Commandes de test
```bash
ng test --include="**/mon-profil.component.spec.ts"
```

## Dépendances

### Services
- `AuthService` : Gestion de l'authentification et des profils
- `TokenService` : Gestion des tokens d'authentification
- `SharedService` : Notifications et utilitaires partagés

### Modules
- `ReactiveFormsModule` : Gestion des formulaires réactifs
- `HttpClientTestingModule` : Tests des appels HTTP

## Améliorations futures

### Fonctionnalités à implémenter
- [ ] **Changement de mot de passe** : API séparée requise
- [ ] **Upload d'avatar** : Possibilité de changer la photo de profil
- [ ] **Validation côté serveur** : Messages d'erreur détaillés
- [ ] **Historique des modifications** : Traçabilité des changements
- [ ] **Confirmation par email** : Vérification lors du changement d'email

### Optimisations
- [ ] **Cache local** : Mise en cache des données de profil
- [ ] **Debounce** : Limitation des appels API pendant la saisie
- [ ] **Offline support** : Fonctionnement hors ligne
- [ ] **Progressive Web App** : Notifications push
