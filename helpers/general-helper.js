'use strict';

class AiutiGenerali {

    static getImmagineProfilo(ruolo) {
        return ruolo === 'admin' ? '/images/admin.png' : '/images/chef_hat.png';
    }

    static getDatiCard(recipe, showActions = false) {
        const diff = (recipe.difficulty || 'facile').toLowerCase();

        const classiCss = {
            'facile': 'bg-success bg-opacity-25 text-success',
            'media': 'bg-warning bg-opacity-25 text-warning',
            'difficile': 'bg-danger bg-opacity-25 text-danger'
        };

        return {
            avatar: this.getImmagineProfilo(recipe.author_role),
            prepTime: recipe.prep_time || 0,
            cookTime: recipe.cook_time || 0,
            difficulty: diff,
            difficultyLabel: recipe.difficulty || 'Facile',
            image: '/images/card.png',
            showActions: !!showActions,
            diffBadgeClass: classiCss[diff]
        };
    }
}

module.exports = AiutiGenerali;
